#!/bin/bash

echo "🚀 Starting Metro Health Demo System..."
echo ""

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -9 -f "vite" 2>/dev/null
pkill -9 -f "nest" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo "Starting backend server..."
cd /Users/lukecaprio/Desktop/metrohealth/backend
npm run start:dev > /tmp/backend-output.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 10

# Check if backend started
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' | grep -q "200\|401"; then
    echo "✅ Backend started successfully on http://localhost:3000/api"
else
    echo "❌ Backend failed to start. Check logs: tail -f /tmp/backend-output.log"
    exit 1
fi

# Start frontend
echo "Starting frontend server..."
cd /Users/lukecaprio/Desktop/metrohealth/app
npm run dev > /tmp/frontend-output.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend to initialize..."
sleep 5

# Check if frontend started
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo "✅ Frontend started successfully on http://localhost:5173"
else
    echo "❌ Frontend failed to start. Check logs: tail -f /tmp/frontend-output.log"
    exit 1
fi

echo ""
echo "================================"
echo "🎉 METRO HEALTH IS READY!"
echo "================================"
echo ""
echo "🌐 Open in browser: http://localhost:5173"
echo ""
echo "📋 Demo Credentials:"
echo "   Patient: john.smith@patient.com / password123"
echo "   Staff:   nurse.williams@hospital.com / password123"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f /tmp/backend-output.log"
echo "   Frontend: tail -f /tmp/frontend-output.log"
echo ""
echo "🛑 To stop servers:"
echo "   pkill -f vite && pkill -f nest"
echo ""

