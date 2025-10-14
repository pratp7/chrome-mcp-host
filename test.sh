#!/bin/bash

echo "🚀 Testing Simple MCP Host..."

BASE_URL="http://localhost:3000"

# Test health
echo "Testing health endpoint..."
curl -s "$BASE_URL/health" | grep -q "healthy" && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test tools list
echo "Testing tools endpoint..."
curl -s "$BASE_URL/tools" | grep -q "tools" && echo "✅ Tools endpoint working" || echo "❌ Tools endpoint failed"

# Test navigation
echo "Testing navigation..."
RESPONSE=$(curl -s -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{"tool": "navigate", "arguments": {"url": "https://example.com"}}')

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Navigation test passed"
else
  echo "❌ Navigation test failed"
  echo "Response: $RESPONSE"
fi

echo "🎉 Basic tests completed!"