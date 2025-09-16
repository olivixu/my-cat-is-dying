#!/bin/bash

# Script to optimize images for web performance
# Requires: imagemagick (brew install imagemagick)

echo "Starting image optimization..."

# Create optimized directory if it doesn't exist
mkdir -p assets/images/optimized

# Function to optimize PNG files
optimize_png() {
    local input="$1"
    local filename=$(basename "$input")
    local output="assets/images/optimized/${filename}"
    
    echo "Optimizing: $filename"
    
    # Convert to PNG with compression
    # -quality 85: Good quality with smaller file size
    # -strip: Remove metadata
    # -resize: Keep original size but recompress
    convert "$input" -strip -quality 85 "$output"
    
    # Show size reduction
    original_size=$(ls -lh "$input" | awk '{print $5}')
    new_size=$(ls -lh "$output" | awk '{print $5}')
    echo "  Original: $original_size → Optimized: $new_size"
}

# Optimize the largest files first
echo "Optimizing large background images..."
optimize_png "assets/images/Gradient-background.png"
optimize_png "assets/images/find-smokey.png"
optimize_png "assets/images/smokey-scene2.png"
optimize_png "assets/images/windowsxp-sky.png"
optimize_png "assets/images/windowsxp-land.png"
optimize_png "assets/images/magnifying-glass.png"

echo ""
echo "Optimizing Smokey sprites..."
optimize_png "assets/images/Smokey-body.png"
optimize_png "assets/images/Smokey-head.png"
optimize_png "assets/images/Smokey-head-back.png"

echo ""
echo "Image optimization complete!"
echo "Optimized images saved in: assets/images/optimized/"
echo ""
echo "To use optimized images, update your code references from:"
echo "  assets/images/[filename].png"
echo "to:"
echo "  assets/images/optimized/[filename].png"