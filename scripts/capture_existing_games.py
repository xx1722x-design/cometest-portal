#!/usr/bin/env python3
"""
Batch screenshot capture for existing games/simulations
Auto-capture all games in public/labs
"""

import time
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"

# Games to capture (folders existing in public/labs)
GAMES_TO_CAPTURE = [
    "dante",
    "clawstrike",
]

def capture_game_screenshot(game_id, game_folder):
    """Capture game screenshot with Playwright"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 Capturing: {game_id}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        # Game file URL path
        game_url = f"file:///{game_folder}/index.html".replace("\\", "/")

        with sync_playwright() as p:
            # Launch headless browser
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                # Load game page
                print(f"  📄 Loading page: {game_url}")
                page.goto(game_url, wait_until="domcontentloaded", timeout=15000)

                # Wait for game rendering
                print(f"  ⏳ Waiting for game render...")
                time.sleep(3)

                # Capture screenshot
                page.screenshot(path=str(screenshot_path), full_page=False)

                print(f"  ✅ Save complete: {screenshot_path}")
                return f"/thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"  ❌ Capture failed: {page_error}")
                return None
            finally:
                browser.close()

    except ImportError:
        print("❌ Playwright not installed")
        print("   Install: pip install playwright")
        print("   Then run: playwright install")
        return None
    except Exception as e:
        print(f"❌ Capture error: {e}")
        return None

def main():
    """Main function"""
    print("="*60)
    print("🎬 Batch Screenshot Capture for Existing Games")
    print("="*60)

    if not LABS_DIR.exists():
        print(f"❌ {LABS_DIR} folder not found")
        return

    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

    # Capture each game
    success_count = 0
    for game_id in GAMES_TO_CAPTURE:
        game_folder = LABS_DIR / game_id

        if not game_folder.exists():
            print(f"\n⚠️  {game_id} folder not found - skipping")
            continue

        index_file = game_folder / "index.html"
        if not index_file.exists():
            print(f"\n⚠️  {game_id}/index.html not found - skipping")
            continue

        print(f"\n🔧 Processing {game_id}")
        print("-" * 60)

        image_path = capture_game_screenshot(game_id, game_folder)
        if image_path:
            success_count += 1

    # Final summary
    print("\n" + "="*60)
    print(f"✅ Capture complete: {success_count}/{len(GAMES_TO_CAPTURE)} successful")
    print("="*60)
    print(f"\n📸 Saved image paths:")
    for game_id in GAMES_TO_CAPTURE:
        print(f"  ✓ /thumbnails/{game_id}.png")

if __name__ == "__main__":
    main()
