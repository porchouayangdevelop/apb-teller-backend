#!/bin/bash

# Deployment script for APB Teller API
set -e

HOST_IP="10.1.11.179"
CONTAINER_NAME="teller-api"

echo "🚀 Starting deployment for APB Teller API"
echo "📍 Host IP: $HOST_IP"

# Function to check if container is running
check_container() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        return 0
    else
        return 1
    fi
}

# Function to stop existing container
stop_container() {
    echo "🛑 Stopping existing container..."
    docker-compose down
    echo "✅ Container stopped"
}

# Function to clean up old images
cleanup_images() {
    echo "🧹 Cleaning up old images..."
    docker system prune -f
    echo "✅ Cleanup completed"
}

# Function to check network connectivity
check_network() {
    echo "🔍 Checking network configuration..."
    
    # Check if the IP is available on the host
    if ip addr show | grep -q "$HOST_IP"; then
        echo "✅ Host IP $HOST_IP is available"
    else
        echo "❌ Warning: Host IP $HOST_IP not found on this machine"
        echo "Available IPs:"
        ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1
    fi
    
    # Check if ports are free
    if netstat -tuln | grep -q ":5000 "; then
        echo "⚠️  Port 5000 is already in use"
        netstat -tuln | grep ":5000 "
    else
        echo "✅ Port 5000 is available"
    fi
    
    if netstat -tuln | grep -q ":443 "; then
        echo "⚠️  Port 443 is already in use"
        netstat -tuln | grep ":443 "
    else
        echo "✅ Port 443 is available"
    fi
}

# Function to create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    mkdir -p logs
    mkdir -p certs
    echo "✅ Directories created"
}

# Function to validate SSL certificates
check_ssl() {
    echo "🔐 Checking SSL certificates..."
    if [[ -f "certs/privatekey.pem" && -f "certs/fullchain.pem" ]]; then
        echo "✅ SSL certificates found"
        # Check certificate validity
        if openssl x509 -in certs/fullchain.pem -text -noout | grep -q "10.1.11.179"; then
            echo "✅ Certificate is configured for IP $HOST_IP"
        else
            echo "⚠️  Certificate may not be configured for IP $HOST_IP"
        fi
    else
        echo "⚠️  SSL certificates not found. HTTPS will not be available."
        echo "Run ./generate-self-signed-certs.sh to generate certificates"
    fi
}

# Function to deploy the application
deploy() {
    echo "🚀 Starting deployment..."
    
    # Build and start containers
    docker-compose up -d --build
    
    # Wait for container to start
    echo "⏳ Waiting for container to start..."
    sleep 10
    
    # Check if container is running
    if check_container; then
        echo "✅ Container is running"
        
        # Show container logs
        echo "📋 Container logs:"
        docker logs $CONTAINER_NAME --tail 20
        
        # Show service URLs
        echo ""
        echo "🌐 Service URLs:"
        echo "HTTP:  http://$HOST_IP:5000"
        echo "HTTPS: https://$HOST_IP:443"
        echo "Docs:  http://$HOST_IP:5000/docs"
        echo "Health: http://$HOST_IP:5000/api/v1/health"
        echo ""
        
    else
        echo "❌ Container failed to start"
        echo "📋 Container logs:"
        docker logs $CONTAINER_NAME
        exit 1
    fi
}

# Function to test the deployment
test_deployment() {
    echo "🧪 Testing deployment..."
    
    # Test HTTP endpoint
    if curl -s "http://$HOST_IP:5000/api/v1/health" > /dev/null; then
        echo "✅ HTTP endpoint is responsive"
    else
        echo "❌ HTTP endpoint is not responsive"
    fi
    
    # Test HTTPS endpoint (ignore SSL warnings for self-signed)
    if curl -k -s "https://$HOST_IP:443/api/v1/health" > /dev/null; then
        echo "✅ HTTPS endpoint is responsive"
    else
        echo "⚠️  HTTPS endpoint is not responsive (this is normal if no SSL certificates)"
    fi
}

# Main deployment flow
main() {
    echo "=================================================="
    echo "    APB Teller API Deployment Script"
    echo "=================================================="
    
    # Pre-deployment checks
    check_network
    setup_directories
    check_ssl
    
    # Stop existing container if running
    if check_container; then
        stop_container
    fi
    
    # Clean up old images
    cleanup_images
    
    # Deploy
    deploy
    
    # Test deployment
    test_deployment
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📱 Access your API at: http://$HOST_IP:5000"
    echo "📚 API Documentation: http://$HOST_IP:5000/docs"
    echo ""
    echo "To check logs: docker logs $CONTAINER_NAME -f"
    echo "To stop: docker-compose down"
}

# Run main function
main "$@"