#!/bin/bash

# Comprehensive Platform Test Script
# Tests all major features and API endpoints

set -e

echo "🧪 NoCulture OS - Platform Test Suite"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Check if servers are running
echo "📋 Test 1: Check Servers"
echo "------------------------"

# Check Next.js
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    test_result 0 "Next.js server running on port 3001"
else
    test_result 1 "Next.js server not running"
    echo -e "${YELLOW}Start with: npm run dev${NC}"
fi

# Check Python worker
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    test_result 0 "Python worker running on port 8001"
    
    # Test health endpoint
    HEALTH=$(curl -s http://localhost:8001/health)
    if echo "$HEALTH" | grep -q "healthy"; then
        test_result 0 "Python worker health check"
    else
        test_result 1 "Python worker health check"
    fi
else
    test_result 1 "Python worker not running"
    echo -e "${YELLOW}Start with: cd python-worker-enhanced && python main.py${NC}"
fi

echo ""
echo "📋 Test 2: API Endpoints"
echo "------------------------"

# Test AI chat endpoint (if OpenAI key is set)
if [ -n "$OPENAI_API_KEY" ]; then
    CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai/chat \
      -H "Content-Type: application/json" \
      -d '{
        "messages": [{"role": "user", "content": "Hello"}],
        "context": {"userId": "test"}
      }' 2>/dev/null)
    
    if echo "$CHAT_RESPONSE" | grep -q "success"; then
        test_result 0 "AI chat endpoint"
    else
        test_result 1 "AI chat endpoint"
    fi
else
    echo -e "${YELLOW}⚠ Skipping AI chat test - OPENAI_API_KEY not set${NC}"
fi

# Test provider search endpoint
PROVIDERS_RESPONSE=$(curl -s http://localhost:3001/api/marketplace/providers 2>/dev/null)
if echo "$PROVIDERS_RESPONSE" | grep -q "providers"; then
    test_result 0 "Provider search endpoint"
else
    test_result 1 "Provider search endpoint"
fi

echo ""
echo "📋 Test 3: File Structure"
echo "------------------------"

# Check critical files exist
FILES=(
    "lib/payments/paymentService.ts"
    "lib/distribution/dspService.ts"
    "lib/ai/assistantService.ts"
    "lib/integrations/platformIntegrations.ts"
    "app/api/bookings/create/route.ts"
    "app/api/ai/chat/route.ts"
    "components/marketplace/BookingWizard.tsx"
    "python-worker-enhanced/main.py"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        test_result 0 "$file exists"
    else
        test_result 1 "$file missing"
    fi
done

echo ""
echo "📋 Test 4: Dependencies"
echo "------------------------"

# Check Node.js dependencies
if npm list stripe > /dev/null 2>&1; then
    test_result 0 "stripe package installed"
else
    test_result 1 "stripe package missing"
fi

if npm list music-metadata > /dev/null 2>&1; then
    test_result 0 "music-metadata package installed"
else
    test_result 1 "music-metadata package missing"
fi

# Check Python dependencies (if venv exists)
if [ -d "python-worker-enhanced/venv" ]; then
    cd python-worker-enhanced
    source venv/bin/activate 2>/dev/null
    
    if python -c "import librosa" 2>/dev/null; then
        test_result 0 "librosa installed"
    else
        test_result 1 "librosa not installed"
    fi
    
    if python -c "import fastapi" 2>/dev/null; then
        test_result 0 "fastapi installed"
    else
        test_result 1 "fastapi not installed"
    fi
    
    deactivate 2>/dev/null
    cd ..
else
    echo -e "${YELLOW}⚠ Python venv not found - skipping Python dependency checks${NC}"
fi

echo ""
echo "📋 Test 5: Database Connection"
echo "------------------------"

# Test Prisma connection
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    test_result 0 "Database connection"
else
    test_result 1 "Database connection"
    echo -e "${YELLOW}Check DATABASE_URL in .env.local${NC}"
fi

echo ""
echo "======================================"
echo "📊 Test Results Summary"
echo "======================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Platform is ready.${NC}"
    echo ""
    echo "🚀 Quick Start:"
    echo "1. Visit http://localhost:3001"
    echo "2. Upload an audio file to /vault"
    echo "3. Run enhanced analysis"
    echo "4. Browse marketplace at /marketplace"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Start Next.js: npm run dev"
    echo "- Start Python worker: cd python-worker-enhanced && python main.py"
    echo "- Check .env.local has all required variables"
    echo "- Run: npx prisma generate && npx prisma migrate dev"
    echo ""
    exit 1
fi
