# Master Upload Hero Pipeline - Stable Version
# PowerShell script for complete deployment automation

# Force change to script directory
Set-Location $PSScriptRoot

$ErrorActionPreference = "Continue"

function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================================"
    Write-Host $Title
    Write-Host "================================================"
    Write-Host ""
}

function Wait-ForUser {
    param([string]$Message = "Press Enter to continue...")
    Write-Host $Message
    $null = Read-Host
}

function Run-PythonScript {
    param(
        [string]$ScriptName,
        [string]$Description
    )

    Write-Host "Running: $ScriptName"
    Write-Host "(This may take a few minutes...)"
    Write-Host ""

    if (Test-Path $ScriptName) {
        try {
            python $ScriptName
            $exitCode = $LASTEXITCODE

            if ($exitCode -eq 0) {
                Write-Host ""
                Write-Host "[OK] $Description completed successfully"
                return $true
            } else {
                Write-Host ""
                Write-Host "[WARNING] $Description finished with exit code: $exitCode"
                Write-Host "Check the log file for details"
                return $false
            }
        }
        catch {
            Write-Host ""
            Write-Host "[ERROR] Failed to run $ScriptName"
            Write-Host "Error: $_"
            return $false
        }
    } else {
        Write-Host "[ERROR] File not found: $ScriptName"
        Write-Host "Current directory: $(Get-Location)"
        Write-Host ""
        Write-Host "Available files in current directory:"
        Get-ChildItem -Name *.py
        return $false
    }
}

# ================================================
# MAIN PIPELINE
# ================================================

Clear-Host
Show-Header "Master Upload Hero Pipeline - STABLE"

Write-Host "Starting at: $(Get-Date)"
Write-Host "Current directory: $(Get-Location)"
Write-Host ""

# Verify Python
Write-Host "Verifying Python installation..."
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python found: $pythonVersion"
} catch {
    Write-Host "[CRITICAL ERROR] Python not found!"
    Write-Host "Please install Python from https://www.python.org/downloads"
    Write-Host "Make sure to check 'Add Python to PATH' during installation"
    Wait-ForUser
    exit 1
}

Write-Host ""
Write-Host "Verifying required libraries..."
python -c "import groq; print('[OK] Groq library found')" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Groq library not found"
    Write-Host "Run: pip install groq python-dotenv playwright"
}

# ================================================
# STEP 1: ZIP Integrity Check
# ================================================
Show-Header "[1/5] ZIP File Integrity Check"

$zipSuccess = Run-PythonScript "check_zip_integrity.py" "ZIP integrity check"
Write-Host ""
Wait-ForUser "Press Enter to continue to Step 2..."

# ================================================
# STEP 2: AI Metadata Generation
# ================================================
Show-Header "[2/5] AI Metadata Generation (Groq)"

Write-Host "This step generates English titles and descriptions for all games"
Write-Host "It uses Groq AI to create occult-themed metadata"
Write-Host ""

$metadataSuccess = Run-PythonScript "update_games_metadata_groq.py" "AI metadata generation"
Write-Host ""
Wait-ForUser "Press Enter to continue to Step 3..."

# ================================================
# STEP 3: Screenshot Capture
# ================================================
Show-Header "[3/5] Game Screenshot Capture"

Write-Host "This step captures thumbnails for each game"
Write-Host "Playwright will open each game and take a screenshot"
Write-Host ""

$captureSuccess = Run-PythonScript "capture_existing_games.py" "Screenshot capture"
Write-Host ""
Wait-ForUser "Press Enter to continue to Step 4..."

# ================================================
# STEP 4: Hero UI Application
# ================================================
Show-Header "[4/5] Hero UI Layout Application"

Write-Host "This step applies the Hero banner layout"
Write-Host "Latest game will be displayed 2-3x larger"
Write-Host ""

$heroSuccess = Run-PythonScript "apply_hero_ui.py" "Hero UI application"
Write-Host ""
Wait-ForUser "Press Enter to continue to Step 5..."

# ================================================
# STEP 5: Final Deployment (Optional)
# ================================================
Show-Header "[5/5] Final Deployment (Optional)"

Write-Host "[INFO] Manual deployment step"
Write-Host "If you have an upload script, run it now or run it separately"
Write-Host ""

# ================================================
# SUMMARY
# ================================================
Write-Host ""
Show-Header "PIPELINE COMPLETED"

Write-Host ""
Write-Host "Summary:"
Write-Host "--------"
Write-Host "Step 1 (ZIP Check):        $(if ($zipSuccess) { '[OK]' } else { '[WARNING]' })"
Write-Host "Step 2 (AI Metadata):      $(if ($metadataSuccess) { '[OK]' } else { '[WARNING]' })"
Write-Host "Step 3 (Screenshot):       $(if ($captureSuccess) { '[OK]' } else { '[WARNING]' })"
Write-Host "Step 4 (Hero UI):          $(if ($heroSuccess) { '[OK]' } else { '[WARNING]' })"
Write-Host ""

if ($zipSuccess -and $metadataSuccess -and $captureSuccess -and $heroSuccess) {
    Write-Host "All steps completed successfully!"
} else {
    Write-Host "Some steps had warnings. Check the log files in the 'logs' directory."
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open your browser to http://localhost:3000"
Write-Host "2. Verify the Hero banner displays the latest game"
Write-Host "3. Check AI-generated English titles and descriptions"
Write-Host "4. Verify game thumbnails are displayed correctly"
Write-Host ""

Write-Host "Completed at: $(Get-Date)"
Write-Host ""

Wait-ForUser "Press Enter to exit..."
