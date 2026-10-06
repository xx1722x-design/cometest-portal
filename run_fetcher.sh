#!/bin/bash
# Internet Archive MS-DOS Collection Fetcher - Unix/Linux/Mac Script
# Run this to fetch and catalog the MS-DOS games

echo ""
echo "============================================================================"
echo " Internet Archive MS-DOS Collection Fetcher"
echo "============================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed"
        echo "Please install Python 3.6+ from https://www.python.org/"
        echo ""
        echo "On macOS: brew install python3"
        echo "On Ubuntu/Debian: sudo apt-get install python3 python3-pip"
        echo "On Fedora: sudo dnf install python3 python3-pip"
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

echo "Python version:"
$PYTHON_CMD --version
echo ""

# Check for required packages
echo "Checking for required Python packages..."
$PYTHON_CMD -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required package: requests..."
    $PYTHON_CMD -m pip install requests
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install requests"
        echo "Try: $PYTHON_CMD -m pip install --user requests"
        exit 1
    fi
fi

echo ""
echo "Running MS-DOS Collection Fetcher..."
echo ""

$PYTHON_CMD fetch_dos_games.py
RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
    echo "SUCCESS! Collection saved to dos_games_catalog.csv"
    echo ""
    echo "File location: $(pwd)/dos_games_catalog.csv"
    echo ""

    # Try to open with default editor
    if [ -f dos_games_catalog.csv ]; then
        SIZE=$(du -h dos_games_catalog.csv | cut -f1)
        LINES=$(wc -l < dos_games_catalog.csv)
        echo "File statistics:"
        echo "  Size: $SIZE"
        echo "  Items: $((LINES - 1))"
        echo ""
        read -p "Open file with default application? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open dos_games_catalog.csv
            elif command -v open &> /dev/null; then
                open dos_games_catalog.csv
            else
                cat dos_games_catalog.csv | head -20
            fi
        fi
    fi
else
    echo "ERROR: Fetcher failed with exit code $RESULT"
    exit 1
fi
