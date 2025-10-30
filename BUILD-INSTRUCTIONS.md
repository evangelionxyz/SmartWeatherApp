# ForePlan Build Instructions

## Prerequisites

### System Requirements
- Ubuntu 24.04 LTS (or WSL2 with Ubuntu)
- GCC 13.3 or later
- CMake 4.1 or later
- Node.js 20.x
- npm 10.x

### Install All Dependencies

```bash
# Update package lists
sudo apt-get update

# Install build tools and libraries
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

# Install Node.js 20.x (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

## Building the Project

### 1. Clone the Repository

```bash
git clone https://github.com/evangelionxyz/ForePlan.git
cd ForePlan
```

### 2. Configure and Build Web

```bash
cd foreplan/web
npm install

sudo npm install firebase
sudo npm install -g firebase-tools

npm run build
cd ../..
```

### 3. Configure CMake

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
```

### 4. Build the Application

```bash
cmake --build build --config Release -j$(nproc)
```

### 5. Run the Application

```bash
./build/bin/foreplan
```

## WSL-Specific Notes

### Node.js/npm Path Issue

If you're using WSL and encounter "UNC paths are not supported" errors during `npm install`:

1. **The Problem**: Windows Node.js/npm in PATH conflicts with Linux development
2. **The Solution**: Install Linux version of Node.js (already included in prerequisites)

3. **Verify correct setup**:
   ```bash
   which node  # Should show: /usr/bin/node
   which npm   # Should show: /usr/bin/npm
   node --version  # Should show: v20.x.x
   npm --version   # Should show: 10.x.x
   ```

4. **If you still see Windows paths**:
   ```bash
   # Add to ~/.bashrc
   export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
   
   # Reload shell
   source ~/.bashrc
   
   # Clear command hash
   hash -r
   ```

## Project Structure

```
foreplan/
├── build/                  # CMake build directory (generated)
│   └── bin/               # Compiled binaries
├── foreplan/
│   ├── web/          # React/TypeScript web
│   │   ├── src/          # Web source code
│   │   └── dist/         # Built web (generated)
│   ├── src/              # C++ backend source
│   └── resources/        # Platform-specific resources
└── thirdparty/           # Third-party libraries
    ├── curl/             # HTTP client library
    ├── json/             # JSON parsing library
    └── webview/          # WebView library
```

## Enabled Features

- **SSL Backend**: OpenSSL v3+
- **Protocols**: HTTP, HTTPS, FTP, FTPS, WebSocket, and more
- **Features**: 
  - HTTP/2 support
  - Brotli compression
  - Zstandard compression
  - TLS-SRP authentication
  - IPv6 support
  - Async DNS resolution

## Troubleshooting

### CMake Configuration Fails

If you get "Could NOT find OpenSSL":
```bash
sudo apt-get install libssl-dev
```

If you get "Could NOT find PkgConfig":
```bash
sudo apt-get install pkg-config
```

If you get WebKitGTK errors:
```bash
sudo apt-get install libwebkit2gtk-4.1-dev
```

### Build Fails

Clean and rebuild:
```bash
rm -rf build
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(nproc)
```

### npm install Fails in WSL

See "WSL-Specific Notes" section above.

## CI/CD

The project includes GitHub Actions workflows for automated builds:
- `.github/workflows/linux-build.yml` - Linux/Ubuntu builds

## Support

For issues and questions, please visit:
- GitHub Issues: https://github.com/evangelionxyz/ForePlan/issues
