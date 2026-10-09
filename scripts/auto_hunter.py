#!/usr/bin/env python3
"""
Ultimate Auto-Hunter & Deployment Pipeline
Discovers HTML5 games on GitHub, generates occult metadata via Groq AI, creates thumbnails, and auto-deploys to Vercel.
"""

import os
import sys
import json
import subprocess
import tempfile
import shutil
import re
import time
from pathlib import Path
from datetime import datetime

# UTF-8 encoding fix for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import requests
    from groq import Groq
except ImportError:
    print("❌ Missing dependencies. Run: pip install requests groq python-dotenv playwright")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda: None

# Load environment
load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
PROJECT_ROOT = Path(__file__).parent.parent
GAMES_DATA_PATH = PROJECT_ROOT / 'src' / 'config' / 'gamesData.ts'
PUBLIC_GAMES_PATH = PROJECT_ROOT / 'public' / 'games'
THUMBNAILS_PATH = PROJECT_ROOT / 'public' / 'thumbnails'

# Ensure directories exist
PUBLIC_GAMES_PATH.mkdir(parents=True, exist_ok=True)
THUMBNAILS_PATH.mkdir(parents=True, exist_ok=True)


def load_existing_game_ids():
    """Extract all existing game IDs from gamesData.ts to prevent duplicates"""
    existing_ids = set()

    try:
        if GAMES_DATA_PATH.exists():
            content = GAMES_DATA_PATH.read_text(encoding='utf-8')
            # Find all id: 'xxx' patterns
            id_matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", content)
            existing_ids = set(id_matches)
            print(f"📚 Loaded {len(existing_ids)} existing game IDs from gamesData.ts")
            if existing_ids:
                print(f"   Protecting: {', '.join(sorted(list(existing_ids)[:5]))}..." if len(existing_ids) > 5 else f"   Protecting: {', '.join(sorted(existing_ids))}")
    except Exception as e:
        print(f"⚠️  Could not load existing IDs: {e}")

    return existing_ids


def find_game_repo(skip_ids=None):
    """Find INDIE MASTERPIECE HTML5 games on GitHub with pagination support"""
    skip_ids = skip_ids or set()
    print("🔍 Searching GitHub for indie HTML5 games (stars >30, no engines)...")
    print(f"   (Skipping {len(skip_ids)} previously processed repos)")

    try:
        page = 1
        max_pages = 10  # Prevent infinite loops (10 pages * 30 items = 300 results)

        while page <= max_pages:
            print(f"   📄 Searching page {page}...")

            response = requests.get(
                "https://api.github.com/search/repositories",
                params={
                    # Expanded hunt: 30+ stars (catches indie gems & hidden masterpieces),
                    # removed language:html (many games are JavaScript-based),
                    # exclude game engines/frameworks/templates/courses
                    "q": "topic:html5-game stars:>30 -engine -framework -library -template -boilerplate -awesome -list -portfolio -course",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 30,
                    "page": page
                },
                timeout=15
            )

            if response.status_code == 403:
                print("⚠️  GitHub rate limited")
                return None

            response.raise_for_status()
            repos = response.json().get('items', [])

            if not repos:
                print(f"   (No results on page {page}, search complete)")
                break

            for repo in repos:
                repo_id = repo['full_name'].replace('/', '_').lower()
                if repo_id not in skip_ids:
                    print(f"✅ Found: {repo['full_name']}")
                    print(f"   ⭐ Stars: {repo.get('stargazers_count', '?')}")
                    print(f"   📝 Description: {repo.get('description', 'N/A')[:80]}")
                    return repo

            page += 1

        print("⚠️  No new repos found after searching multiple pages")
        return None

    except Exception as e:
        print(f"❌ GitHub search error: {e}")
        return None


def download_and_extract_game(repo):
    """Download and extract game from GitHub repository"""
    repo_id = repo['full_name'].replace('/', '_').lower()
    repo_name = repo['full_name'].split('/')[-1]

    print(f"\n📦 Downloading {repo_name}...")

    temp_dir = Path(tempfile.mkdtemp())
    target_dir = PUBLIC_GAMES_PATH / repo_id

    try:
        # Try main branch first, then master
        for branch in ['main', 'master']:
            zip_url = f"https://github.com/{repo['full_name']}/archive/refs/heads/{branch}.zip"

            try:
                response = requests.get(zip_url, timeout=30, allow_redirects=True)
                if response.status_code == 200:
                    zip_path = temp_dir / "repo.zip"
                    with open(zip_path, 'wb') as f:
                        f.write(response.content)

                    print(f"   ✓ Found {branch} branch")

                    # Extract ZIP
                    import zipfile
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)

                    # Find extracted folder (usually repo-name-branch)
                    extracted_folders = [d for d in temp_dir.iterdir() if d.is_dir() and d.name != '__MACOSX']
                    if not extracted_folders:
                        print(f"   ❌ No folders found in ZIP")
                        return None, None

                    source_dir = extracted_folders[0]

                    # Find and prepare index.html
                    if find_and_move_game(source_dir, target_dir):
                        print(f"✅ Extracted to: {target_dir}")
                        return target_dir, repo_id
                    else:
                        print(f"   ❌ No index.html found, skipping extraction")
                        return None, None

            except Exception as e:
                print(f"   ⚠️  {branch} branch failed: {e}")
                continue

        print(f"   ❌ Could not download from main or master branches")
        return None, None

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def find_and_move_game(source_dir, target_dir):
    """Find index.html and move game files, with flexible HTML file handling"""

    try:
        # First, try to find index.html
        index_path = source_dir / "index.html"
        if index_path.exists():
            shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)
            return True

        # Fallback: find ANY .html file
        html_files = list(source_dir.rglob("*.html"))
        if html_files:
            print(f"   ℹ️  No index.html found, using {html_files[0].name}")

            # Copy with error handling for encoding issues
            try:
                shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)
            except Exception as e:
                print(f"   ⚠️  Copy error: {e}, attempting fallback...")
                # If full copy fails, try copying just the HTML file
                target_dir.mkdir(parents=True, exist_ok=True)
                try:
                    content = html_files[0].read_text(encoding='utf-8', errors='ignore')
                    (target_dir / "index.html").write_text(content)
                    return True
                except Exception:
                    return False

            # Rename the found HTML file to index.html
            found_html = target_dir / html_files[0].name
            if found_html.exists():
                try:
                    content = found_html.read_text(encoding='utf-8', errors='ignore')
                    (target_dir / "index.html").write_text(content)
                except Exception:
                    pass

            return True

        return False
    except Exception as e:
        print(f"   ❌ find_and_move_game error: {e}")
        return False


def generate_occult_metadata(repo_name, repo_description):
    """Generate English occult game metadata with 3-retry logic and JSON stability"""
    if not GROQ_API_KEY:
        print("⚠️  GROQ_API_KEY not set, using fallback")
        return generate_fallback_metadata(repo_name, repo_description)

    print("🤖 Generating Occult Metadata via Groq AI...")

    max_retries = 3

    for attempt in range(max_retries):
        try:
            client = Groq(api_key=GROQ_API_KEY)

            # System prompt to force complete JSON responses
            system_prompt = """You are a dark fantasy game metadata generator. Your task is to transform game names and descriptions into occult/dark fantasy themed metadata.

CRITICAL RULES:
1. ALWAYS respond ONLY with a complete, valid JSON object
2. NEVER include markdown code fences (```) or any other text
3. ALWAYS close all brackets and quotes properly
4. ALWAYS respond in ENGLISH ONLY - no other languages
5. The JSON MUST be parseable - no incomplete strings or unterminated brackets
6. Include emoji in the title field
7. Keep descriptions to 2-3 sentences maximum

EXAMPLE OUTPUT (copy this format exactly):
{"title":"🔮 The Abyss Engine","description":"A cursed digital realm where reality bends to dark forces. Navigate through impossible geometries and confront entities beyond comprehension."}"""

            prompt = f"""Game Name: {repo_name}
Description: {repo_description or 'An unknown game from the depths'}

Generate a dark occult/fantasy transformation of this game with a title and description."""

            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1024,  # Increased from 300 to prevent cutoff
                temperature=0.7
            )

            response_text = response.choices[0].message.content.strip()

            # Check for empty response
            if not response_text:
                print(f"⚠️  Empty response from Groq (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    return generate_fallback_metadata(repo_name, repo_description)

            # Remove markdown code fences and extra whitespace
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            if response_text.startswith("json"):
                response_text = response_text[4:].strip()

            # Validate and repair incomplete JSON
            if response_text.endswith(','):
                response_text = response_text[:-1]  # Remove trailing comma

            # Extract JSON object using greedy regex
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group(0)
            else:
                print(f"⚠️  No JSON object found in response (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    return generate_fallback_metadata(repo_name, repo_description)

            # Ensure proper JSON closure
            brace_count = response_text.count('{') - response_text.count('}')
            if brace_count > 0:
                response_text += '}' * brace_count
                print(f"   (Fixed {brace_count} unclosed braces)")

            # Parse JSON with strict validation
            metadata = json.loads(response_text)

            # Validate required fields
            if not metadata.get('title') or not metadata.get('description'):
                print(f"⚠️  Missing required fields (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    return generate_fallback_metadata(repo_name, repo_description)

            print(f"✅ Title: {metadata.get('title', 'N/A')}")
            print(f"✅ Description: {metadata.get('description', 'N/A')[:80]}...")

            return metadata

        except json.JSONDecodeError as e:
            print(f"⚠️  Groq JSON decode error (attempt {attempt + 1}/{max_retries}): {str(e)[:100]}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            else:
                return generate_fallback_metadata(repo_name, repo_description)

        except Exception as e:
            print(f"⚠️  Groq Error (attempt {attempt + 1}/{max_retries}): {str(e)[:100]}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            else:
                return generate_fallback_metadata(repo_name, repo_description)

    return generate_fallback_metadata(repo_name, repo_description)


def generate_fallback_metadata(repo_name, repo_description):
    """Generate dark fantasy metadata without AI"""
    return {
        "title": f"🔮 Abyssal {repo_name.title()}",
        "description": f"An anomalous artifact recovered from the deep web. {repo_description or 'A mysterious experimental game locked in the vaults of forbidden knowledge.'}"
    }


def capture_screenshot(game_folder, repo_id):
    """Capture screenshot of game using Playwright with improved timeout handling"""
    print("📸 Capturing screenshot...")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("⚠️  Playwright not installed, using default thumbnail")
        return None

    try:
        index_html = game_folder / "index.html"
        if not index_html.exists():
            print("⚠️  index.html not found, skipping screenshot")
            return None

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                # Use "load" instead of "networkidle" to avoid timeout on games with background requests
                page.goto(f"file:///{index_html.resolve()}", wait_until="load", timeout=15000)
                # Give the page 2 seconds to render after load event
                page.wait_for_timeout(2000)

                screenshot_path = THUMBNAILS_PATH / f"{repo_id}.jpg"
                page.screenshot(path=str(screenshot_path), type="jpeg", quality=80)

                print(f"✅ Screenshot saved: {screenshot_path}")
                return f"/thumbnails/{repo_id}.jpg"
            finally:
                browser.close()

    except Exception as e:
        print(f"⚠️  Screenshot failed: {str(e)[:150]}")
        return None


def update_games_data(repo_id, metadata, thumbnail_path):
    """Add game to gamesData.ts by directly modifying the TypeScript file"""
    print("📝 Updating gamesData.ts...")

    try:
        # Read current file
        content = GAMES_DATA_PATH.read_text(encoding='utf-8')

        # Extract and escape strings
        title = metadata.get('title', '🎮 Unknown Game').replace('"', '\\"').replace('\n', ' ')
        description = metadata.get('description', 'A mysterious game.').replace('"', '\\"').replace('\n', ' ')[:150]
        image_path = thumbnail_path or "/thumbnails/default.jpg"

        # Create new game entry - use template string instead of format()
        new_game = '{\n    id: \'' + repo_id + '\',\n    title: \'' + title + '\',\n    description: \'' + description + '\',\n    thumbnail: \'🎮\',\n    category: \'web_games\',\n    icon: \'🎮\',\n    path: \'/game/' + repo_id + '\',\n    image: \'' + image_path + '\',\n    tags: [\'html5\', \'game\', \'auto-hunter\'],\n    seoKeywords: [\'html5\', \'game\', \'interactive\'],\n    occultTheme: \'dark-fantasy\',\n    play_count: 0,\n  }'

        # Insert before the closing bracket of GAMES_DATA array
        # Find the last closing bracket before the export
        insert_pos = content.rfind('],\n', 0, content.rfind('export'))
        if insert_pos == -1:
            insert_pos = content.rfind(']', 0, content.rfind('export'))

        if insert_pos != -1:
            # Add comma to previous entry if needed
            before = content[:insert_pos].rstrip()
            after = content[insert_pos:]

            if not before.endswith(',') and not before.endswith('['):
                before += ','

            new_content = before + '\n  ' + new_game.replace('\n', '\n  ') + '\n' + after

            GAMES_DATA_PATH.write_text(new_content, encoding='utf-8')
            print(f"✅ Added to gamesData.ts: {repo_id}")
            return True
        else:
            print("⚠️  Could not find insertion point in gamesData.ts")
            return False

    except Exception as e:
        print(f"❌ gamesData.ts update error: {e}")
        return False


def git_commit_and_push(repo_id, title):
    """Git commit and push to Vercel with conflict prevention"""
    print("📤 Git commit and push...")

    try:
        os.chdir(PROJECT_ROOT)

        # Stage all changes
        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        print("✅ git add")

        # Commit
        commit_msg = f"Auto-Hunter: Added '{title}' game ({repo_id})"
        try:
            subprocess.run(
                ["git", "commit", "-m", commit_msg],
                check=True,
                capture_output=True
            )
            print(f"✅ git commit: {commit_msg}")
        except subprocess.CalledProcessError:
            print("⚠️  No changes to commit")

        # Pull latest to prevent conflicts
        print("   Syncing with remote...")
        try:
            subprocess.run(
                ["git", "pull", "origin", "main", "--rebase"],
                check=True,
                capture_output=True,
                timeout=30
            )
            print("✅ git pull --rebase")
        except subprocess.CalledProcessError:
            try:
                subprocess.run(
                    ["git", "pull", "origin", "main"],
                    check=True,
                    capture_output=True,
                    timeout=30
                )
                print("✅ git pull (merged)")
            except subprocess.CalledProcessError:
                print("⚠️  Pull failed, skipping sync")

        # Push with retry
        for attempt in range(2):
            try:
                subprocess.run(
                    ["git", "push", "origin", "main"],
                    check=True,
                    capture_output=True,
                    timeout=30
                )
                print("✅ git push → Vercel deployment triggered")
                return True
            except subprocess.CalledProcessError as e:
                if attempt == 0:
                    print(f"⚠️  Push failed (attempt 1), retrying...")
                    continue
                else:
                    print(f"❌ Push failed after retries: {e}")
                    return False

    except subprocess.TimeoutExpired:
        print("❌ Git operation timeout")
        return False
    except Exception as e:
        print(f"❌ Deployment Error: {e}")
        return False


def main():
    """Main pipeline"""
    print("=" * 70)
    print("🚀 Ultimate Auto-Hunter & Deployment Pipeline")
    print("   (GitHub HTML5 Games → Occult Theme → Auto-Deploy)")
    print("=" * 70)
    print()

    # Load existing game IDs to prevent duplicates across program restarts (영구 기억 장치)
    skip_ids = load_existing_game_ids()
    max_attempts = 3

    for attempt in range(max_attempts):
        print(f"\n🔄 Attempt {attempt + 1}/{max_attempts}...")

        # Find a game
        repo = find_game_repo(skip_ids=skip_ids)
        if not repo:
            print("⚠️  No game found, stopping pipeline")
            break

        repo_id = repo['full_name'].replace('/', '_').lower()
        print(f"   Target ID: {repo_id}")

        # Download and extract
        game_folder, extracted_id = download_and_extract_game(repo)
        if not game_folder:
            skip_ids.add(repo_id)  # Add to skip list for real-time tracking
            print(f"⚠️  Download failed, adding {repo_id} to skip list (total: {len(skip_ids)})")
            time.sleep(2)
            continue

        # Generate metadata
        metadata = generate_occult_metadata(
            repo['full_name'].split('/')[-1],
            repo.get('description', '')
        )

        # Capture screenshot
        thumbnail_path = capture_screenshot(game_folder, extracted_id)

        # Update gamesData.ts
        if not update_games_data(extracted_id, metadata, thumbnail_path):
            print("⚠️  gamesData update failed")
            skip_ids.add(repo_id)  # Add to skip list on failure
            print(f"   Added {repo_id} to skip list (total: {len(skip_ids)})")
            continue

        # Git commit and push
        title = metadata.get('title', '🎮 Unknown Game')
        if not git_commit_and_push(extracted_id, title):
            print("⚠️  Game added but deployment failed. Check git status.")

        # Success! Add to skip list to prevent re-processing
        skip_ids.add(repo_id)
        print(f"✅ Successfully added! {repo_id} added to skip list (total: {len(skip_ids)})")

        time.sleep(3)  # Rate limiting


if __name__ == "__main__":
    main()
