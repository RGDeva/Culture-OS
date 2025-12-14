@echo off
REM NoCulture OS - AI Analysis Pipeline Setup Script (Windows)

echo.
echo 🎵 NoCulture OS - AI Analysis Pipeline Setup
echo ==============================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local not found. Creating from template...
    (
        echo # Database
        echo DATABASE_URL="file:./prisma/dev.db"
        echo.
        echo # Python Worker
        echo PYTHON_WORKER_URL=http://localhost:8000
        echo.
        echo # Cyanite API ^(optional - get from https://cyanite.ai^)
        echo # CYANITE_ACCESS_TOKEN=your_token_here
        echo.
        echo # Groq API ^(optional - for faster LLM inference^)
        echo # GROQ_API_KEY=your_groq_api_key_here
    ) > .env.local
    echo ✅ Created .env.local
) else (
    echo ✅ .env.local exists
)

echo.
echo 📦 Step 1: Installing Node.js dependencies...
call npm install

echo.
echo 🗄️  Step 2: Setting up database...
call npx prisma generate
call npx prisma migrate dev --name add_asset_analysis

echo.
echo 🐍 Step 3: Setting up Python worker...
cd python-worker

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9+ first.
    exit /b 1
)

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🚀 Next steps:
echo.
echo 1. Start the Python worker:
echo    cd python-worker
echo    venv\Scripts\activate.bat
echo    python main.py
echo.
echo 2. In another terminal, start Next.js:
echo    npm run dev
echo.
echo 3. Upload an audio file to /vault and check the Analysis tab!
echo.
echo 📚 For more details, see ANALYSIS_SETUP.md
pause
