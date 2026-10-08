#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI-Powered PhET HTML Simulation Auto-Curation & Occult Theme Factory
Inbox → HTML Metadata Extraction → AI Occult Transformation → Auto-categorization → Auto-registration → Vercel deployment
"""

import os
import sys
import json
import shutil
import time
from pathlib import Path
from datetime import datetime
import subprocess
import re
from typing import Tuple, Optional
from dotenv import load_dotenv

# 🔧 CRITICAL: UTF-8 인코딩 설정 (한글 깨짐 방지)
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    from bs4 import BeautifulSoup
    HAS_BEAUTIFULSOUP = True
except ImportError:
    HAS_BEAUTIFULSOUP = False

# Load environment variables from .env file
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

# Project paths
INBOX_FOLDER = Path(r"D:\Cometest_Dropzone\Inbox")
DROPZONE_BASE = Path(r"D:\Cometest_Dropzone")
PROJECT_ROOT = Path(r"D:\cometest_portal")
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"
GAMES_DATA_FILE = PROJECT_ROOT / "src" / "config" / "gamesData.ts"
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

def analyze_html_content(html_path: Path) -> dict:
    """Extract and analyze HTML file metadata for PhET simulation"""
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        title = "PhET Simulation"
        description = ""

        # Extract title from <title> tag
        title_match = re.search(r'<title>([^<]+)</title>', content, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()

        # Extract description from meta tags
        og_desc_match = re.search(r'<meta\s+(?:name|property)=["\'](?:description|og:description)["\']\s+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
        if og_desc_match:
            description = og_desc_match.group(1).strip()

        # Extract h1 or first meaningful text
        if not description:
            h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content, re.IGNORECASE)
            if h1_match:
                description = h1_match.group(1).strip()

        return {
            "filename": html_path.stem,
            "filepath": str(html_path),
            "title": title,
            "description": description,
            "content_preview": content[:3000],
            "file_size": html_path.stat().st_size
        }
    except Exception as e:
        print(f"⚠ Error analyzing HTML: {e}")
        return {"filename": html_path.stem, "error": str(e)}

def classify_phet_with_ai(html_info: dict) -> dict:
    """
    Use Groq AI to analyze PhET simulation and generate occult-themed metadata
    Returns: {category_key, display_name, occult_title, occult_description, storyDescription, seoKeywords}
    """
    try:
        from groq import Groq

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("⚠ GROQ_API_KEY not set, using default classification")
            return classify_phet_heuristic(html_info)

        client = Groq(api_key=api_key)

        # Build analysis prompt for PhET HTML
        filename = html_info.get("filename", "unknown")
        original_title = html_info.get("title", "PhET Simulation")
        original_desc = html_info.get("description", "")
        content_snippet = html_info.get("content_preview", "")[:800]

        prompt = f"""You are an AI curator transforming educational PhET simulations into an occult/dark science experimental portal. Your task is to analyze the original PhET content and create an ENTIRELY NEW occult/mysterious persona for it.

ORIGINAL PhET INFO:
- Filename: {filename}
- Original Title: {original_title}
- Original Description: {original_desc}

Analysis: Infer the scientific topic from the filename and content. Examples:
  - "plinko-probability" → probability/statistics → CATEGORY: occult_cosmic
  - "quantum-measurement" → quantum physics → CATEGORY: occult_anomalous
  - "gravity-orbits" → orbital mechanics → CATEGORY: occult_cosmic
  - "color-vision" → optics/light → CATEGORY: occult_alchemy

RESPOND WITH EXACTLY 7 LINES (no more, no less):
ALL TEXT MUST BE IN ENGLISH ONLY - No Korean, no other languages.

CATEGORY: [CHOOSE ONE: occult_abyssal/occult_alchemy/occult_anomalous/occult_cosmic/occult_forbidden/occult_sacred/occult_necromancy/occult_artifacts/occult_breach/occult_illusions - based on scientific topic]
OCCULT_THEME: [theme name matching category: abyssal-frequencies/alchemy-dark-magic/anomalous-physics/breach-anomalies/cosmic-horror/forbidden-specimens/illusions-hallucinations/necromancy-spirits/sacred-geometry/unidentified-artifacts]
OCCULT_TITLE: [Create an ENTIRELY NEW 4-7 word occult/mysterious English title like "The Abyss Measure" or "Forbidden Cosmic Prison" - Must be English with dark/mystical tone - include an emoji prefix]
OCCULT_DESCRIPTION: [Create a 2-3 sentence occult reimagining of the PhET content - dark, mysterious, scientific, immersive - ALL IN ENGLISH - Example: "Ancient spheres fall through abyssal depths, measuring probability at the edge of cosmic fate. Each measurement reveals hidden truths of the dark universe."]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5] (comma-separated keywords - ALL IN ENGLISH - use terms like "anomaly", "dimension", "laboratory", "cosmic-horror", "experimental-device"]
STORY: [2-3 sentence immersive story description in ENGLISH ONLY - situate the simulation in occult context. Example: "In the forbidden laboratory, explorers wield quantum measurement tools to probe the boundaries of dimension. Each measurement unlocks secrets of alternate realities."]
REASON: [one sentence explaining why this mapping makes sense]

Example Perfect Response:
CATEGORY: occult_cosmic
OCCULT_THEME: cosmic-horror
OCCULT_TITLE: 🌀 The Cosmic Prison
OCCULT_DESCRIPTION: Dark celestial bodies bind each other with invisible forces. Experience the eternal orbit trapped within the sorcery of gravity and the abyss of space.
KEYWORDS: gravitational-magic, cosmic-prison, celestial-mechanics, dimensional-physics, cosmic-horror-simulator
STORY: A forbidden astronomical experiment where the black forces governing the night sky reveal themselves. Stars cannot escape the binding chains of gravity.
REASON: Orbital mechanics simulation naturally maps to cosmic horror themes and gravitational mysteries in occult classification."""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.choices[0].message.content

        # Clean markdown formatting if present
        response_text_cleaned = response_text.replace('```json', '').replace('```', '').strip()

        # Rate limit protection (3 second delay between API calls)
        time.sleep(3)

        lines = [line.strip() for line in response_text_cleaned.split('\n') if line.strip()]

        category_key = "occult_cosmic"
        occult_theme = "cosmic-horror"
        occult_title = "PhET 시뮬레이션"
        occult_description = ""
        story_description = ""
        seo_keywords = []
        reason = "Default classification"

        try:
            for line in lines:
                if line.startswith("CATEGORY:"):
                    category_key = line.replace("CATEGORY:", "").strip()
                elif line.startswith("OCCULT_THEME:"):
                    occult_theme = line.replace("OCCULT_THEME:", "").strip()
                elif line.startswith("OCCULT_TITLE:"):
                    occult_title = line.replace("OCCULT_TITLE:", "").strip()
                elif line.startswith("OCCULT_DESCRIPTION:"):
                    occult_description = line.replace("OCCULT_DESCRIPTION:", "").strip()
                elif line.startswith("STORY:"):
                    story_description = line.replace("STORY:", "").strip()
                elif line.startswith("KEYWORDS:"):
                    keywords_str = line.replace("KEYWORDS:", "").strip()
                    seo_keywords = [kw.strip() for kw in keywords_str.split(",") if kw.strip()]
                elif line.startswith("REASON:"):
                    reason = line.replace("REASON:", "").strip()
        except Exception as parse_error:
            print(f"   ⚠️ Parse error: {parse_error}")
            print(f"   📋 Raw AI Response:\n{response_text_cleaned[:500]}")

        # Validate category
        if category_key not in CATEGORY_FOLDER_MAPPING:
            category_key = "occult_cosmic"

        display_name = CATEGORY_DISPLAY_NAMES.get(category_key, "Cosmic Horror")

        print(f"✅ AI Occult Transformation: {category_key} ({display_name})")
        print(f"   Occult Title: {occult_title}")
        print(f"   Occult Theme: {occult_theme}")
        print(f"   Description: {occult_description[:60]}...")
        print(f"   Story: {story_description[:60]}...")
        print(f"   Keywords: {', '.join(seo_keywords[:3])}")
        print(f"   Reason: {reason}")

        return {
            "category_key": category_key,
            "occult_theme": occult_theme,
            "display_name": display_name,
            "occult_title": occult_title,
            "occult_description": occult_description,
            "storyDescription": story_description,
            "seoKeywords": seo_keywords
        }

    except ImportError:
        print("⚠ Groq library not installed, using heuristic classification")
        return classify_phet_heuristic(html_info)
    except Exception as e:
        print(f"⚠ AI classification error: {e}, using heuristic")
        return classify_phet_heuristic(html_info)

def classify_phet_heuristic(html_info: dict) -> dict:
    """Fallback heuristic PhET classification with occult theme"""
    filename = html_info.get("filename", "").lower()
    title = html_info.get("title", "").lower()
    content = html_info.get("content_preview", "").lower()

    # Map PhET simulations to occult categories based on keywords
    keywords_map = {
        "occult_cosmic": ["gravity", "orbit", "planet", "moon", "space", "solar", "galaxy"],
        "occult_alchemy": ["color", "light", "refraction", "optics", "laser", "prism"],
        "occult_anomalous": ["quantum", "atom", "particle", "wave", "photon", "electron"],
        "occult_forbidden": ["genetic", "dna", "molecule", "biology", "cell"],
        "occult_breach": ["energy", "force", "physics", "acceleration", "momentum"],
        "occult_illusions": ["illusion", "perception", "vision", "mirror", "lens"],
        "occult_sacred": ["geometry", "symmetry", "pattern", "structure", "proportion"],
        "occult_necromancy": ["decay", "radioactive", "nuclear", "antimatter"],
        "occult_abyssal": ["pressure", "depth", "ocean", "underwater", "abyss"],
    }

    best_category = "occult_cosmic"
    best_score = 0

    full_text = filename + " " + title + " " + content
    for category, kws in keywords_map.items():
        score = sum(1 for kw in kws if kw in full_text)
        if score > best_score:
            best_score = score
            best_category = category

    display_name = CATEGORY_DISPLAY_NAMES.get(best_category, "Cosmic Horror")

    # Generate occult title from filename
    occult_title = filename.replace("-", " ").title()
    if not occult_title.startswith("🌀") and not occult_title.startswith("🌈"):
        emoji_map = {
            "occult_cosmic": "🌀",
            "occult_alchemy": "🌈",
            "occult_anomalous": "⚡",
            "occult_forbidden": "🧬",
            "occult_breach": "🌌",
            "occult_illusions": "🎭",
            "occult_sacred": "✨",
            "occult_necromancy": "💀",
            "occult_abyssal": "🔮",
        }
        emoji = emoji_map.get(best_category, "🌀")
        occult_title = f"{emoji} {occult_title}"

    # Default occult descriptions
    default_stories = {
        "occult_cosmic": "우주의 미지의 힘이 천체들을 지배한다. 중력이라는 무명의 속박 속에서 영원한 궤도를 탐사하라.",
        "occult_alchemy": "빛의 삼원색을 조종하며 시각의 경계를 초월한다. 파장을 뒤틀 때마다 새로운 현실이 펼쳐진다.",
        "occult_anomalous": "물질의 기본 단위들이 보이지 않는 법칙에 지배된다. 양자의 미스터리를 해제하는 금지된 실험.",
        "occult_forbidden": "생명의 비밀 암호가 숨겨진 분자들을 관찰하라. 창조주의 의도를 능가하는 유전적 변이.",
        "occult_breach": "현실을 지배하는 보이지 않는 에너지를 감지하라. 차원의 경계에서 일어나는 이상 현상.",
        "occult_illusions": "인간의 지각은 하나의 환상에 불과하다. 의식의 한계를 시험하는 심리 실험실.",
        "occult_sacred": "우주의 기하학적 질서가 모든 것을 지배한다. 신성한 비례 속에 숨겨진 진실을 발견하라.",
        "occult_necromancy": "물질은 무한한 변형의 순환 속에서 죽음을 맞이한다. 소멸과 재탄생의 무한 고리.",
        "occult_abyssal": "심연의 압력 속에서만 진실이 드러난다. 물의 심연에서 수집된 비밀 데이터.",
    }

    story = default_stories.get(best_category, "PhET 시뮬레이션의 신비를 경험하라.")
    occult_description = f"금지된 {display_name} 실험실에서의 이상 현상 관찰."

    # Default keywords
    default_keywords = {
        "occult_cosmic": ["우주 운명", "중력 마법", "천체 감옥", "차원 물리학", "cosmic-horror"],
        "occult_alchemy": ["색채 마법", "광선 조종", "파동 변형", "빛의 속성", "light-alchemy"],
        "occult_anomalous": ["양자 미스터리", "입자 운동", "파동 현상", "이상 물리", "quantum-anomaly"],
        "occult_forbidden": ["유전자 비밀", "생명 암호", "분자 조작", "금지 생물학", "genetic-forbidden"],
        "occult_breach": ["에너지 현상", "차원 이상", "힘의 속박", "현실 균열", "energy-breach"],
        "occult_illusions": ["지각 환상", "의식 실험", "심리 환상", "현실 경계", "perception-illusion"],
        "occult_sacred": ["신성 기하", "우주 질서", "비례의 진실", "기하 패턴", "sacred-geometry"],
        "occult_necromancy": ["물질 순환", "소멸 과정", "재탄생", "무한 고리", "matter-cycles"],
        "occult_abyssal": ["심연 압력", "깊은 진실", "물의 비밀", "심해 데이터", "abyssal-pressure"],
    }

    seo_keywords = default_keywords.get(best_category, ["phet simulation", "occult mystery"])

    # Map to occult theme
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
    occult_theme = occult_theme_map.get(best_category, "cosmic-horror")

    print(f"📊 Heuristic PhET Classification: {best_category} ({display_name})")
    print(f"   Occult Title: {occult_title}")

    return {
        "category_key": best_category,
        "occult_theme": occult_theme,
        "display_name": display_name,
        "occult_title": occult_title,
        "occult_description": occult_description,
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

def move_to_category_folder(html_path: Path, category_key: str) -> bool:
    """Archive HTML file to appropriate category folder in Dropzone (reference only, not for data re-import)"""
    try:
        # NOTE: This is for archival reference only
        # We DO NOT re-read from Dropzone - only PhET HTML from Inbox is processed
        folder_path = CATEGORY_FOLDER_MAPPING.get(category_key)
        if not folder_path:
            print(f"⚠ Unknown category folder: {category_key}")
            return False

        target_dir = DROPZONE_BASE / folder_path
        target_dir.mkdir(parents=True, exist_ok=True)

        target_path = target_dir / html_path.name
        shutil.copy2(str(html_path), str(target_path))

        print(f"✓ Archived to Dropzone: {target_dir.name}")
        return True
    except Exception as e:
        print(f"⚠ Warning: Could not archive to Dropzone (non-critical): {e}")
        return True  # Non-critical, continue anyway

def copy_html_to_simulations(html_path: Path) -> bool:
    """Copy HTML file to public/simulations/ folder"""
    try:
        simulations_dir = PROJECT_ROOT / "public" / "simulations"
        simulations_dir.mkdir(parents=True, exist_ok=True)

        target_path = simulations_dir / html_path.name
        shutil.copy2(str(html_path), str(target_path))
        print(f"✓ Copied to simulations: {target_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to copy HTML to simulations: {e}")
        return False

def capture_screenshot_with_playwright(html_file: str, html_path: Path) -> Optional[str]:
    """Capture PhET HTML simulation screenshot with Playwright"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 Starting screenshot capture: {html_file}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        game_id = html_path.stem
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        html_url = f"file:///{html_path}".replace("\\", "/")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                page.goto(html_url, wait_until="domcontentloaded", timeout=10000)
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
        print("⚠ Playwright not installed, using emoji thumbnail")
        return None
    except Exception as e:
        print(f"⚠ Screenshot error: {e}")
        return None

def update_games_data_phet(
    game_id: str,
    occult_title: str,
    occult_description: str,
    image_path: Optional[str],
    category: str,
    story_description: str = "",
    seo_keywords: list = None,
    occult_theme: str = "cosmic-horror"
) -> bool:
    """Add new PhET simulation to gamesData.ts with occult metadata (skip if already exists)"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # CHECK: Skip if game_id already exists (prevent duplicates)
        if f"id: '{game_id}'" in content:
            print(f"⚠ PhET simulation already registered: {game_id} (skipping duplicate)")
            return True

        if seo_keywords is None:
            seo_keywords = []

        emoji_map = {
            "occult_abyssal": "🔮",
            "occult_alchemy": "⚗️",
            "occult_anomalous": "⚡",
            "occult_cosmic": "🌀",
            "occult_forbidden": "🧬",
            "occult_sacred": "✨",
            "occult_necromancy": "💀",
            "occult_artifacts": "📿",
            "occult_breach": "🌌",
            "occult_illusions": "🎭",
        }

        # Extract emoji from title or use category default
        emoji = "🌀"
        title_emoji_match = re.search(r'^([🌀🌈⚡🧬✨💀📿🔮🎭🌌])\s', occult_title)
        if title_emoji_match:
            emoji = title_emoji_match.group(1)
        else:
            emoji = emoji_map.get(category, "🌀")

        image_attr = f'    image: "{image_path}",' if image_path else ""
        story_attr = f'    storyDescription: "{story_description}",' if story_description else ""
        occult_theme_attr = f'    occultTheme: "{occult_theme}",'

        # Format SEO keywords as array
        keywords_array = ""
        if seo_keywords:
            keywords_str = ", ".join([f"'{kw}'" for kw in seo_keywords])
            keywords_array = f'    seoKeywords: [{keywords_str}],'

        # Escape quotes in descriptions for TypeScript
        occult_description_escaped = occult_description.replace('"', '\\"')

        new_game = f'''  {{
    id: '{game_id}',
    title: '{occult_title}',
    description: '{occult_description_escaped}',
{story_attr}{occult_theme_attr}{image_attr}{keywords_array}
    thumbnail: '{emoji}',
    category: 'simulation',
    icon: '{emoji}',
    path: '/game/phet-{game_id}',
    tags: ['phet', 'simulation', '{category}'],
    play_count: 0,
  }},'''

        array_start = content.find("export const GAMES_DATA: GameItem[] = [")
        if array_start == -1:
            print("✗ Could not find GAMES_DATA array")
            return False

        # Insert at beginning of array (after opening bracket and comment lines)
        array_start_pos = content.find("[", array_start)
        # Skip to first actual item line or create new line
        insert_pos = content.find("\n", array_start_pos) + 1
        new_content = content[:insert_pos] + new_game + "\n  " + content[insert_pos:]

        with open(GAMES_DATA_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ PhET simulation added to gamesData.ts: {game_id}")
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

def process_inbox_html(html_path: Path) -> bool:
    """Process single PhET HTML file from Inbox with AI occult transformation"""
    try:
        print(f"\n📄 파일 분석 중...")

        # Step 1: Analyze HTML content
        print(f"   [1/7] HTML 메타데이터 추출...")
        html_info = analyze_html_content(html_path)
        if "error" in html_info:
            print(f"   ✗ 실패: {html_info['error']}")
            return False
        print(f"   ✓ 완료 (원본 제목: {html_info.get('title', 'Unknown')})")

        # Step 2: AI Occult Transformation
        print(f"\n   [2/7] AI 오컬트 변환 진행 중...")
        ai_result = classify_phet_with_ai(html_info)
        category_key = ai_result["category_key"]
        occult_theme = ai_result.get("occult_theme", "cosmic-horror")
        occult_title = ai_result.get("occult_title", "PhET Simulation")
        occult_description = ai_result.get("occult_description", "")
        story_description = ai_result["storyDescription"]
        seo_keywords = ai_result["seoKeywords"]
        print(f"   ✓ 완료 (오컬트 제목: {occult_title})")

        # Step 3: Copy HTML to public/simulations/
        print(f"\n   [3/7] public/simulations/ 폴더로 복사...")
        if not copy_html_to_simulations(html_path):
            print(f"   ✗ 실패")
            return False
        print(f"   ✓ 완료")

        # Step 4: Move to appropriate category folder in Dropzone
        print(f"\n   [4/7] Dropzone 카테고리 폴더로 아카이브...")
        if not move_to_category_folder(html_path, category_key):
            print(f"   ⚠ 경고: 아카이브 실패 (계속 진행)")

        # Step 5: Capture screenshot
        print(f"\n   [5/7] 스크린샷 캡처...")
        html_filename = html_path.name
        image_path = capture_screenshot_with_playwright(html_filename, html_path)
        if image_path:
            print(f"   ✓ 완료 ({image_path})")
        else:
            print(f"   ⚠ 스크린샷 캡처 실패 (계속 진행)")

        # Step 6: Register in gamesData.ts with occult metadata
        print(f"\n   [6/7] gamesData.ts에 등록...")
        game_id = html_path.stem
        if not update_games_data_phet(
            game_id,
            occult_title,
            occult_description,
            image_path,
            category_key,
            story_description,
            seo_keywords,
            occult_theme
        ):
            print(f"   ✗ 실패")
            return False
        print(f"   ✓ 완료")

        # Step 7: Move source HTML to Completed
        print(f"\n   [7/7] Inbox → Completed 폴더로 이동...")
        completed_html = COMPLETED_DIR / html_path.name
        completed_html.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(html_path), str(completed_html))
        print(f"   ✓ 완료")

        return True
    except Exception as e:
        print(f"   ✗ 오류: {e}")
        import traceback
        traceback.print_exc()
        return False

def find_inbox_html_files() -> list:
    """Find all HTML files in Inbox folder with detailed debugging"""
    print(f"\n🔍 스캔 중: {INBOX_FOLDER}")

    if not INBOX_FOLDER.exists():
        print(f"✗ Inbox 폴더를 찾을 수 없음: {INBOX_FOLDER}")
        return []

    # 모든 파일 목록 출력 (디버깅용)
    all_files = list(INBOX_FOLDER.iterdir())
    print(f"   📂 Inbox 전체 파일 수: {len(all_files)}")
    for f in all_files:
        print(f"      - {f.name} ({f.stat().st_size} bytes)")

    # HTML 파일만 필터링
    html_files = sorted(list(INBOX_FOLDER.glob("*.html")) + list(INBOX_FOLDER.glob("*.htm")))

    print(f"\n✅ HTML 파일 발견: {len(html_files)}개")
    for html_file in html_files:
        print(f"   📄 {html_file.name}")

    return html_files

def main():
    """Main function - PhET HTML ONLY processing (no legacy data re-import)"""
    print("="*70)
    print("🚀 PhET HTML AI Auto-Curation & Occult Theme Factory (HTML ONLY)")
    print("   (AI-powered occult transformation & auto-registration)")
    print("   ⚠️  CRITICAL: This script processes ONLY new PhET HTML files")
    print("   ⚠️  Legacy ZIP/game data from Dropzone is NOT re-imported")
    print("="*70)

    # SAFETY CHECK: Verify Dropzone folders are empty (no legacy data)
    print("\n🔍 Pre-flight safety check: Verifying no legacy data in Dropzone...")
    dropzone_has_legacy = False

    for folder in [
        "Occult_Classified/Abyssal_Frequencies",
        "Occult_Classified/Cosmic_Horror",
        "Science/Web_Games",
        "Science/Puzzle",
    ]:
        check_path = DROPZONE_BASE / folder
        if check_path.exists():
            file_count = len(list(check_path.iterdir()))
            if file_count > 0:
                print(f"   ⚠️  WARNING: {folder} contains {file_count} files (should be empty)")
                dropzone_has_legacy = True

    if dropzone_has_legacy:
        print("\n⚠️  LEGACY DATA DETECTED IN DROPZONE!")
        print("   Please run cleanup: Delete all files in Occult_Classified/* and Science/*")
        print("   This prevents accidental re-import of old game data.")
        return

    print("   ✅ Dropzone folders are clean (no legacy data detected)\n")

    # Check required directories
    if not INBOX_FOLDER.exists():
        print(f"✗ Inbox folder not found: {INBOX_FOLDER}")
        print("Creating Inbox folder...")
        INBOX_FOLDER.mkdir(parents=True, exist_ok=True)

    if not PROJECT_ROOT.exists():
        print(f"✗ Project path not found: {PROJECT_ROOT}")
        return

    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    COMPLETED_DIR.mkdir(parents=True, exist_ok=True)
    (PROJECT_ROOT / "public" / "simulations").mkdir(parents=True, exist_ok=True)

    # Find HTML files in Inbox
    html_files = find_inbox_html_files()

    if not html_files:
        print(f"\n❌ Inbox에 HTML 파일이 없습니다!")
        print(f"📍 파일 위치: {INBOX_FOLDER}")
        print(f"\n✅ PhET HTML 파일들을 위 폴더에 복사한 뒤 다시 실행해주세요.")
        return

    print(f"\n" + "="*70)
    print(f"🚀 처리 시작: {len(html_files)}개 파일")
    print("="*70)

    # Process each HTML file with detailed progress
    success_count = 0
    for idx, html_file in enumerate(html_files, 1):
        print(f"\n[{idx}/{len(html_files)}] 처리 중: {html_file.name}")
        print("-" * 70)

        if process_inbox_html(html_file):
            success_count += 1
            print(f"✅ 완료!")
        else:
            print(f"❌ 실패!")

    # Final summary and deployment
    print("\n" + "="*70)
    print(f"✅ Processing complete: {success_count}/{len(html_files)} successful")
    print("="*70)

    if success_count > 0:
        print("\n📤 Running Git deployment...")
        run_git_commands()
        print("\n🎉 All PhET simulations processed and deployed to Vercel!")
    else:
        print("\n⚠️  No files were processed.")

if __name__ == "__main__":
    main()
