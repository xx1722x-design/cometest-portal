@echo off
REM Master Upload Pipeline
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Change to script directory
cd /d "%~dp0"
set SCRIPTS_DIR=%CD%

cls
echo.
echo ================================================
echo Master Upload Hero Pipeline
echo ================================================
echo.
echo Current directory: %SCRIPTS_DIR%
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads
    pause
    exit /b 1
)
echo [OK] Python installed
echo.

REM ================================================
REM STEP 1: ZIP Integrity Check
REM ================================================
echo [1/5] Checking ZIP files...
pause

if exist "check_zip_integrity.py" (
    python check_zip_integrity.py
    if errorlevel 1 (
        echo [WARNING] ZIP check had errors
    ) else (
        echo [OK] ZIP check completed
    )
) else (
    echo [ERROR] check_zip_integrity.py not found
    echo Location: %SCRIPTS_DIR%\check_zip_integrity.py
)
echo.
pause

REM ================================================
REM STEP 2: AI Metadata Generation
REM ================================================
echo [2/5] Generating AI metadata...
pause

if exist "update_games_metadata_groq.py" (
    echo Running update_games_metadata_groq.py...
    python update_games_metadata_groq.py
    if errorlevel 1 (
        echo [WARNING] Metadata generation had errors
    ) else (
        echo [OK] Metadata generation completed
    )
) else (
    echo [ERROR] update_games_metadata_groq.py not found
    echo Location: %SCRIPTS_DIR%\update_games_metadata_groq.py
)
echo.
pause

REM ================================================
REM STEP 3: Screenshot Capture
REM ================================================
echo [3/5] Capturing game screenshots...
pause

if exist "capture_existing_games.py" (
    echo Running capture_existing_games.py...
    python capture_existing_games.py
    if errorlevel 1 (
        echo [WARNING] Screenshot capture had errors
    ) else (
        echo [OK] Screenshot capture completed
    )
) else (
    echo [ERROR] capture_existing_games.py not found
    echo Location: %SCRIPTS_DIR%\capture_existing_games.py
)
echo.
pause

REM ================================================
REM STEP 4: Hero UI Application
REM ================================================
echo [4/5] Applying Hero UI...
pause

if exist "apply_hero_ui.py" (
    echo Running apply_hero_ui.py...
    python apply_hero_ui.py
    if errorlevel 1 (
        echo [WARNING] Hero UI application had errors
    ) else (
        echo [OK] Hero UI applied
    )
) else (
    echo [ERROR] apply_hero_ui.py not found
    echo Location: %SCRIPTS_DIR%\apply_hero_ui.py
)
echo.
pause

REM ================================================
REM STEP 5: Final Deployment
REM ================================================
echo [5/5] Final deployment...
pause

if exist "업로드_실행.bat" (
    echo Running upload script...
    call 업로드_실행.bat
    echo [OK] Deployment completed
) else (
    echo [INFO] Upload script not found (optional step)
)
echo.

REM ================================================
REM SUCCESS
REM ================================================
cls
echo.
echo ================================================
echo SUCCESS - All steps completed!
echo ================================================
echo.
echo Next steps:
echo 1. Open browser: http://localhost:3000
echo 2. Check Hero banner with latest game
echo 3. Check AI-generated English titles
echo 4. Check thumbnails
echo.
echo ================================================
echo.
pause
exit /b 0
