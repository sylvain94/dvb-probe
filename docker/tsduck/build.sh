#!/bin/bash

# Script to build TSDuck Docker image from local installation

set -e

echo "Building TSDuck Docker image from local installation..."

# Check if tsp exists
if [ ! -f "/usr/bin/tsp" ]; then
    echo "Error: /usr/bin/tsp not found on the host"
    exit 1
fi

# Detect which base image to use
# Check if system uses glibc (Debian/Ubuntu) or musl (Alpine)
if ldd /usr/bin/tsp 2>/dev/null | grep -q "libc.so"; then
    echo "Detected glibc-based system (Debian/Ubuntu), using Debian base image"
    DOCKERFILE="Dockerfile.debian"
else
    echo "Using Alpine base image (default)"
    DOCKERFILE="Dockerfile"
fi

# Create temporary directory
TMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TMP_DIR"

# Create libs directory for shared libraries
mkdir -p "$TMP_DIR/libs"

# Create a dummy file to ensure directory is not empty (will be overwritten)
touch "$TMP_DIR/libs/.keep"

# Copy TSDuck binary to temp directory
echo "Copying TSDuck binary..."
cp /usr/bin/tsp "$TMP_DIR/"

# Copy TSDuck plugins directory if it exists
if [ -d "/usr/lib/tsduck" ] && [ "$(ls -A /usr/lib/tsduck/*.so 2>/dev/null)" ]; then
    echo "Copying TSDuck plugins..."
    mkdir -p "$TMP_DIR/tsduck_plugins"
    cp -r /usr/lib/tsduck/*.so "$TMP_DIR/tsduck_plugins/" 2>/dev/null || true
    PLUGIN_COUNT=$(find "$TMP_DIR/tsduck_plugins" -name "*.so" 2>/dev/null | wc -l)
    echo "Copied $PLUGIN_COUNT TSDuck plugins"
else
    # Create empty directory to avoid COPY error
    mkdir -p "$TMP_DIR/tsduck_plugins"
    touch "$TMP_DIR/tsduck_plugins/.keep"
    echo "No TSDuck plugins found, creating empty directory"
fi

# Copy TSDuck configuration files from /usr/share/tsduck
if [ -d "/usr/share/tsduck" ] && [ "$(ls -A /usr/share/tsduck 2>/dev/null)" ]; then
    echo "Copying TSDuck configuration files..."
    mkdir -p "$TMP_DIR/tsduck_share"
    cp -r /usr/share/tsduck/* "$TMP_DIR/tsduck_share/" 2>/dev/null || true
    FILE_COUNT=$(find "$TMP_DIR/tsduck_share" -type f 2>/dev/null | wc -l)
    echo "Copied $FILE_COUNT TSDuck configuration files (including tsduck.hfbands.xml)"
else
    # Create empty directory to avoid COPY error
    mkdir -p "$TMP_DIR/tsduck_share"
    touch "$TMP_DIR/tsduck_share/.keep"
    echo "No TSDuck configuration files found, creating empty directory"
fi

# Find and copy all required shared libraries (excluding system libs)
echo "Finding and copying required shared libraries..."
LIB_COUNT=0
ldd /usr/bin/tsp 2>/dev/null | grep "=>" | awk '{print $3}' | while read lib; do
    if [ -f "$lib" ]; then
        # Skip system libraries that should come from the container
        libname=$(basename "$lib")
        if [[ "$libname" == "libc.so.6" ]] || [[ "$libname" == "ld-linux-x86-64.so.2" ]] || [[ "$libname" == "libm.so.6" ]] || [[ "$libname" == "libstdc++.so.6" ]] || [[ "$libname" == "libgcc_s.so.1" ]]; then
            echo "  Skipping system library: $libname"
            continue
        fi
        echo "  Copying $lib"
        cp "$lib" "$TMP_DIR/libs/" 2>/dev/null || true
        LIB_COUNT=$((LIB_COUNT + 1))
    fi
done

# Count copied libraries
LIB_COUNT=$(find "$TMP_DIR/libs" -type f 2>/dev/null | wc -l)
echo "Copied $LIB_COUNT shared libraries"

# Also copy libtsduck.so if it exists in /lib or /usr/lib
for libpath in /lib/libtsduck.so /usr/lib/libtsduck.so; do
    if [ -f "$libpath" ]; then
        echo "  Copying $libpath"
        cp "$libpath" "$TMP_DIR/libs/"
    fi
done

# Copy appropriate Dockerfile
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/$DOCKERFILE" "$TMP_DIR/Dockerfile"

# Build Docker image
echo "Building Docker image with $DOCKERFILE..."
cd "$TMP_DIR"
sudo docker build -t dvb-probe-tsduck:local .

# Cleanup
cd -
rm -rf "$TMP_DIR"

echo ""
echo "TSDuck Docker image built successfully!"
echo "Image name: dvb-probe-tsduck:local"
echo ""
echo "To use it, restart the tsduck service:"
echo "  sudo docker compose -f ../docker-compose.yml up -d tsduck"

