#!/bin/bash

# Comprehensive Feature Test Script
# Tests all platform features end-to-end

set -e

echo "🧪 NoCulture OS - Feature Test Suite"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        ((TESTS_FAILED++))
        return 1
    fi
}

test_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 1: Service Health Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

test_service "Next.js Server" "http://localhost:3001"
test_service "Python Worker" "http://localhost:8001/health"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 2: API Endpoints${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Marketplace endpoints
test_endpoint "Provider Search" "http://localhost:3001/api/marketplace/providers"

# Booking endpoints
test_endpoint "My Bookings" "http://localhost:3001/api/bookings/my-bookings"

# AI endpoints
if [ -n "$GROQ_API_KEY" ] || [ -n "$OPENAI_API_KEY" ]; then
    test_endpoint "AI Chat" "http://localhost:3001/api/ai/chat" "POST" \
        '{"messages":[{"role":"user","content":"Hello"}],"context":{"userId":"test"}}'
else
    echo -e "AI Chat... ${YELLOW}⚠ SKIPPED${NC} (No API key)"
    ((TESTS_SKIPPED++))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 3: Python Worker Features${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Check if Python worker has stem separation
if curl -s http://localhost:8001 | grep -q "separate/stems"; then
    echo -e "Stem Separation Endpoint... ${GREEN}✓ AVAILABLE${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Stem Separation Endpoint... ${RED}✗ NOT AVAILABLE${NC}"
    ((TESTS_FAILED++))
fi

# Check if Python worker has enhanced analysis
if curl -s http://localhost:8001 | grep -q "analyze/enhanced"; then
    echo -e "Enhanced Analysis Endpoint... ${GREEN}✓ AVAILABLE${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Enhanced Analysis Endpoint... ${RED}✗ NOT AVAILABLE${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 4: Environment Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Check critical environment variables
check_env() {
    local var_name=$1
    local description=$2
    
    if [ -n "${!var_name}" ]; then
        echo -e "$description... ${GREEN}✓ SET${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "$description... ${RED}✗ NOT SET${NC}"
        ((TESTS_FAILED++))
    fi
}

check_env "DATABASE_URL" "Database URL"
check_env "CLOUDINARY_CLOUD_NAME" "Cloudinary"
check_env "NEXT_PUBLIC_PRIVY_APP_ID" "Privy Auth"
check_env "PYTHON_WORKER_URL" "Python Worker URL"

# Check optional but recommended
if [ -n "$GROQ_API_KEY" ]; then
    echo -e "Groq API Key... ${GREEN}✓ SET${NC}"
    ((TESTS_PASSED++))
elif [ -n "$OPENAI_API_KEY" ]; then
    echo -e "OpenAI API Key... ${GREEN}✓ SET${NC}"
    ((TESTS_PASSED++))
else
    echo -e "AI API Keys... ${YELLOW}⚠ NONE SET${NC}"
    ((TESTS_SKIPPED++))
fi

if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo -e "Stripe API Key... ${GREEN}✓ SET${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Stripe API Key... ${YELLOW}⚠ NOT SET${NC}"
    ((TESTS_SKIPPED++))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 5: File Structure${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Check critical files
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "$description... ${GREEN}✓ EXISTS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "$description... ${RED}✗ MISSING${NC}"
        ((TESTS_FAILED++))
    fi
}

check_file "components/vault/StemSeparationPanel.tsx" "Stem Separation UI"
check_file "components/vault/EnhancedAnalysisPanel.tsx" "Enhanced Analysis UI"
check_file "components/marketplace/BookingWizard.tsx" "Booking Wizard"
check_file "app/api/stems/separate/route.ts" "Stem Separation API"
check_file "lib/distribution/dspService.ts" "DSP Distribution Service"
check_file "lib/ai/assistantService.ts" "AI Assistant Service"
check_file "python-worker-enhanced/main.py" "Python Worker"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TEST 6: Database Schema${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Check if Prisma client is generated
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "Prisma Client... ${GREEN}✓ GENERATED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Prisma Client... ${RED}✗ NOT GENERATED${NC}"
    echo -e "  ${YELLOW}Run: npx prisma generate${NC}"
    ((TESTS_FAILED++))
fi

# Check if migrations exist
if [ -d "prisma/migrations" ]; then
    echo -e "Database Migrations... ${GREEN}✓ EXISTS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Database Migrations... ${YELLOW}⚠ NONE${NC}"
    echo -e "  ${YELLOW}Run: npx prisma migrate dev${NC}"
    ((TESTS_SKIPPED++))
fi

echo ""
echo "======================================"
echo -e "${BLUE}TEST RESULTS SUMMARY${NC}"
echo "======================================"
echo ""
echo -e "${GREEN}Passed:  $TESTS_PASSED${NC}"
echo -e "${RED}Failed:  $TESTS_FAILED${NC}"
echo -e "${YELLOW}Skipped: $TESTS_SKIPPED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "🎉 Your platform is ready to use!"
    echo ""
    echo "Next steps:"
    echo "  1. Visit http://localhost:3001"
    echo "  2. Upload an audio file to /vault"
    echo "  3. Run enhanced analysis"
    echo "  4. Try stem separation!"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Start Next.js: npm run dev"
    echo "  - Start Python worker: cd python-worker-enhanced && python main.py"
    echo "  - Check .env.local has all required variables"
    echo "  - Run: npx prisma generate && npx prisma migrate dev"
    echo ""
    exit 1
fi
