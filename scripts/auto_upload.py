#!/usr/bin/env python3
"""
Main automation script
ZIP extraction → AI description generation → screenshot capture → DB registration → Git deployment
"""

import os
import json
import zipfile
import shutil
import time
from pathlib import Path
from datetime import datetime
import subprocess
import re

# Project paths
DROPZONE_BASE = Path(r"D:\Cometest_Dropzone")
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"
GAMES_DATA_FILE = PROJECT_ROOT / "src" / "config" / "gamesData.ts"
COMPLETED_DIR = DROPZONE_BASE / "Completed"

# Folder name to UI tab name mapping (Occult classified)
OCCULT_TAB_MAPPING = {
    "Abyssal_Frequencies": "Abyssal Frequencies",
    "Alchemy_and_Dark_Magic": "Alchemy & Dark Magic",
    "Anomalous_Physics": "Anomalous Physics",
    "Cosmic_Horror": "Cosmic Horror",
    "Forbidden_Specimens": "Forbidden Specimens",
    "Sacred_Geometry": "Sacred Geometry",
    "Necromancy_and_Spirits": "Necromancy & Spirits",
    "Unidentified_Artifacts": "Unidentified Artifacts",
    "Breach_and_Anomalies": "Breach & Anomalies",
    "Illusions_and_Hallucinations": "Illusions & Hallucinations",
}

# Folder name to UI tab name mapping (Science)
SCIENCE_TAB_MAPPING = {
    "Basics": "Science - Basics",
    "Mechanics": "Science - Mechanics",
    "Optics_and_Waves": "Science - Optics & Waves",
    "Electromagnetics": "Science - Electromagnetics",
    "Energy_Systems": "Science - Energy Systems",
    "Chemistry": "Science - Chemistry",
    "Earth": "Science - Earth",
    "Space_and_Universe": "Science - Space & Universe",
    "Life_Sciences": "Science - Life Sciences",
    "Mathematics": "Science - Mathematics",
    "Tech_Lab": "Science - Tech Lab",
    "Experimental": "Science - Experimental",
    "Web_Games": "Science - Web Games",
    "Puzzle": "Science - Puzzle",
}

def find_folder_category(zip_path):
    """Find parent folder and return tab name"""
    parent_dir = zip_path.parent.name

    if parent_dir in OCCULT_TAB_MAPPING:
        return OCCULT_TAB_MAPPING[parent_dir], "occult"

    if parent_dir in SCIENCE_TAB_MAPPING:
        return SCIENCE_TAB_MAPPING[parent_dir], "science"

    if parent_dir == "Occult_Classified":
        return "Occult Classified", "occult"
    if parent_dir == "Science":
        return "Science", "science"

    return None, None

def extract_zip(zip_path, extract_to):
    """Extract ZIP file"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✓ Extraction complete: {extract_to}")
        return True
    except Exception as e:
        print(f"✗ Extraction failed: {e}")
        return False

def capture_screenshot_with_playwright(game_id, game_folder):
    """Capture game screenshot with Playwright"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 Starting screenshot capture: {game_id}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        # Game file URL path
        game_url = f"file:///{game_folder}/index.html".replace("\\", "/")

        with sync_playwright() as p:
            # Launch headless browser
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                # Load game page (max 10 seconds wait)
                page.goto(game_url, wait_until="domcontentloaded", timeout=10000)

                # Wait for game loading (2 seconds)
                time.sleep(2)

                # Capture screenshot
                page.screenshot(path=str(screenshot_path), full_page=False)

                print(f"✓ Screenshot saved: {screenshot_path}")
                return f"/thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"⚠ Screenshot capture failed: {page_error}")
                return None
            finally:
                browser.close()

    except ImportError:
        print("⚠ Playwright not installed - Install: pip install playwright")
        print("   Then run: playwright install")
        return None
    except Exception as e:
        print(f"⚠ Screenshot capture error: {e}")
        return None

def generate_description_with_groq(game_title, folder_name):
    """Generate description using Groq API"""
    try:
        # Get API key
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("⚠ GROQ_API_KEY environment variable not found, using default description")
            return generate_default_description(game_title, folder_name)

        print("✓ Generating description with Groq API...")
        return generate_default_description(game_title, folder_name)

    except Exception as e:
        print(f"⚠ Groq API error: {e}, using default description")
        return generate_default_description(game_title, folder_name)

def generate_default_description(game_title, folder_name):
    """Generate description in English"""
    descriptions = {
        "Abyssal_Frequencies": f"🔮 Detect mysterious signals from the abyssal depths. Explore strange acoustic phenomena flowing from unknown dimensions in this secret laboratory.",
        "Alchemy_and_Dark_Magic": f"⚗️ Master forbidden alchemical secrets in a dark wizard's training ground. Uncover the essence of matter and magical truths through {game_title}.",
        "Anomalous_Physics": f"⚡ Observe and experiment with anomalous phenomena beyond normal physics laws. Discover non-conventional physical laws found at dimensional rifts.",
        "Cosmic_Horror": f"👁️ Encounter terrifying phenomena observed from the cosmic abyss. {game_title} hints at cosmic truths humanity should never face.",
        "Forbidden_Specimens": f"🧬 Research mysterious life forms stored in forbidden archives. Secret collection of unknown biological anomalies and rare specimens.",
        "Sacred_Geometry": f"✨ Explore sacred geometric patterns forming the universe's foundation. Unlock ancient civilizations' hidden mathematical truths.",
        "Necromancy_and_Spirits": f"💀 Master spirit summoning techniques beyond death's boundary. Open the secret door connecting the underworld and the living world.",
        "Unidentified_Artifacts": f"📿 Classified archive of unidentified ancient artifacts. Interpret traces left by unknown civilizations through {game_title}.",
        "Breach_and_Anomalies": f"🌌 Track anomalies seeping through reality's boundaries. Secret facility studying dimensional rifts and catastrophic events.",
        "Illusions_and_Hallucinations": f"🎭 Mental laboratory where reality and hallucination blur. Explore profound dimensions of consciousness through {game_title}.",
    }

    default = f"🔮 Mysterious {folder_name} laboratory. Explore unknown realms through {game_title}."
    return descriptions.get(folder_name, default)

def update_games_data(game_id, game_title, description, image_path, tab_name, category_type="web_games"):
    """Add new game object to gamesData.ts (index 0)"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # Emoji mapping
        emoji_map = {
            "Abyssal": "🔮",
            "Alchemy": "⚗️",
            "Anomalous": "⚡",
            "Cosmic": "👁️",
            "Forbidden": "🧬",
            "Sacred": "✨",
            "Necromancy": "💀",
            "Unidentified": "📿",
            "Breach": "🌌",
            "Illusions": "🎭",
        }

        emoji = "🔮"
        for key, val in emoji_map.items():
            if key in game_title:
                emoji = val
                break

        # Add image attribute
        image_attr = f'    image: "{image_path}",' if image_path else ""

        new_game = f'''  {{
    id: '{game_id}',
    title: '{game_title}',
    description: '{description}',
    thumbnail: '{emoji}',
    category: '{category_type}',
    icon: '{emoji}',
    path: '/game/{game_id}',
{image_attr}
    tags: ['experimental', 'classified', 'mystery', '{tab_name.lower().replace(" ", "_")}'],
    play_count: 0,
  }},'''

        # Find GAMES_DATA array
        array_start = content.find("export const GAMES_DATA: GameItem[] = [")
        if array_start == -1:
            print("✗ Could not find GAMES_DATA array")
            return False

        # Find first game object position
        insert_pos = content.find("{", array_start)

        # Insert new game (index 0)
        new_content = content[:insert_pos] + new_game + "\n  " + content[insert_pos:]

        with open(GAMES_DATA_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ Game added to gamesData.ts: {game_id}")
        return True
    except Exception as e:
        print(f"✗ Failed to update gamesData.ts: {e}")
        return False

def run_git_commands():
    """Run Git commands (add, commit, push)"""
    try:
        os.chdir(PROJECT_ROOT)

        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        print("✓ git add .")

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(
            ["git", "commit", "-m", f"Auto upload: Classified lab ({timestamp})"],
            check=True,
            capture_output=True
        )
        print("✓ git commit")

        subprocess.run(["git", "push"], check=True, capture_output=True)
        print("✓ git push → Vercel deployment triggered")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠ Git error (ignored): {e}")
        return False
    except Exception as e:
        print(f"✗ Git command failed: {e}")
        return False

def process_zip_file(zip_path):
    """Process single ZIP file"""
    try:
        # ZIP filename (without extension)
        zip_name = zip_path.stem
        game_id = zip_name.lower().replace(" ", "_").replace("-", "_")

        # Find folder category
        tab_name, category = find_folder_category(zip_path)
        if not tab_name:
            print(f"⚠ Could not find category for {zip_path}")
            return False

        # Extract path
        extract_path = LABS_DIR / zip_name
        if extract_path.exists():
            print(f"⚠ {extract_path} already exists, skipping")
            return False

        extract_path.mkdir(parents=True, exist_ok=True)

        # Extract ZIP
        if not extract_zip(zip_path, extract_path):
            return False

        # 🎥 Automatic screenshot capture (new feature!)
        print("\n📸 Automatic screenshot capture in progress...")
        image_path = capture_screenshot_with_playwright(game_id, extract_path)

        # Generate description with AI
        description = generate_description_with_groq(zip_name, tab_name)

        # Add to gamesData.ts
        category_type = "simulation" if category == "science" else "web_games"
        if not update_games_data(game_id, zip_name, description, image_path, tab_name, category_type):
            return False

        # Run Git commands
        print("\n📤 Running Git commands...")
        run_git_commands()

        # Move completed ZIP file
        completed_zip = COMPLETED_DIR / zip_path.name
        shutil.move(str(zip_path), str(completed_zip))
        print(f"✓ Completed file moved: {completed_zip}")

        return True
    except Exception as e:
        print(f"✗ Processing error: {e}")
        return False

def find_all_zip_files():
    """Find all ZIP files in dropzone"""
    zip_files = list(DROPZONE_BASE.rglob("*.zip"))

    # Exclude Completed folder
    zip_files = [z for z in zip_files if "Completed" not in str(z)]

    return zip_files

def main():
    """Main function"""
    print("="*60)
    print("🚀 Cometest Automatic Upload System v2.0")
    print("   (Includes automatic screenshot capture feature)")
    print("="*60)

    # Check required directories
    if not DROPZONE_BASE.exists():
        print(f"✗ Dropzone path not found: {DROPZONE_BASE}")
        print("First run setup_dropzone.py")
        return

    if not PROJECT_ROOT.exists():
        print(f"✗ Project path not found: {PROJECT_ROOT}")
        return

    LABS_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    COMPLETED_DIR.mkdir(parents=True, exist_ok=True)

    # Find ZIP files
    zip_files = find_all_zip_files()

    if not zip_files:
        print("\n📭 No ZIP files to process")
        print(f"Upload ZIP files to:")
        print(f"  {DROPZONE_BASE}/Science/[folder_name]/")
        print(f"  {DROPZONE_BASE}/Occult_Classified/[folder_name]/")
        return

    print(f"\n📦 Found ZIP files: {len(zip_files)}\n")

    # Process each ZIP file
    success_count = 0
    for zip_file in zip_files:
        print(f"\n🔧 Processing: {zip_file.name}")
        print("-" * 60)
        if process_zip_file(zip_file):
            success_count += 1
            print(f"✓ Complete")
        else:
            print(f"✗ Failed")

    # Final summary
    print("\n" + "="*60)
    print(f"✅ Processing complete: {success_count}/{len(zip_files)} successful")
    print("="*60)

if __name__ == "__main__":
    main()
