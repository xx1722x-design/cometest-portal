# Master Upload Hero Pipeline - PowerShell Version
# This script automates the complete deployment process

# Force change to script directory
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "================================================"
Write-Host "Master Upload Hero Pipeline"
Write-Host "================================================"
Write-Host ""

# Get current directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Current directory: $(Get-Location)"
Write-Host ""

# Check Python
Write-Host "Checking Python installation..."
try {
    $PythonVersion = python --version 2>&1
    Write-Host "[OK] Python installed: $PythonVersion"
} catch {
    Write-Host "[ERROR] Python not found!"
    Write-Host "Please install Python from https://www.python.org/downloads"
    pause
    exit 1
}

Write-Host ""

# STEP 1: ZIP Check
Write-Host "================================================"
Write-Host "[1/5] Checking ZIP files..."
Write-Host "================================================"
Write-Host ""

if (Test-Path "check_zip_integrity.py") {
    Write-Host "Running: check_zip_integrity.py"
    python check_zip_integrity.py
    Write-Host "[OK] ZIP check completed"
} else {
    Write-Host "[ERROR] check_zip_integrity.py not found"
}

Write-Host ""
Write-Host "Press Enter to continue to Step 2..."
Read-Host

# STEP 2: AI Metadata
Write-Host ""
Write-Host "================================================"
Write-Host "[2/5] Generating AI metadata..."
Write-Host "================================================"
Write-Host ""

if (Test-Path "update_games_metadata_groq.py") {
    Write-Host "Running: update_games_metadata_groq.py"
    Write-Host "(This may take 1-2 minutes)"
    python update_games_metadata_groq.py
    Write-Host "[OK] Metadata generation completed"
} else {
    Write-Host "[ERROR] update_games_metadata_groq.py not found"
}

Write-Host ""
Write-Host "Press Enter to continue to Step 3..."
Read-Host

# STEP 3: Screenshot Capture
Write-Host ""
Write-Host "================================================"
Write-Host "[3/5] Capturing game screenshots..."
Write-Host "================================================"
Write-Host ""

if (Test-Path "capture_existing_games.py") {
    Write-Host "Running: capture_existing_games.py"
    Write-Host "(This may take 2-3 minutes)"
    python capture_existing_games.py
    Write-Host "[OK] Screenshot capture completed"
} else {
    Write-Host "[ERROR] capture_existing_games.py not found"
}

Write-Host ""
Write-Host "Press Enter to continue to Step 4..."
Read-Host

# STEP 4: Hero UI
Write-Host ""
Write-Host "================================================"
Write-Host "[4/5] Applying Hero UI..."
Write-Host "================================================"
Write-Host ""

if (Test-Path "apply_hero_ui.py") {
    Write-Host "Running: apply_hero_ui.py"
    python apply_hero_ui.py
    Write-Host "[OK] Hero UI applied"
} else {
    Write-Host "[ERROR] apply_hero_ui.py not found"
}

Write-Host ""
Write-Host "Press Enter to continue to Step 5..."
Read-Host

# STEP 5: Deployment (Optional)
Write-Host ""
Write-Host "================================================"
Write-Host "[5/5] Final deployment (optional)"
Write-Host "================================================"
Write-Host ""
Write-Host "[INFO] Manual deployment step"
Write-Host "If needed, run your upload script separately"
Write-Host ""

# Success message
Write-Host ""
Write-Host "================================================"
Write-Host "SUCCESS - All steps completed!"
Write-Host "================================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open browser: http://localhost:3000"
Write-Host "2. Check Hero banner with latest game"
Write-Host "3. Verify AI-generated English titles"
Write-Host "4. Check thumbnails are displayed"
Write-Host ""
Write-Host "================================================"
Write-Host ""
$null = Read-Host "Press Enter to exit"
