#!/bin/bash
# Test Linux build workflow locally

set -e  # Exit on error

# Environment variables (matching the CI workflow)
BUILD_TYPE=Release

echo "======================================"
echo "Testing Linux Build Workflow Locally"
echo "======================================"

# Step 1: Install dependencies
echo -e "\n[1/6] Installing dependencies..."
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  cmake \
  ninja-build \
  pkg-config \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libglib2.0-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libwebkit2gtk-4.1-0

# Step 2: Setup Node.js (check version)
echo -e "\n[2/6] Checking Node.js..."
node --version
npm --version
echo "Note: Ensure Node.js version 20 or compatible is installed"

# Step 3: Install web dependencies
echo -e "\n[3/6] Installing web dependencies..."
cd foreplan/web
npm install

# Step 4: Build web
echo -e "\n[4/6] Building web..."
npm run build

# Step 5: Configure CMake
echo -e "\n[5/6] Configuring CMake..."
cd ../..
cmake -B build -DCMAKE_BUILD_TYPE=$BUILD_TYPE

# Step 6: Build
echo -e "\n[6/6] Building..."
cmake --build build --config $BUILD_TYPE -j$(nproc)

echo -e "\n======================================"
echo "Build completed successfully!"
echo "======================================"
echo "Artifacts location: build/bin/"
ls -lh build/bin/
