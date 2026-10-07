#!/usr/bin/env python3
"""
AI-Powered Automatic Genre Classification & Upload Factory
Inbox → AI Genre Detection → Auto-categorization → Auto-registration → Vercel deployment
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
from typing import Tuple, Optional

# Project paths
INBOX_FOLDER = Path(r"D:\Cometest_Dropzone\Inbox")
DROPZONE_BASE = Path(r"D:\Cometest_Dropzone")
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"
GAMES_DATA_FILE = PROJECT_ROOT / "src" / "config" / "gamesData.ts"
SIMULATIONS_DATA_FILE = PROJECT_ROOT / "src" / "config" / "simulationsData.ts"
COMPLETED_DIR = DROPZONE_BASE / "Completed"

# Category to folder path mapping
CATEGORY_FOLDER_MAPPING = {
    "web_games": "Science/Web_Games",
    "puzzle": "Science/Puzzle",
    "space_universe": "Science/Space_and_Universe",
    "physics_chemistry": "Science/Chemistry",
    "optics_waves": "Science/Optics_and_Waves",
    "occult_abyssal": "Occult_Classified/Abyssal_Frequencies",
    "occult_alchemy": "Occult_Classified/Alchemy_and_Dark_Magic",
    "occult_anomalous": "Occult_Classified/Anomalous_Physics",
    "occult_cosmic": "Occult_Classified/Cosmic_Horror",
    "occult_forbidden": "Occult_Classified/Forbidden_Specimens",
    "occult_sacred": "Occult_Classified/Sacred_Geometry",
    "occult_necromancy": "Occult_Classified/Necromancy_and_Spirits",
    "occult_artifacts": "Occult_Classified/Unidentified_Artifacts",
    "occult_breach": "Occult_Classified/Breach_and_Anomalies",
    "occult_illusions": "Occult_Classified/Illusions_and_Hallucinations",
}

# Category display names
CATEGORY_DISPLAY_NAMES = {
    "web_games": "Web Games",
    "puzzle": "Puzzle",
    "space_universe": "Space & Universe",
    "physics_chemistry": "Chemistry",
    "optics_waves": "Optics & Waves",
    "occult_abyssal": "Abyssal Frequencies",
    "occult_alchemy": "Alchemy & Dark Magic",
    "occult_anomalous": "Anomalous Physics",
    "occult_cosmic": "Cosmic Horror",
    "occult_forbidden": "Forbidden Specimens",
    "occult_sacred": "Sacred Geometry",
    "occult_necromancy": "Necromancy & Spirits",
    "occult_artifacts": "Unidentified Artifacts",
    "occult_breach": "Breach & Anomalies",
    "occult_illusions": "Illusions & Hallucinations",
}

def analyze_zip_content(zip_path: Path) -> dict:
    """Extract and analyze ZIP content to determine genre"""
    try:
        content_preview = ""
        file_list = []

        with zipfile.ZipFile(zip_path, 'r') as zf:
            file_list = zf.namelist()

            # Read HTML files for analysis
            for fname in file_list:
                if fname.lower().endswith(('.html', '.htm')):
                    try:
                        content_preview += zf.read(fname).decode('utf-8', errors='ignore')[:2000]
                    except:
                        pass

        return {
            "filename": zip_path.stem,
            "file_list": file_list,
            "content_preview": content_preview,
            "file_count": len(file_list)
        }
    except Exception as e:
        print(f"⚠ Error analyzing ZIP: {e}")
        return {"filename": zip_path.stem, "error": str(e)}

def classify_genre_with_ai(zip_info: dict) -> Tuple[str, str, str]:
    """
    Use Groq AI to classify game genre and return (category_key, display_name, description)
    """
    try:
        from groq import Groq

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("⚠ GROQ_API_KEY not set, using default classification")
            return classify_genre_heuristic(zip_info)

        client = Groq(api_key=api_key)

        # Build analysis prompt
        filename = zip_info.get("filename", "unknown")
        files = ", ".join(zip_info.get("file_list", [])[:10])
        content_snippet = zip_info.get("content_preview", "")[:500]

        prompt = f"""Analyze this game/simulation and classify it into ONE category from this exact list:
- web_games (arcade, action, casual web games)
- puzzle (puzzle, brain teasers)
- space_universe (astronomy, planets, space)
- physics_chemistry (physics, chemistry, states of matter)
- optics_waves (light, optics, waves)
- occult_abyssal (deep sea, abyss, mysterious depths)
- occult_alchemy (alchemy, potion, magic)
- occult_anomalous (anomalies, strange phenomena)
- occult_cosmic (cosmic horror, space horror)
- occult_forbidden (forbidden, restricted)
- occult_sacred (sacred geometry, mysticism)
- occult_necromancy (death, spirits, undead)
- occult_artifacts (artifacts, ancient items)
- occult_breach (breach, dimension rifts)
- occult_illusions (illusions, mind-bending)

Game info:
- Filename: {filename}
- Files: {files}
- Content: {content_snippet}

Respond ONLY with:
CATEGORY: [one category key from above]
REASON: [one sentence explaining]

Do not include any other text."""

        response = client.messages.create(
            model="mixtral-8x7b-32768",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text
        lines = response_text.strip().split('\n')

        category_key = "web_games"  # default
        reason = "Default classification"

        for line in lines:
            if line.startswith("CATEGORY:"):
                category_key = line.replace("CATEGORY:", "").strip()
            elif line.startswith("REASON:"):
                reason = line.replace("REASON:", "").strip()

        # Validate category
        if category_key not in CATEGORY_FOLDER_MAPPING:
            category_key = "web_games"

        display_name = CATEGORY_DISPLAY_NAMES.get(category_key, "Web Games")
        description = generate_game_description(filename, category_key)

        print(f"✅ AI Classification: {category_key} ({display_name})")
        print(f"   Reason: {reason}")

        return category_key, display_name, description

    except ImportError:
        print("⚠ Groq library not installed, using heuristic classification")
        return classify_genre_heuristic(zip_info)
    except Exception as e:
        print(f"⚠ AI classification error: {e}, using heuristic")
        return classify_genre_heuristic(zip_info)

def classify_genre_heuristic(zip_info: dict) -> Tuple[str, str, str]:
    """Fallback heuristic genre classification"""
    filename = zip_info.get("filename", "").lower()
    content = zip_info.get("content_preview", "").lower()

    keywords = {
        "web_games": ["game", "arcade", "phaser", "player", "score", "level"],
        "puzzle": ["puzzle", "match", "tetris", "sliding"],
        "space_universe": ["space", "planet", "orbit", "solar", "moon", "astronomy"],
        "physics_chemistry": ["physics", "chemistry", "atom", "molecule", "reaction", "matter"],
        "optics_waves": ["light", "refraction", "optics", "laser", "wave"],
        "occult_cosmic": ["cosmic", "horror", "universe", "strange", "alien"],
        "occult_alchemy": ["alchemy", "potion", "magic", "spell"],
    }

    best_category = "web_games"
    best_score = 0

    for category, kws in keywords.items():
        score = sum(1 for kw in kws if kw in filename or kw in content)
        if score > best_score:
            best_score = score
            best_category = category

    display_name = CATEGORY_DISPLAY_NAMES.get(best_category, "Web Games")
    description = generate_game_description(filename, best_category)

    print(f"📊 Heuristic Classification: {best_category} ({display_name})")
    return best_category, display_name, description

def generate_game_description(filename: str, category: str) -> str:
    """Generate professional English game description based on category"""
    descriptions = {
        "web_games": f"🎮 Engaging web-based game featuring interactive gameplay. Enjoy addictive mechanics and challenging levels.",
        "puzzle": f"🧩 Strategic puzzle game requiring logic and problem-solving skills. Test your wits and solve the challenge.",
        "space_universe": f"🌌 Explore the cosmos through interactive space simulation. Discover planets, stars, and astronomical phenomena.",
        "physics_chemistry": f"⚛️ Educational physics and chemistry simulation. Learn fundamental principles through interactive 3D visualization.",
        "optics_waves": f"🔬 Interactive optics and wave simulation laboratory. Explore light properties and wave behavior.",
        "occult_abyssal": f"🔮 Mysterious abyssal depths exploration. Encounter strange phenomena from unknown dimensions.",
        "occult_alchemy": f"⚗️ Explore forbidden alchemical secrets. Uncover the essence of matter and magical truths.",
        "occult_anomalous": f"⚡ Observe anomalous phenomena beyond normal laws. Discover non-conventional mysteries.",
        "occult_cosmic": f"👁️ Encounter cosmic horror phenomena. Experience cosmic truths humanity should never face.",
        "occult_forbidden": f"🧬 Research forbidden specimens. Secret collection of unknown biological anomalies.",
        "occult_sacred": f"✨ Explore sacred geometric patterns. Unlock ancient civilizations' hidden truths.",
        "occult_necromancy": f"💀 Master spirit summoning techniques. Connect with realms beyond death.",
        "occult_artifacts": f"📿 Classified archive of ancient artifacts. Interpret traces of unknown civilizations.",
        "occult_breach": f"🌌 Track dimensional anomalies. Study rifts between realities.",
        "occult_illusions": f"🎭 Mental laboratory of consciousness. Explore illusion and reality boundaries.",
    }

    return descriptions.get(category, f"🎮 Interactive {filename} game. Engage with dynamic gameplay mechanics.")

def move_to_category_folder(zip_path: Path, category_key: str) -> bool:
    """Move ZIP file to appropriate category folder"""
    try:
        folder_path = CATEGORY_FOLDER_MAPPING.get(category_key)
        if not folder_path:
            print(f"⚠ Unknown category folder: {category_key}")
            return False

        target_dir = DROPZONE_BASE / folder_path
        target_dir.mkdir(parents=True, exist_ok=True)

        target_path = target_dir / zip_path.name
        shutil.move(str(zip_path), str(target_path))

        print(f"✓ Moved to: {target_dir}")
        return True
    except Exception as e:
        print(f"✗ Failed to move ZIP: {e}")
        return False

def extract_zip(zip_path: Path, extract_to: Path) -> bool:
    """Extract ZIP file"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✓ Extraction complete: {extract_to}")
        return True
    except Exception as e:
        print(f"✗ Extraction failed: {e}")
        return False

def capture_screenshot_with_playwright(game_id: str, game_folder: Path) -> Optional[str]:
    """Capture game screenshot with Playwright"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 Starting screenshot capture: {game_id}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        game_url = f"file:///{game_folder}/index.html".replace("\\", "/")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                page.goto(game_url, wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                page.screenshot(path=str(screenshot_path), full_page=False)
                print(f"✓ Screenshot saved: {screenshot_path}")
                return f"/thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"⚠ Screenshot capture failed: {page_error}")
                return None
            finally:
                browser.close()

    except ImportError:
        print("⚠ Playwright not installed")
        return None
    except Exception as e:
        print(f"⚠ Screenshot error: {e}")
        return None

def update_games_data(game_id: str, game_title: str, description: str, image_path: Optional[str], category: str) -> bool:
    """Add new game to gamesData.ts"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        emoji_map = {
            "web_games": "🎮",
            "puzzle": "🧩",
            "space_universe": "🌌",
            "physics_chemistry": "⚛️",
            "optics_waves": "🔬",
            "occult_abyssal": "🔮",
            "occult_alchemy": "⚗️",
            "occult_anomalous": "⚡",
            "occult_cosmic": "👁️",
            "occult_forbidden": "🧬",
            "occult_sacred": "✨",
            "occult_necromancy": "💀",
            "occult_artifacts": "📿",
            "occult_breach": "🌌",
            "occult_illusions": "🎭",
        }

        emoji = emoji_map.get(category, "🎮")
        image_attr = f'    image: "{image_path}",' if image_path else ""

        # Determine if simulation or game
        category_type = "simulation" if "physics_chemistry" in category or "space_universe" in category or "optics_waves" in category else "web_games"

        new_game = f'''  {{
    id: '{game_id}',
    title: '{game_title}',
    description: '{description}',
    thumbnail: '{emoji}',
    category: '{category_type}',
    icon: '{emoji}',
    path: '/game/{game_id}',
{image_attr}
    tags: ['auto-classified', '{category}'],
    play_count: 0,
  }},'''

        array_start = content.find("export const GAMES_DATA: GameItem[] = [")
        if array_start == -1:
            print("✗ Could not find GAMES_DATA array")
            return False

        insert_pos = content.find("{", array_start)
        new_content = content[:insert_pos] + new_game + "\n  " + content[insert_pos:]

        with open(GAMES_DATA_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ Game added to gamesData.ts: {game_id}")
        return True
    except Exception as e:
        print(f"✗ Failed to update gamesData.ts: {e}")
        return False

def run_git_commands() -> bool:
    """Run Git commands (add, commit, push)"""
    try:
        os.chdir(PROJECT_ROOT)

        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        print("✓ git add .")

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(
            ["git", "commit", "-m", f"Feature: Inbox-based AI auto-classification factory ({timestamp})"],
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

def process_inbox_zip(zip_path: Path) -> bool:
    """Process single ZIP file from Inbox with AI classification"""
    try:
        print(f"\n🔍 Analyzing: {zip_path.name}")
        print("-" * 60)

        # Step 1: Analyze ZIP content
        zip_info = analyze_zip_content(zip_path)

        # Step 2: AI Genre Classification
        print("\n🤖 AI Classification in progress...")
        category_key, display_name, description = classify_genre_with_ai(zip_info)

        # Step 3: Move to appropriate category folder
        print(f"\n📁 Moving to category folder...")
        if not move_to_category_folder(zip_path, category_key):
            return False

        # Get updated zip path (now in category folder)
        new_zip_path = DROPZONE_BASE / CATEGORY_FOLDER_MAPPING[category_key] / zip_path.name

        # Step 4: Extract and process
        zip_name = zip_path.stem
        game_id = zip_name.lower().replace(" ", "_").replace("-", "_")
        extract_path = LABS_DIR / zip_name

        if extract_path.exists():
            print(f"⚠ {extract_path} already exists, skipping")
            return False

        extract_path.mkdir(parents=True, exist_ok=True)

        if not extract_zip(new_zip_path, extract_path):
            return False

        # Step 5: Capture screenshot
        print("\n📸 Automatic screenshot capture...")
        image_path = capture_screenshot_with_playwright(game_id, extract_path)

        # Step 6: Register in gamesData.ts with category
        print("\n📝 Registering game data...")
        if not update_games_data(game_id, zip_name, description, image_path, category_key):
            return False

        # Step 7: Move to Completed
        completed_zip = COMPLETED_DIR / new_zip_path.name
        shutil.move(str(new_zip_path), str(completed_zip))
        print(f"✓ Completed file moved: {completed_zip}")

        return True
    except Exception as e:
        print(f"✗ Processing error: {e}")
        return False

def find_inbox_zips() -> list:
    """Find all ZIP files in Inbox folder"""
    if not INBOX_FOLDER.exists():
        print(f"✗ Inbox folder not found: {INBOX_FOLDER}")
        return []

    zip_files = list(INBOX_FOLDER.glob("*.zip"))
    return zip_files

def main():
    """Main function"""
    print("="*60)
    print("🚀 Inbox AI Auto-Classification & Upload Factory")
    print("   (AI-powered genre detection & auto-categorization)")
    print("="*60)

    # Check required directories
    if not INBOX_FOLDER.exists():
        print(f"✗ Inbox folder not found: {INBOX_FOLDER}")
        print("Creating Inbox folder...")
        INBOX_FOLDER.mkdir(parents=True, exist_ok=True)

    if not PROJECT_ROOT.exists():
        print(f"✗ Project path not found: {PROJECT_ROOT}")
        return

    LABS_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    COMPLETED_DIR.mkdir(parents=True, exist_ok=True)

    # Find ZIP files in Inbox
    zip_files = find_inbox_zips()

    if not zip_files:
        print(f"\n📭 No ZIP files in Inbox")
        print(f"Upload ZIP files to: {INBOX_FOLDER}")
        return

    print(f"\n📦 Found ZIP files in Inbox: {len(zip_files)}\n")

    # Process each ZIP file
    success_count = 0
    for zip_file in zip_files:
        if process_inbox_zip(zip_file):
            success_count += 1
            print(f"✅ Complete")
        else:
            print(f"❌ Failed")

    # Final summary and deployment
    print("\n" + "="*60)
    print(f"✅ Processing complete: {success_count}/{len(zip_files)} successful")
    print("="*60)

    if success_count > 0:
        print("\n📤 Running Git deployment...")
        run_git_commands()
        print("\n🎉 All games processed and deployed to Vercel!")

if __name__ == "__main__":
    main()
