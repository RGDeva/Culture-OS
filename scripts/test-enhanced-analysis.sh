#!/bin/bash

# Test script for Enhanced Audio Analysis Pipeline
# This script tests all components of the enhanced analysis system

set -e

echo "🎵 NoCulture OS - Enhanced Analysis Test Suite"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "📋 Test 1: Check Python Worker Dependencies"
echo "--------------------------------------------"
cd python-worker-enhanced 2>/dev/null || {
    echo -e "${RED}✗ python-worker-enhanced directory not found${NC}"
    echo "Run: mkdir python-worker-enhanced && cd python-worker-enhanced"
    exit 1
}

if [ -f "requirements.txt" ]; then
    test_result 0 "requirements.txt exists"
else
    test_result 1 "requirements.txt missing"
fi

if [ -f "main.py" ]; then
    test_result 0 "main.py exists"
else
    test_result 1 "main.py missing"
fi

cd ..

echo ""
echo "📋 Test 2: Check Python Virtual Environment"
echo "--------------------------------------------"
if [ -d "python-worker-enhanced/venv" ]; then
    test_result 0 "Virtual environment exists"
else
    echo -e "${YELLOW}⚠ Virtual environment not found${NC}"
    echo "Creating virtual environment..."
    cd python-worker-enhanced
    python3 -m venv venv
    test_result $? "Created virtual environment"
    cd ..
fi

echo ""
echo "📋 Test 3: Install Python Dependencies"
echo "--------------------------------------------"
cd python-worker-enhanced
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    test_result $? "Installed Python dependencies"
    deactivate
else
    test_result 1 "Cannot install - venv missing"
fi
cd ..

echo ""
echo "📋 Test 4: Check Node.js Dependencies"
echo "--------------------------------------------"
if npm list music-metadata > /dev/null 2>&1; then
    test_result 0 "music-metadata installed"
else
    test_result 1 "music-metadata missing"
fi

if npm list file-type > /dev/null 2>&1; then
    test_result 0 "file-type installed"
else
    test_result 1 "file-type missing"
fi

echo ""
echo "📋 Test 5: Check API Routes"
echo "--------------------------------------------"
if [ -f "app/api/analysis/enhanced/route.ts" ]; then
    test_result 0 "Enhanced analysis API route exists"
else
    test_result 1 "Enhanced analysis API route missing"
fi

echo ""
echo "📋 Test 6: Check Library Files"
echo "--------------------------------------------"
if [ -f "lib/audio/audioProcessor.ts" ]; then
    test_result 0 "Audio processor library exists"
else
    test_result 1 "Audio processor library missing"
fi

echo ""
echo "📋 Test 7: Check UI Components"
echo "--------------------------------------------"
if [ -f "components/vault/EnhancedAnalysisPanel.tsx" ]; then
    test_result 0 "EnhancedAnalysisPanel component exists"
else
    test_result 1 "EnhancedAnalysisPanel component missing"
fi

if [ -f "components/vault/AssetDetailModalV2.tsx" ]; then
    test_result 0 "AssetDetailModalV2 component exists"
else
    test_result 1 "AssetDetailModalV2 component missing"
fi

echo ""
echo "📋 Test 8: Start Python Worker (Health Check)"
echo "--------------------------------------------"
echo "Starting Python worker in background..."
cd python-worker-enhanced
source venv/bin/activate
python main.py > /tmp/worker.log 2>&1 &
WORKER_PID=$!
deactivate
cd ..

# Wait for worker to start
sleep 3

# Check if worker is running
if ps -p $WORKER_PID > /dev/null; then
    test_result 0 "Python worker started (PID: $WORKER_PID)"
    
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s http://localhost:8001/health)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        test_result 0 "Health endpoint responding"
    else
        test_result 1 "Health endpoint not responding correctly"
    fi
    
    # Kill worker
    kill $WORKER_PID 2>/dev/null
    test_result 0 "Python worker stopped"
else
    test_result 1 "Python worker failed to start"
    echo "Check /tmp/worker.log for errors"
fi

echo ""
echo "📋 Test 9: Check Next.js Server"
echo "--------------------------------------------"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    test_result 0 "Next.js server is running"
else
    echo -e "${YELLOW}⚠ Next.js server not running${NC}"
    echo "Start with: npm run dev"
    test_result 1 "Next.js server not accessible"
fi

echo ""
echo "📋 Test 10: Test Enhanced Analysis API (if server running)"
echo "--------------------------------------------"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    # This would require an actual asset ID
    echo -e "${YELLOW}⚠ Skipping API test - requires asset ID${NC}"
    echo "To test manually:"
    echo "  curl -X POST http://localhost:3001/api/analysis/enhanced \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"assetId\": \"your_asset_id\"}'"
else
    test_result 1 "Cannot test API - server not running"
fi

echo ""
echo "=============================================="
echo "📊 Test Results Summary"
echo "=============================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! System is ready.${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Start Python worker: cd python-worker-enhanced && source venv/bin/activate && python main.py"
    echo "2. Start Next.js: npm run dev"
    echo "3. Upload an audio file to test"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi
