#!/bin/bash
set -e

OCM_VERSION="0.1.0"
OCM_DEB_URL="https://github.com/Gabrielito666/ocm/releases/download/v${OCM_VERSION}/ocm_${OCM_VERSION}_all.deb"

echo "Installing OCM v${OCM_VERSION}..."

# Descargar paquete
curl -fsSL -o /tmp/ocm.deb "$OCM_DEB_URL"

# Instalar
sudo dpkg -i /tmp/ocm.deb || sudo apt-get install -f -y

# Limpiar
rm /tmp/ocm.deb

echo "✓ OCM v${OCM_VERSION} installed successfully"
echo "  Run 'ocm help' to get started"
