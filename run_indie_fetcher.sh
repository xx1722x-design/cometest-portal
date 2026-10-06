#!/bin/bash
# Indie Game Concept Fetcher - Unix/Linux/Mac Script
# Harvest game mechanics from indie platforms for design inspiration

echo ""
echo "============================================================================"
echo " Indie Game Concept Fetcher"
echo " Mining design inspiration from itch.io and Ludum Dare"
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
echo "Fetching indie game concepts..."
echo "(Being respectful to servers with rate limiting)"
echo ""

$PYTHON_CMD fetch_indie_concepts.py
RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
    echo "SUCCESS! Game concepts saved to indie_game_concepts.csv"
    echo ""
    echo "File location: $(pwd)/indie_game_concepts.csv"
    echo ""

    # Show file statistics
    if [ -f indie_game_concepts.csv ]; then
        SIZE=$(du -h indie_game_concepts.csv | cut -f1)
        LINES=$(wc -l < indie_game_concepts.csv)
        echo "File statistics:"
        echo "  Size: $SIZE"
        echo "  Concepts: $((LINES - 1))"
        echo ""
        echo "Now you can:"
        echo "  1. Review indie_game_concepts.csv"
        echo "  2. Pick a core mechanic that excites you"
        echo "  3. Create an original game implementation"
        echo "  4. Register it in Cometest Portal"
        echo ""
        read -p "Open file with default application? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open indie_game_concepts.csv
            elif command -v open &> /dev/null; then
                open indie_game_concepts.csv
            else
                head -20 indie_game_concepts.csv
            fi
        fi
    fi
else
    echo "ERROR: Fetcher failed with exit code $RESULT"
    exit 1
fi
