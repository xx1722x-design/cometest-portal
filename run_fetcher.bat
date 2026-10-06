@echo off
REM Internet Archive MS-DOS Collection Fetcher - Windows Batch Script
REM Run this to fetch and catalog the MS-DOS games

echo.
echo ============================================================================
echo  Internet Archive MS-DOS Collection Fetcher
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
echo Running MS-DOS Collection Fetcher...
echo.

python fetch_dos_games.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Collection saved to dos_games_catalog.csv
    echo.
    echo Opening catalog file...
    timeout /t 2 /nobreak
    start dos_games_catalog.csv
) else (
    echo.
    echo ERROR: Fetcher failed
    pause
)
