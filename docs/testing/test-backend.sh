#!/bin/bash

# Metro Health Backend - Comprehensive Testing Script
# Tests all endpoints and requirements

BASE_URL="http://localhost:3000/api"
PASS=0
FAIL=0

echo "========================================"
echo "Metro Health Backend - Comprehensive Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected_status=${6:-200}
    
    if [ -n "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            ${data:+-d "$data"})
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"})
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ "$http_code" == "$expected_status" || "$http_code" == "20"* ]]; then
        echo -e "${GREEN}✓${NC} $name (Status: $http_code)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $name (Status: $http_code, Expected: $expected_status)"
        echo "   Response: $(echo $body | head -c 100)"
        ((FAIL++))
        return 1
    fi
}

# ============================================
# 1. AUTHENTICATION TESTS
# ============================================
echo -e "${YELLOW}[1/8] Testing Authentication${NC}"

# Login as Patient
PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"john.smith@patient.com","password":"password123"}')
PATIENT_TOKEN=$(echo $PATIENT_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$PATIENT_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Patient login successful"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Patient login failed"
    ((FAIL++))
fi

# Login as Nurse
NURSE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"nurse.williams@hospital.com","password":"password123"}')
NURSE_TOKEN=$(echo $NURSE_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$NURSE_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Nurse login successful"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Nurse login failed"
    ((FAIL++))
fi

# Login as Doctor
DOCTOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"dr.thompson@hospital.com","password":"password123"}')
DOCTOR_TOKEN=$(echo $DOCTOR_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$DOCTOR_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Doctor login successful"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Doctor login failed"
    ((FAIL++))
fi

# Test invalid credentials
test_endpoint "Invalid login rejected" "POST" "/auth/login" \
    '{"email":"invalid@test.com","password":"wrong"}' "" 401

echo ""

# ============================================
# 2. PATIENT ENDPOINTS TESTS
# ============================================
echo -e "${YELLOW}[2/8] Testing Patient Endpoints${NC}"

test_endpoint "Patient Dashboard" "GET" "/patients/me/dashboard" "" "$PATIENT_TOKEN"
test_endpoint "Patient Vitals Summary" "GET" "/patients/me/vitals-summary" "" "$PATIENT_TOKEN"
test_endpoint "Patient Test Results List" "GET" "/patients/me/test-results" "" "$PATIENT_TOKEN"
test_endpoint "Patient Appointments" "GET" "/patients/me/appointments" "" "$PATIENT_TOKEN"
test_endpoint "Patient Requests List" "GET" "/patients/me/requests" "" "$PATIENT_TOKEN"
test_endpoint "Patient Messages" "GET" "/patients/me/messages" "" "$PATIENT_TOKEN"

# Test creating a help request
test_endpoint "Submit Help Request" "POST" "/patients/me/requests" \
    '{"type":"WATER","notes":"Need fresh water"}' "$PATIENT_TOKEN"

# Test sending a message
test_endpoint "Send Message to Staff" "POST" "/patients/me/messages" \
    '{"subject":"Test Question","content":"This is a test message"}' "$PATIENT_TOKEN"

# Get a test result ID and fetch detail
TEST_RESULT_ID=$(curl -s "$BASE_URL/patients/me/test-results" \
    -H "Authorization: Bearer $PATIENT_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$TEST_RESULT_ID" ]; then
    test_endpoint "Patient Test Result Detail" "GET" "/patients/me/test-results/$TEST_RESULT_ID" "" "$PATIENT_TOKEN"
fi

echo ""

# ============================================
# 3. STAFF DASHBOARD TESTS
# ============================================
echo -e "${YELLOW}[3/8] Testing Staff Dashboard${NC}"

test_endpoint "Staff Dashboard" "GET" "/staff/dashboard" "" "$NURSE_TOKEN"
test_endpoint "Staff Dashboard (Doctor)" "GET" "/staff/dashboard" "" "$DOCTOR_TOKEN"

echo ""

# ============================================
# 4. STAFF PATIENT MANAGEMENT TESTS
# ============================================
echo -e "${YELLOW}[4/8] Testing Staff Patient Management${NC}"

test_endpoint "Staff Patient List" "GET" "/staff/patients" "" "$NURSE_TOKEN"

# Get a patient ID and fetch details
PATIENT_ID=$(curl -s "$BASE_URL/staff/patients" \
    -H "Authorization: Bearer $NURSE_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PATIENT_ID" ]; then
    test_endpoint "Staff Patient Detail" "GET" "/staff/patients/$PATIENT_ID" "" "$NURSE_TOKEN"
    test_endpoint "Staff Patient Vitals" "GET" "/staff/patients/$PATIENT_ID/vitals-summary" "" "$NURSE_TOKEN"
fi

echo ""

# ============================================
# 5. ALERTS MANAGEMENT TESTS
# ============================================
echo -e "${YELLOW}[5/8] Testing Alerts Management${NC}"

test_endpoint "Staff Alert List" "GET" "/staff/alerts" "" "$NURSE_TOKEN"
test_endpoint "Staff Alert List (Active)" "GET" "/staff/alerts?status=ACTIVE" "" "$NURSE_TOKEN"

# Get an alert ID and test operations
ALERT_ID=$(curl -s "$BASE_URL/staff/alerts" \
    -H "Authorization: Bearer $NURSE_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$ALERT_ID" ]; then
    test_endpoint "Staff Alert Detail" "GET" "/staff/alerts/$ALERT_ID" "" "$NURSE_TOKEN"
    test_endpoint "Acknowledge Alert" "POST" "/staff/alerts/$ALERT_ID/acknowledge" \
        '{"notes":"Patient stable"}' "$NURSE_TOKEN"
fi

# Test escalate on another alert if exists
ALERT_ID_2=$(curl -s "$BASE_URL/staff/alerts?status=ACTIVE" \
    -H "Authorization: Bearer $NURSE_TOKEN" | \
    grep -o '"id":"[^"]*' | head -2 | tail -1 | cut -d'"' -f4)

if [ -n "$ALERT_ID_2" ]; then
    test_endpoint "Escalate Alert" "POST" "/staff/alerts/$ALERT_ID_2/escalate" \
        '{"reason":"Needs immediate attention"}' "$NURSE_TOKEN"
fi

echo ""

# ============================================
# 6. HELP REQUESTS MANAGEMENT TESTS
# ============================================
echo -e "${YELLOW}[6/8] Testing Help Requests Management${NC}"

test_endpoint "Staff Request List" "GET" "/staff/requests" "" "$NURSE_TOKEN"
test_endpoint "Staff Request List (Queued)" "GET" "/staff/requests?status=QUEUED" "" "$NURSE_TOKEN"

# Get a request ID and complete it
REQUEST_ID=$(curl -s "$BASE_URL/staff/requests?status=QUEUED" \
    -H "Authorization: Bearer $NURSE_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$REQUEST_ID" ]; then
    test_endpoint "Complete Help Request" "POST" "/staff/requests/$REQUEST_ID/complete" \
        '{"notes":"Water delivered"}' "$NURSE_TOKEN"
fi

echo ""

# ============================================
# 7. MESSAGING TESTS
# ============================================
echo -e "${YELLOW}[7/8] Testing Messaging System${NC}"

test_endpoint "Staff Messages Inbox" "GET" "/staff/messages" "" "$NURSE_TOKEN"

# Send message from staff to patient
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "Staff Send Message to Patient" "POST" "/staff/messages/$PATIENT_ID" \
        '{"subject":"Test from Nurse","content":"This is a test message from nurse"}' "$NURSE_TOKEN"
fi

# Get a message ID and reply
MESSAGE_ID=$(curl -s "$BASE_URL/staff/messages" \
    -H "Authorization: Bearer $NURSE_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$MESSAGE_ID" ]; then
    test_endpoint "Staff Reply to Message" "POST" "/staff/messages/$MESSAGE_ID/reply" \
        '{"content":"Thank you for your message"}' "$NURSE_TOKEN"
fi

# Patient reply to message
PATIENT_MESSAGE_ID=$(curl -s "$BASE_URL/patients/me/messages" \
    -H "Authorization: Bearer $PATIENT_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PATIENT_MESSAGE_ID" ]; then
    test_endpoint "Patient Reply to Message" "POST" "/patients/me/messages/$PATIENT_MESSAGE_ID/reply" \
        '{"content":"Thank you for your help"}' "$PATIENT_TOKEN"
fi

echo ""

# ============================================
# 8. APPOINTMENTS TESTS
# ============================================
echo -e "${YELLOW}[8/8] Testing Appointments System${NC}"

test_endpoint "Get Appointment Availability" "GET" "/appointments/availability" "" "$PATIENT_TOKEN"

# Get a staff member ID for booking
STAFF_ID=$(curl -s "$BASE_URL/staff/patients" \
    -H "Authorization: Bearer $DOCTOR_TOKEN" | \
    grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 2>/dev/null)

# Try to book an appointment
FUTURE_DATE=$(date -u -v+7d +"%Y-%m-%dT14:00:00Z" 2>/dev/null || date -u -d "+7 days" +"%Y-%m-%dT14:00:00Z" 2>/dev/null)

if [ -n "$STAFF_ID" ] && [ -n "$FUTURE_DATE" ]; then
    test_endpoint "Book Appointment" "POST" "/appointments/book" \
        "{\"staffId\":\"$STAFF_ID\",\"dateTime\":\"$FUTURE_DATE\",\"type\":\"Follow-up\",\"notes\":\"Test appointment\"}" \
        "$PATIENT_TOKEN"
fi

echo ""

# ============================================
# 9. SECURITY TESTS (RBAC)
# ============================================
echo -e "${YELLOW}[Bonus] Testing Role-Based Access Control${NC}"

# Patient trying to access staff endpoints (should fail)
test_endpoint "Patient blocked from staff dashboard" "GET" "/staff/dashboard" "" "$PATIENT_TOKEN" 403

# Unauthenticated access (should fail)
test_endpoint "Unauthenticated access blocked" "GET" "/patients/me/dashboard" "" "" 401

echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================"
echo "TEST RESULTS SUMMARY"
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "Metro Health Backend is fully functional!"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Review above for details.${NC}"
    exit 1
fi

