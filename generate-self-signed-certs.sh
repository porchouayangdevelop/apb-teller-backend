#!/bin/bash

SERVER_IP="10.151.146.155"

# Create directory for certificates if it doesn't exist
mkdir -p ./certs

# Generate a private key
openssl genrsa -out ./certs/privatekey.pem 2048

# Create a configuration file for the certificate
cat > ./certs/openssl.cnf << EOL
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C=US
ST=State
L=City
O=Organization
OU=OrganizationUnit
CN=${SERVER_IP}

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
# Add your server IP below if needed
IP.2 = ${SERVER_IP}
EOL

# Generate a certificate signing request (CSR)
openssl req -new -key ./certs/privatekey.pem -out ./certs/cert.csr -config ./certs/openssl.cnf

# Generate a self-signed certificate
openssl x509 -req -days 365 -in ./certs/cert.csr -signkey ./certs/privatekey.pem -out ./certs/fullchain.pem -extensions v3_req -extfile ./certs/openssl.cnf

echo "Self-signed certificates generated successfully for IP : ${SERVER_IP}"
echo "You can now access your server at https://${SERVER_IP}:443"