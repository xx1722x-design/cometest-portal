@echo off
REM Indie Game Concept Fetcher - Windows Batch Script
REM Harvest game mechanics from indie platforms for Cometest Portal design inspiration

echo.
echo ============================================================================
echo  Indie Game Concept Fetcher
echo  Mining design inspiration from itch.io and Ludum Dare
echo ============================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    echo Remember to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Checking for required Python packages...
python -c "import requests" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing required package: requests...
    python -m pip install requests
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install requests
        echo Try: pip install requests
        pause
        exit /b 1
    )
)

echo.
echo Fetching indie game concepts...
echo (Being respectful to servers with rate limiting)
echo.

python fetch_indie_concepts.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Game concepts saved to indie_game_concepts.csv
    echo.
    echo Opening results...
    timeout /t 2 /nobreak
    start indie_game_concepts.csv
) else (
    echo.
    echo ERROR: Fetcher failed
    pause
)
