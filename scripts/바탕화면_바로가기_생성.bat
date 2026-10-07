@echo off
setlocal enabledelayedexpansion

REM Desktop shortcut creation
set "DESKTOP=%USERPROFILE%\Desktop"
set "SCRIPT_PATH=%~dp0업로드_실행.bat"
set "SHORTCUT_PATH=%DESKTOP%\Cometest_Upload.lnk"

echo.
echo ============================================================
echo   Creating Desktop Shortcut
echo ============================================================
echo.

setlocal enabledelayedexpansion

set "VBS_SCRIPT=%TEMP%\create_shortcut.vbs"

(
echo Set oWS = WScript.CreateObject("WScript.Shell"^)
echo Set oLink = oWS.CreateShortcut("%SHORTCUT_PATH%"^)
echo oLink.TargetPath = "%SCRIPT_PATH%"
echo oLink.WorkingDirectory = "%~dp0.."
echo oLink.Description = "Cometest Auto Upload - Automated ZIP Processing"
echo oLink.WindowStyle = 1
echo oLink.Save
) > "%VBS_SCRIPT%"

echo Creating shortcut...
cscript.exe "%VBS_SCRIPT%" >nul

REM Check if shortcut was created
if exist "%SHORTCUT_PATH%" (
    echo.
    echo [OK] Shortcut created successfully!
    echo.
    echo Location: %SHORTCUT_PATH%
    echo.
    echo You can now click "Cometest_Upload.lnk" on your desktop
    echo to start the automated upload process.
) else (
    echo.
    echo [ERROR] Failed to create shortcut
)

if exist "%VBS_SCRIPT%" del "%VBS_SCRIPT%"

echo.
echo ============================================================
pause
