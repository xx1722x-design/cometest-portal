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
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

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

def classify_genre_with_ai(zip_info: dict) -> dict:
    """
    Use Groq AI to classify game genre and generate SEO metadata
    Returns: {category_key, display_name, description, storyDescription, seoKeywords}
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

        prompt = f"""Analyze this game/simulation and classify it. You are curating content for a mysterious experimental portal blending science and occult mysteries.

Game info:
- Filename: {filename}
- Files: {files}
- Content: {content_snippet}

Respond with EXACTLY these 6 lines (no more, no less):

CATEGORY: [one category key: web_games/puzzle/space_universe/physics_chemistry/optics_waves/occult_abyssal/occult_alchemy/occult_anomalous/occult_cosmic/occult_forbidden/occult_sacred/occult_necromancy/occult_artifacts/occult_breach/occult_illusions]
OCCULT_THEME: [if CATEGORY starts with 'occult_', use the theme name like 'abyssal-frequencies'/'alchemy-dark-magic'/'anomalous-physics'/'breach-anomalies'/'cosmic-horror'/'forbidden-specimens'/'illusions-hallucinations'/'necromancy-spirits'/'sacred-geometry'/'unidentified-artifacts', otherwise use 'none']
STORY: [3-4 sentence immersive story description about mysterious/scientific phenomena. Make it sound like an occult/science mystery experience. Write in English.]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5] (comma-separated SEO keywords for niche search optimization - use terms like "anomaly", "dimension", "experiment", "phenomenon", etc.)
CONTROLS: [1-2 sentence concise game controls. Example: "⌨️ [Arrow Keys] to Move | [Space] Jump | 🖱️ [Click] Interact | [R] Reset"]
REASON: [one sentence explaining classification]

Example format:
CATEGORY: occult_cosmic
OCCULT_THEME: cosmic-horror
STORY: A probe detects signals from a black hole that defy all known physics. Anomalous gravitational patterns suggest consciousness itself may bend spacetime. Journey through the cosmic unknown and decode the universe's darkest secrets.
KEYWORDS: black hole anomaly, quantum consciousness simulator, cosmic entity detector, gravitational phenomenon game, dimensional physics explorer
CONTROLS: ⌨️ [Arrow Keys] or [WASD] Navigate | [Space] Fire/Interact | 🖱️ [Click] Confirm | [R] Reset
REASON: Space-themed with cosmic horror elements and scientific mystery tone."""

        response = client.messages.create(
            model="mixtral-8x7b-32768",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text
        lines = [line.strip() for line in response_text.strip().split('\n') if line.strip()]

        category_key = "web_games"
        occult_theme = "none"
        story_description = ""
        seo_keywords = []
        controls = ""
        reason = "Default classification"

        for line in lines:
            if line.startswith("CATEGORY:"):
                category_key = line.replace("CATEGORY:", "").strip()
            elif line.startswith("OCCULT_THEME:"):
                occult_theme = line.replace("OCCULT_THEME:", "").strip()
            elif line.startswith("STORY:"):
                story_description = line.replace("STORY:", "").strip()
            elif line.startswith("KEYWORDS:"):
                keywords_str = line.replace("KEYWORDS:", "").strip()
                # Parse comma-separated keywords
                seo_keywords = [kw.strip() for kw in keywords_str.split(",")]
            elif line.startswith("CONTROLS:"):
                controls = line.replace("CONTROLS:", "").strip()
            elif line.startswith("REASON:"):
                reason = line.replace("REASON:", "").strip()

        # Validate category
        if category_key not in CATEGORY_FOLDER_MAPPING:
            category_key = "web_games"

        display_name = CATEGORY_DISPLAY_NAMES.get(category_key, "Web Games")
        description = generate_game_description(filename, category_key)

        print(f"✅ AI Classification: {category_key} ({display_name})")
        if occult_theme != "none":
            print(f"   Occult Theme: {occult_theme}")
        print(f"   Story: {story_description[:60]}...")
        print(f"   Controls: {controls[:50]}...")
        print(f"   Keywords: {', '.join(seo_keywords[:3])}")
        print(f"   Reason: {reason}")

        return {
            "category_key": category_key,
            "occult_theme": occult_theme,
            "display_name": display_name,
            "description": description,
            "controls": controls,
            "storyDescription": story_description,
            "seoKeywords": seo_keywords
        }

    except ImportError:
        print("⚠ Groq library not installed, using heuristic classification")
        return classify_genre_heuristic(zip_info)
    except Exception as e:
        print(f"⚠ AI classification error: {e}, using heuristic")
        return classify_genre_heuristic(zip_info)

def classify_genre_heuristic(zip_info: dict) -> dict:
    """Fallback heuristic genre classification with SEO data"""
    filename = zip_info.get("filename", "").lower()
    content = zip_info.get("content_preview", "").lower()

    keywords_map = {
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

    for category, kws in keywords_map.items():
        score = sum(1 for kw in kws if kw in filename or kw in content)
        if score > best_score:
            best_score = score
            best_category = category

    display_name = CATEGORY_DISPLAY_NAMES.get(best_category, "Web Games")
    description = generate_game_description(filename, best_category)

    # Generate default SEO data for heuristic classification
    default_stories = {
        "web_games": "An experimental interactive environment defying conventional game design. Immerse yourself in mechanics that blur the line between simulation and reality.",
        "puzzle": "Solve cryptic patterns that hint at deeper cosmic truths. Each puzzle piece reveals an anomaly in the fabric of logic itself.",
        "space_universe": "Cosmic phenomena observable only through interdimensional measurement devices. Explore the void and its impossible geometries.",
        "physics_chemistry": "Matter behaves unexpectedly in this controlled laboratory. Witness reactions that shouldn't exist under known physical laws.",
        "occult_cosmic": "An encounter with forces beyond our dimensional understanding. The universe whispers secrets through this interactive gateway.",
    }

    story = default_stories.get(best_category, f"A mysterious {best_category} experience awaits your discovery.")
    default_keywords = {
        "web_games": ["interactive game simulation", "reality-bending mechanics", "experimental gameplay"],
        "puzzle": ["cosmic puzzle solver", "dimensional logic game", "reality anomaly puzzle"],
        "space_universe": ["cosmic phenomena explorer", "interdimensional space simulator", "void explorer game"],
        "physics_chemistry": ["anomalous physics lab", "impossible reaction simulator", "experimental matter game"],
        "occult_cosmic": ["cosmic horror experience", "dimensional entity encounter", "universe mystery game"],
    }

    seo_keywords = default_keywords.get(best_category, ["experimental game", "mystery simulator"])

    # Default controls for heuristic classification
    default_controls = {
        "web_games": "⌨️ [Arrow Keys/WASD] Move | [Space] Jump/Action | 🖱️ [Click] Interact",
        "puzzle": "🖱️ [Click/Drag] Solve | [R] Reset | [Esc] Menu",
        "space_universe": "⌨️ [Arrow Keys] Navigate | 🖱️ [Click] Select | [Space] Zoom",
        "physics_chemistry": "🖱️ [Click/Drag] Manipulate | [Space] Play/Pause | [R] Reset",
        "occult_cosmic": "⌨️ [WASD] Explore | 🖱️ [Click] Investigate | [Space] Interact",
    }

    controls = default_controls.get(best_category, "⌨️ Keyboard/🖱️ Mouse controls available")

    # Map category to occult theme if applicable
    occult_theme_map = {
        "occult_abyssal": "abyssal-frequencies",
        "occult_alchemy": "alchemy-dark-magic",
        "occult_anomalous": "anomalous-physics",
        "occult_cosmic": "cosmic-horror",
        "occult_forbidden": "forbidden-specimens",
        "occult_sacred": "sacred-geometry",
        "occult_necromancy": "necromancy-spirits",
        "occult_artifacts": "unidentified-artifacts",
        "occult_breach": "breach-anomalies",
        "occult_illusions": "illusions-hallucinations",
    }
    occult_theme = occult_theme_map.get(best_category, "none")

    print(f"📊 Heuristic Classification: {best_category} ({display_name})")

    return {
        "category_key": best_category,
        "occult_theme": occult_theme,
        "display_name": display_name,
        "description": description,
        "controls": controls,
        "storyDescription": story,
        "seoKeywords": seo_keywords
    }

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

def update_games_data(
    game_id: str,
    game_title: str,
    description: str,
    image_path: Optional[str],
    category: str,
    story_description: str = "",
    seo_keywords: list = None,
    controls: str = "",
    occult_theme: str = "none"
) -> bool:
    """Add new game to gamesData.ts with SEO metadata and controls"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        if seo_keywords is None:
            seo_keywords = []

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
        controls_attr = f'    controls: "{controls}",' if controls else ""
        story_attr = f'    storyDescription: "{story_description}",' if story_description else ""
        occult_theme_attr = f'    occultTheme: "{occult_theme}",' if occult_theme and occult_theme != "none" else ""

        # Format SEO keywords as array
        keywords_array = ""
        if seo_keywords:
            keywords_str = ", ".join([f"'{kw}'" for kw in seo_keywords])
            keywords_array = f'    seoKeywords: [{keywords_str}],'

        # Determine if simulation or game
        category_type = "simulation" if "physics_chemistry" in category or "space_universe" in category or "optics_waves" in category else "web_games"

        new_game = f'''  {{
    id: '{game_id}',
    title: '{game_title}',
    description: '{description}',
{controls_attr}{story_attr}{occult_theme_attr}{image_attr}{keywords_array}
    thumbnail: '{emoji}',
    category: '{category_type}',
    icon: '{emoji}',
    path: '/game/{game_id}',
    tags: ['auto-classified', '{category}'],
    play_count: 0,
  }},'''

        array_start = content.find("export const GAMES_DATA: GameItem[] = [")
        if array_start == -1:
            print("✗ Could not find GAMES_DATA array")
            return False

        # Prepend: Insert new game at the VERY BEGINNING of array (right after opening bracket)
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

        subprocess.run(["git", "push", "origin", "main"], check=True, capture_output=True)
        print("✓ git push origin main → Vercel deployment triggered")
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

        # Step 2: AI Genre Classification with SEO metadata & controls
        print("\n🤖 AI Classification in progress...")
        ai_result = classify_genre_with_ai(zip_info)
        category_key = ai_result["category_key"]
        occult_theme = ai_result.get("occult_theme", "none")
        display_name = ai_result["display_name"]
        description = ai_result["description"]
        controls = ai_result.get("controls", "")
        story_description = ai_result["storyDescription"]
        seo_keywords = ai_result["seoKeywords"]

        # Step 3: Move to appropriate category folder
        print(f"\n📁 Moving to category folder...")
        if not move_to_category_folder(zip_path, category_key):
            return False

        # Get updated zip path (now in category folder)
        new_zip_path = DROPZONE_BASE / CATEGORY_FOLDER_MAPPING[category_key] / zip_path.name

        # Step 4: Extract and process
        zip_name = zip_path.stem
        # Use exact folder name as game_id (no character replacement) to match physical folder
        game_id = zip_name
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

        # Step 6: Register in gamesData.ts with SEO metadata
        print("\n📝 Registering game data with controls & SEO metadata...")
        if not update_games_data(
            game_id,
            zip_name,
            description,
            image_path,
            category_key,
            story_description,
            seo_keywords,
            controls,
            occult_theme
        ):
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
