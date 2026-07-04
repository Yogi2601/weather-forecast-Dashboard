#!/bin/bash

echo "🚀 Starting ngrok tunnel with your auth token..."
echo ""

# Use the full path to ngrok
NGROK_PATH="/c/Users/Owner/AppData/Roaming/npm/node_modules/ngrok/bin/ngrok"

# Start ngrok
$NGROK_PATH http 5175 --authtoken "3FzZtSi0rRLDbE6BEfFW0IdZKEC_6iYwCh9M5yJM1hNcQDFEk" &
NGROK_PID=$!

sleep 5

# Get the tunnel URL
TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | sed 's/"public_url":"//;s/"$//' | head -1)

if [ -n "$TUNNEL_URL" ]; then
  echo "✅ Ngrok Tunnel is Active!"
  echo ""
  echo "🌍 Your Weather Dashboard Public URL:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TUNNEL_URL"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📱 Local access: http://localhost:5175"
  echo ""
  echo "Press Ctrl+C to stop the tunnel."

  wait $NGROK_PID
else
  echo "⏳ Ngrok is initializing..."
  wait $NGROK_PID
fi
