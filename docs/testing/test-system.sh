#!/bin/bash

echo "================================"
echo "🔍 METRO HEALTH SYSTEM DIAGNOSTIC"
echo "================================"
echo ""

echo "1️⃣  BACKEND STATUS"
echo "-------------------"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' 2>&1)
if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "401" ]; then
    echo "✅ Backend API: RUNNING (http://localhost:3000/api)"
else
    echo "❌ Backend API: NOT RESPONDING"
fi

echo ""
echo "2️⃣  FRONTEND STATUS"
echo "-------------------"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>&1)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: RUNNING (http://localhost:5173)"
else
    echo "❌ Frontend: NOT RESPONDING"
fi

echo ""
echo "3️⃣  BACKEND LOGIN TEST"
echo "----------------------"
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"john.smith@patient.com","password":"password123"}' 2>&1)
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Login Endpoint: WORKING"
    echo "   Token received: ${LOGIN_RESPONSE:0:80}..."
else
    echo "❌ Login Endpoint: FAILED"
    echo "   Response: $LOGIN_RESPONSE"
fi

echo ""
echo "4️⃣  FRONTEND HTML CHECK"
echo "-----------------------"
HTML_CONTENT=$(curl -s http://localhost:5173 2>&1)
if echo "$HTML_CONTENT" | grep -q '<div id="root">'; then
    echo "✅ HTML Structure: CORRECT"
    echo "   Found: <div id=\"root\"></div>"
else
    echo "❌ HTML Structure: MISSING ROOT DIV"
fi

if echo "$HTML_CONTENT" | grep -q '/src/main.tsx'; then
    echo "✅ Main Script: LINKED"
else
    echo "❌ Main Script: NOT FOUND"
fi

echo ""
echo "5️⃣  CORS CHECK"
echo "--------------"
CORS_HEADERS=$(curl -s -I -X OPTIONS http://localhost:3000/api/auth/login 2>&1)
if echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin"; then
    echo "✅ CORS: ENABLED"
else
    echo "⚠️  CORS: Headers not found (may need manual check)"
fi

echo ""
echo "================================"
echo "📋 SUMMARY"
echo "================================"
echo ""
echo "Backend:  http://localhost:3000/api"
echo "Frontend: http://localhost:5173"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Open Developer Console (Cmd+Option+I on Mac, F12 on Windows)"
echo "3. Look for any RED error messages"
echo "4. Share the error message for further diagnosis"
echo ""
echo "Demo Credentials:"
echo "  Patient: john.smith@patient.com / password123"
echo "  Staff:   nurse.williams@hospital.com / password123"
echo ""

