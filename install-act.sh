#!/bin/bash
# Install act via direct download (more stable than snap)

set -e

echo "Installing act..."

# Download the latest act binary
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

echo "act installed successfully!"
act --version
