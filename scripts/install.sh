#!/bin/bash

set -e

echo "DVB Probe - Installation..."

# Checking if TSDuck is installed
if ! command -v tsp &> /dev/null; then
    echo "Erreur: TSDuck is not installed"
    echo "Install TSDuck from https://tsduck.io/"
    exit 1
fi

echo "TSDuck found: $(tsp --version | head -n 1)"

# Checking if MariaDB/MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "Warning: MariaDB/MySQL client not found in PATH"
    echo "Make sure MariaDB/MySQL is installed and accessible"
fi

# Installing backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Installing frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Creating necessary directories
mkdir -p backend/logs

echo "Installation is complete!"
echo ""
echo "To start the backend:"
echo "  cd backend && npm start"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"

echo "Please refer to the documentation for more information."
echo "https://github.com/sylvain94/dvb-probe/blob/main/docs/README.md"

