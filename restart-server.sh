
#!/bin/bash

echo "🔄 Restarting DocDot server..."

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server/index.ts" 2>/dev/null || echo "No existing processes found"

# Kill anything on port 5000
echo "🔌 Freeing port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "Port 5000 is free"

# Wait a moment
sleep 2

echo "🚀 Starting server..."
npm run dev
