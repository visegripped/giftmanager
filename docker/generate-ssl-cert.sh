#!/bin/bash
# Generate self-signed SSL certificate for local development
# This certificate allows HTTPS connections for Facebook OAuth

set -e

CERT_DIR="docker/ssl"
CERT_FILE="$CERT_DIR/localhost.crt"
KEY_FILE="$CERT_DIR/localhost.key"

# Create SSL directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Check if certificates already exist
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  echo "SSL certificates already exist at $CERT_DIR"
  echo "Delete them first if you want to regenerate."
  exit 0
fi

# Generate self-signed certificate
echo "Generating self-signed SSL certificate for localhost..."
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

# Set appropriate permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "✓ SSL certificates generated successfully!"
echo "  Certificate: $CERT_FILE"
echo "  Private Key: $KEY_FILE"
echo ""
echo "⚠️  Browser Security Warning:"
echo "   Your browser will show a security warning for self-signed certificates."
echo "   This is normal for local development. Click 'Advanced' → 'Proceed to localhost'"
echo "   to continue."
echo ""
echo "📝 To trust the certificate on macOS:"
echo "   1. Open Keychain Access"
echo "   2. Drag $CERT_FILE into 'System' or 'login' keychain"
echo "   3. Double-click the certificate and set 'Trust' → 'Always Trust'"

