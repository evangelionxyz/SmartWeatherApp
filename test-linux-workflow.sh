#!/bin/bash
# Test Linux build workflow locally

set -e  # Exit on error

echo "======================================"
echo "Testing Linux Build Workflow Locally"
echo "======================================"

# Step 1: Install dependencies (already done, but checking)
echo -e "\n[1/5] Checking dependencies..."
dpkg -l | grep -E "build-essential|cmake|ninja-build|libssl-dev|pkg-config|libwebkit2gtk-4.1-dev" || echo "Some dependencies may be missing"

# Step 2: Setup Node.js (already done)
echo -e "\n[2/5] Checking Node.js..."
node --version
npm --version

# Step 3: Install frontend dependencies and build
echo -e "\n[3/5] Installing frontend dependencies..."
cd smartweatherapp/frontend
npm ci

echo -e "\n[4/5] Building frontend..."
npm run build

# Step 4: Configure and build C++ project
echo -e "\n[5/5] Building C++ project..."
cd ../..
mkdir -p build
cd build

cmake .. \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

cmake --build . -j$(nproc)

echo -e "\n======================================"
echo "Build completed successfully!"
echo "======================================"
echo "Binary location: $(pwd)/bin/SmartWeatherApp"
ls -lh bin/SmartWeatherApp
