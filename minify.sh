#!/bin/bash

# Pixel Defense Minification Script
# Run this script to create the minified version

echo "🎮 Pixel Defense Minifier"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Run the minification script
node tools/minify.js

echo ""
echo "💡 Tip: You can also run 'node tools/minify.js' directly"