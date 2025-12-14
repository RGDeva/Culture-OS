#!/bin/bash

# NoCulture OS - AI Analysis Pipeline Setup Script
# This script sets up the complete analysis pipeline

set -e

echo "🎵 NoCulture OS - AI Analysis Pipeline Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# Python Worker
PYTHON_WORKER_URL=http://localhost:8000

# Cyanite API (optional - get from https://cyanite.ai)
# CYANITE_ACCESS_TOKEN=your_token_here

# Groq API (optional - for faster LLM inference)
# GROQ_API_KEY=your_groq_api_key_here
EOF
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check if DATABASE_URL is set
    if ! grep -q "DATABASE_URL" .env.local; then
        echo -e "${YELLOW}⚠️  Adding DATABASE_URL to .env.local...${NC}"
        echo '' >> .env.local
        echo '# Database' >> .env.local
        echo 'DATABASE_URL="file:./prisma/dev.db"' >> .env.local
    fi
    
    # Check if PYTHON_WORKER_URL is set
    if ! grep -q "PYTHON_WORKER_URL" .env.local; then
        echo -e "${YELLOW}⚠️  Adding PYTHON_WORKER_URL to .env.local...${NC}"
        echo '' >> .env.local
        echo '# Python Worker' >> .env.local
        echo 'PYTHON_WORKER_URL=http://localhost:8000' >> .env.local
    fi
fi

echo ""
echo "📦 Step 1: Installing Node.js dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Setting up database..."
npx prisma generate
npx prisma migrate dev --name add_asset_analysis

echo ""
echo "🐍 Step 3: Setting up Python worker..."
cd python-worker

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9+ first.${NC}"
    exit 1
fi

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start the Python worker:"
echo "   cd python-worker"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "2. In another terminal, start Next.js:"
echo "   npm run dev"
echo ""
echo "3. Upload an audio file to /vault and check the Analysis tab!"
echo ""
echo "📚 For more details, see ANALYSIS_SETUP.md"
