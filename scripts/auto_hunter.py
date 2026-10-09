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
    """Find INDIE MASTERPIECE HTML5 games on GitHub with smart internal filtering"""
    skip_ids = skip_ids or set()

    # Permanent blacklist: repos with malicious traps or harmful content
    permanent_blacklist = {
        'mumuy_pacman',  # Malicious redirect trap (5sec auto-redirect to Chinese site)
        'mumuy/pacman',
    }
    skip_ids.update(permanent_blacklist)

    print("🔍 Searching GitHub for HTML5 games (stars >10)...")
    print(f"   (Skipping {len(skip_ids)} previously processed/blacklisted repos)")

    # Forbidden keywords that indicate non-game repos
    forbidden_keywords = ['engine', 'framework', 'library', 'template', 'boilerplate',
                          'awesome', 'list', 'portfolio', 'course', 'tutorial', 'bot',
                          'cheatsheet', 'cli', 'webpack', 'rollup', 'parcel', 'bundler',
                          'challenge', 'demo', 'example', 'sample', 'test', 'collection',
                          'resource', 'assets']

    # Safe open-source licenses (permissive for commercial use)
    safe_licenses = ['mit', 'apache-2.0', 'zlib', 'unlicense', 'bsd-2-clause', 'bsd-3-clause', 'isc']

    try:
        page = 1
        max_pages = 5  # 5 pages * 100 per_page = 500 candidates to filter from

        while page <= max_pages:
            print(f"   📄 Fetching page {page}...")

            response = requests.get(
                "https://api.github.com/search/repositories",
                params={
                    # Simple query: let Python filter licenses internally
                    "q": "topic:html5-game stars:>10",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 100,  # Max results per page
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

            # Internal smart filtering: check repo name, description, and license
            for repo in repos:
                repo_id = repo['full_name'].replace('/', '_').lower()
                repo_name = repo.get('name', '').lower()
                repo_desc = repo.get('description', '').lower() if repo.get('description') else ''

                # Skip if already processed
                if repo_id in skip_ids:
                    continue

                # Skip if matches forbidden keywords
                is_forbidden = any(keyword in repo_name or keyword in repo_desc
                                  for keyword in forbidden_keywords)
                if is_forbidden:
                    continue

                # Check license (strict legal compliance)
                repo_license = repo.get('license')
                if not repo_license or repo_license.get('key') not in safe_licenses:
                    # No license or unsafe license - skip
                    continue

                # Found a candidate!
                print(f"✅ Found: {repo['full_name']}")
                print(f"   ⭐ Stars: {repo.get('stargazers_count', '?')}")
                print(f"   📜 License: {repo_license.get('name', 'Unknown') if repo_license else 'None'}")
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
    """Find index.html at root level - strict requirement for web games"""

    try:
        # STRICT: index.html MUST exist at root level
        index_path = source_dir / "index.html"
        if index_path.exists():
            shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)
            return True

        # No index.html at root = not a simple web game
        # (Complex projects like AncientBeast require special handling we don't support)
        print(f"   ❌ No index.html at root, rejecting complex project")
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


def update_games_data(repo_id, metadata, thumbnail_path, original_author=None, source_url=None):
    """Add game to gamesData.ts with attribution metadata"""
    print("📝 Updating gamesData.ts...")

    try:
        # Read current file
        content = GAMES_DATA_PATH.read_text(encoding='utf-8')

        # Extract and escape strings
        title = metadata.get('title', '🎮 Unknown Game').replace('"', '\\"').replace('\n', ' ')
        description = metadata.get('description', 'A mysterious game.').replace('"', '\\"').replace('\n', ' ')[:150]
        image_path = thumbnail_path or "/thumbnails/default.jpg"
        author = original_author or 'Unknown Developer'
        url = source_url or 'https://github.com'

        # Create new game entry with attribution
        new_game = '{\n    id: \'' + repo_id + '\',\n    title: \'' + title + '\',\n    description: \'' + description + '\',\n    thumbnail: \'🎮\',\n    category: \'web_games\',\n    icon: \'🎮\',\n    path: \'/game/' + repo_id + '\',\n    image: \'' + image_path + '\',\n    tags: [\'html5\', \'game\', \'auto-hunter\'],\n    seoKeywords: [\'html5\', \'game\', \'interactive\'],\n    occultTheme: \'dark-fantasy\',\n    originalAuthor: \'' + author + '\',\n    sourceUrl: \'' + url + '\',\n    play_count: 0,\n  }'

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


def get_latest_commit_sha():
    """Get the latest commit SHA from the current branch"""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"⚠️  Could not get commit SHA: {e}")
        return None


def check_vercel_deployment_status(repo_full_name, commit_sha, max_wait_seconds=300):
    """Poll GitHub API to check Vercel build status"""
    if not commit_sha:
        return False

    owner, repo = repo_full_name.split('/')
    api_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{commit_sha}/check-runs"

    print(f"\n🔍 Polling Vercel build status (max {max_wait_seconds}s wait)...")

    start_time = time.time()
    poll_interval = 12  # 12 seconds between polls

    while time.time() - start_time < max_wait_seconds:
        try:
            response = requests.get(api_url, timeout=15)
            response.raise_for_status()
            data = response.json()

            check_runs = data.get('check_runs', [])
            vercel_run = None

            # Find Vercel check-run
            for run in check_runs:
                if 'vercel' in run.get('name', '').lower():
                    vercel_run = run
                    break

            if not vercel_run:
                print("   ⏳ Waiting for Vercel check-run to appear...")
                time.sleep(poll_interval)
                continue

            status = vercel_run.get('status', '')
            conclusion = vercel_run.get('conclusion', '')

            print(f"   Status: {status} | Conclusion: {conclusion}")

            if status == 'completed':
                if conclusion == 'success':
                    print(f"✅ Vercel Deployment SUCCESS")
                    return True
                else:
                    print(f"❌ Vercel Deployment FAILED ({conclusion})")
                    return False

            # Still running
            elapsed = int(time.time() - start_time)
            print(f"   ⏳ Build in progress... ({elapsed}s elapsed)")
            time.sleep(poll_interval)

        except Exception as e:
            print(f"   ⚠️  API error (will retry): {str(e)[:100]}")
            time.sleep(poll_interval)
            continue

    print(f"❌ Deployment timeout (exceeded {max_wait_seconds}s)")
    return False


def git_commit_and_push(repo_full_name, repo_id, title):
    """Git commit and push to Vercel with Vercel status verification"""
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

                # Get the commit SHA and check Vercel status
                commit_sha = get_latest_commit_sha()
                deployment_success = check_vercel_deployment_status(repo_full_name, commit_sha)
                return deployment_success

            except subprocess.CalledProcessError as e:
                if attempt == 0:
                    print(f"⚠️  Push failed (attempt 1), retrying...")
                    continue
                else:
                    print(f"❌ Push failed after retries")
                    return False

    except subprocess.TimeoutExpired:
        print("❌ Git operation timeout")
        return False
    except Exception as e:
        print(f"❌ Deployment Error: {e}")
        return False


def main():
    """Main pipeline - hunt until 3 games are successfully deployed"""
    print("=" * 70)
    print("🚀 Ultimate Auto-Hunter & Deployment Pipeline")
    print("   (Hunt until 3 games are successfully deployed)")
    print("=" * 70)
    print()

    # Load existing game IDs to prevent duplicates across program restarts (영구 기억 장치)
    skip_ids = load_existing_game_ids()
    success_count = 0
    target_success = 3
    failed_attempts = 0
    max_consecutive_failures = 10  # Prevent infinite loops on bad API

    while success_count < target_success:
        print(f"\n🔄 Hunting... ({success_count}/{target_success} secured)")

        # Find a game
        repo = find_game_repo(skip_ids=skip_ids)
        if not repo:
            failed_attempts += 1
            if failed_attempts >= max_consecutive_failures:
                print(f"⚠️  Too many consecutive failures, stopping")
                break
            print(f"⚠️  No new repos found, retrying... ({failed_attempts}/{max_consecutive_failures})")
            time.sleep(2)
            continue

        failed_attempts = 0  # Reset on finding a repo
        repo_id = repo['full_name'].replace('/', '_').lower()
        print(f"   Candidate: {repo_id}")

        # Download and extract
        game_folder, extracted_id = download_and_extract_game(repo)
        if not game_folder:
            skip_ids.add(repo_id)  # Add to skip list for real-time tracking
            print(f"   ❌ Download/extraction failed, skipping (total protected: {len(skip_ids)})")
            time.sleep(1)
            continue

        # Generate metadata
        metadata = generate_occult_metadata(
            repo['full_name'].split('/')[-1],
            repo.get('description', '')
        )

        # Capture screenshot
        thumbnail_path = capture_screenshot(game_folder, extracted_id)

        # Extract attribution info
        original_author = repo['full_name'].split('/')[0]  # GitHub username
        source_url = repo['html_url']  # GitHub repo URL

        # Update gamesData.ts with attribution
        if not update_games_data(extracted_id, metadata, thumbnail_path, original_author, source_url):
            print(f"   ❌ gamesData update failed, skipping")
            skip_ids.add(repo_id)  # Add to skip list on failure
            print(f"      Added to skip list (total protected: {len(skip_ids)})")
            time.sleep(1)
            continue

        # Git commit and push with Vercel status verification
        title = metadata.get('title', '🎮 Unknown Game')
        deployment_success = git_commit_and_push(repo['full_name'], extracted_id, title)

        # Add to skip list (regardless of deployment result)
        skip_ids.add(repo_id)

        if deployment_success:
            # True success: game added + Vercel deployment confirmed
            success_count += 1
            print(f"✅ SUCCESS #{success_count}: {repo_id}")
            print(f"   Protected from re-hunt: {len(skip_ids)} total")
        else:
            # Deployment failed
            print(f"❌ Deployment failed for {repo_id} - not counting toward success quota")
            print(f"   Game metadata added but Vercel build failed")
            print(f"   Protected from re-hunt: {len(skip_ids)} total")

        time.sleep(3)  # Rate limiting

    print(f"\n🏆 Pipeline complete: {success_count}/{target_success} games deployed")


if __name__ == "__main__":
    main()
