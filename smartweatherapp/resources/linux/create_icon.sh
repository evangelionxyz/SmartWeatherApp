#!/bin/bash
# Script to create a simple PNG icon for the Smart Weather App
# This creates a 256x256 placeholder icon with ImageMagick
# Replace this with your actual app icon

if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it or provide your own app_icon.png"
    exit 1
fi

# Create a simple weather-themed icon (cloud with sun)
convert -size 256x256 xc:transparent \
    -fill '#4A90E2' -draw 'circle 128,128 128,50' \
    -fill '#FFD700' -draw 'circle 180,80 180,50' \
    -fill white -font Arial -pointsize 48 -gravity center \
    -annotate +0+20 '☁️' \
    app_icon.png

echo "Created app_icon.png - Replace this with your actual application icon"
