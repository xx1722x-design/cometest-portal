@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo Auto-Hunter and Deployment Pipeline
echo GitHub HTML5 Games to Occult Theme to Auto-Deploy
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.8 and add to PATH.
    pause
    exit /b 1
)
echo OK: Python found

echo.
echo [2/3] Verifying dependencies...
python -m pip show groq >nul 2>&1
if errorlevel 1 (
    echo Installing missing dependencies...
    python -m pip install -q requests groq python-dotenv playwright
    python -m playwright install chromium --with-deps
)
echo OK: Dependencies ready

echo.
echo [3/3] Launching Auto-Hunter Pipeline...
echo.

python scripts/auto_hunter.py

if errorlevel 1 (
    echo.
    echo ERROR: Pipeline failed. Check output above.
) else (
    echo.
    echo SUCCESS: Pipeline completed!
    echo Check Vercel deployment: https://cometest.com
)

echo.
pause
