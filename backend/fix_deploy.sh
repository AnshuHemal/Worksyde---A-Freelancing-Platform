#!/bin/bash

echo "🔧 Fixing Vercel deployment issues..."

# Check if we're in the backend directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the backend directory."
    exit 1
fi

# Remove any existing Vercel cache
echo "🧹 Clearing Vercel cache..."
rm -rf .vercel

# Check vercel.json content
echo "📄 Current vercel.json content:"
cat vercel.json

# Verify vercel.json is valid JSON
if python -m json.tool vercel.json > /dev/null 2>&1; then
    echo "✅ vercel.json is valid JSON"
else
    echo "❌ vercel.json has invalid JSON format"
    exit 1
fi

# Check for any hidden characters
echo "🔍 Checking for hidden characters in vercel.json..."
hexdump -C vercel.json | head -5

# Deploy with fresh start
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment script completed!" 