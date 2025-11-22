#!/bin/bash

# Convert Pitch Deck Markdown to PDF

set -e

PITCH_DECK="submission/PITCH_DECK.md"
OUTPUT_PDF="submission/PITCH_DECK.pdf"

echo "📄 Converting Pitch Deck to PDF"
echo "================================"
echo ""

# Check if md-to-pdf is installed
if ! command -v md-to-pdf &> /dev/null; then
    echo "📦 Installing md-to-pdf..."
    npm install -g md-to-pdf
fi

# Check if file exists
if [ ! -f "$PITCH_DECK" ]; then
    echo "❌ Pitch deck not found: $PITCH_DECK"
    exit 1
fi

echo "📝 Converting: $PITCH_DECK"
echo "📄 Output: $OUTPUT_PDF"
echo ""

# Convert to PDF
md-to-pdf "$PITCH_DECK" --pdf-options '{"format": "A4", "margin": {"top": "20mm", "right": "20mm", "bottom": "20mm", "left": "20mm"}}' --output "$OUTPUT_PDF"

if [ -f "$OUTPUT_PDF" ]; then
    echo "✅ PDF created successfully!"
    echo "   Location: $OUTPUT_PDF"
    echo "   Size: $(du -h "$OUTPUT_PDF" | cut -f1)"
    echo ""
    echo "📋 Ready for submission!"
else
    echo "❌ PDF conversion failed"
    echo ""
    echo "💡 Alternative: Use online converter"
    echo "   1. Go to: https://www.markdowntopdf.com/"
    echo "   2. Upload: $PITCH_DECK"
    echo "   3. Download PDF"
    exit 1
fi
