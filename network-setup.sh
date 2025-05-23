#!/bin/bash

# Network setup script for Docker deployment
set -e

HOST_IP="10.1.11.179"
NETWORK_NAME="teller-api_app-network"

echo "🔧 Setting up Docker network configuration for IP: $HOST_IP"

# Function to check if IP exists on host
check_host_ip() {
    echo "🔍 Checking if IP $HOST_IP exists on host..."
    if ip addr show | grep -q "$HOST_IP/"; then
        echo "✅ IP $HOST_IP found on host"
        return 0
    else
        echo "❌ IP $HOST_IP not found on host"
        echo "Available IPs on this host:"
        ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print "  - " $2}' | cut -d/ -f1
        return 1
    fi
}

# Function to setup iptables rules for Docker
setup_iptables() {
    echo "🔥 Setting up iptables rules..."
    
    # Allow Docker to forward traffic to host IP
    sudo iptables -I DOCKER-USER -d $HOST_IP -j ACCEPT
    sudo iptables -I DOCKER-USER -s $HOST_IP -j ACCEPT
    
    # Allow traffic on Docker bridge network
    sudo iptables -I DOCKER-USER -i docker0 -j ACCEPT
    sudo iptables -I DOCKER-USER -o docker0 -j ACCEPT
    
    echo "✅ iptables rules configured"
}

# Function to create Docker bridge network
create_docker_network() {
    echo "🌉 Creating Docker bridge network..."
    
    # Remove existing network if it exists
    if docker network ls | grep -q $NETWORK_NAME; then
        echo "🗑️  Removing existing network..."
        docker network rm $NETWORK_NAME 2>/dev/null || true
    fi
    
    # Create new network with host IP subnet
    docker network create \
        --driver bridge \
        --subnet=10.1.11.0/24 \
        --gateway=10.1.11.1 \
        --opt com.docker.network.bridge.name=docker-teller \
        --opt com.docker.network.bridge.enable_ip_masquerade=true \
        --opt com.docker.network.bridge.enable_icc=true \
        --opt com.docker.network.bridge.host_binding_ipv4=$HOST_IP \
        $NETWORK_NAME
    
    echo "✅ Docker network created: $NETWORK_NAME"
}

# Function to configure Docker daemon
configure_docker_daemon() {
    echo "🐳 Configuring Docker daemon..."
    
    # Create or update daemon.json
    DAEMON_JSON="/etc/docker/daemon.json"
    
    # Backup existing config
    if [[ -f $DAEMON_JSON ]]; then
        sudo cp $DAEMON_JSON $DAEMON_JSON.backup
        echo "📦 Backed up existing Docker daemon config"
    fi
    
    # Create new daemon configuration
    sudo tee $DAEMON_JSON > /dev/null <<EOF
{
  "ip": "$HOST_IP",
  "iptables": true,
  "ip-forward": true,
  "ip-masq": true,
  "userland-proxy": false,
  "experimental": false,
  "live-restore": true
}
EOF
    
    echo "✅ Docker daemon configured"
    echo "⚠️  Docker daemon restart required"
}

# Function to restart Docker service
restart_docker() {
    echo "🔄 Restarting Docker service..."
    sudo systemctl restart docker
    sleep 5
    
    if sudo systemctl is-active docker >/dev/null; then
        echo "✅ Docker service restarted successfully"
    else
        echo "❌ Failed to restart Docker service"
        exit 1
    fi
}

# Function to test network connectivity
test_network() {
    echo "🧪 Testing network configuration..."
    
    # Test if we can reach the host IP from container
    docker run --rm --network $NETWORK_NAME alpine:latest ping -c 1 $HOST_IP && \
        echo "✅ Container can reach host IP" || \
        echo "❌ Container cannot reach host IP"
    
    # Test port binding
    if netstat -tuln | grep "$HOST_IP:5000" >/dev/null; then
        echo "✅ Port 5000 bound to host IP"
    else
        echo "ℹ️  Port 5000 not yet bound (normal if container not running)"
    fi
}

# Function to show network information
show_network_info() {
    echo ""
    echo "📊 Network Configuration Summary:"
    echo "=================================="
    echo "Host IP: $HOST_IP"
    echo "Docker Network: $NETWORK_NAME"
    echo "Subnet: 10.1.11.0/24"
    echo "Gateway: 10.1.11.1"
    echo "Container IP: 10.1.11.10"
    echo ""
    echo "Port Bindings:"
    echo "- HTTP:  $HOST_IP:5000 → container:5000"
    echo "- HTTPS: $HOST_IP:443 → container:443"
    echo ""
}

# Main function
main() {
    echo "=================================================="
    echo "    Docker Network Setup for APB Teller API"
    echo "=================================================="
    
    # Check if running as root for iptables
    if [[ $EUID -ne 0 ]]; then
        echo "⚠️  This script requires sudo access for iptables configuration"
    fi
    
    # Check host IP
    if ! check_host_ip; then
        echo "❌ Please ensure IP $HOST_IP is configured on this host before proceeding"
        exit 1
    fi
    
    # Setup network configuration
    setup_iptables
    create_docker_network
    configure_docker_daemon
    
    # Ask before restarting Docker
    read -p "🔄 Restart Docker service now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        restart_docker
        test_network
    else
        echo "⚠️  Please restart Docker manually: sudo systemctl restart docker"
    fi
    
    show_network_info
    
    echo "✅ Network setup completed!"
    echo "📝 You can now run: ./deploy.sh"
}

# Run main function
main "$@"