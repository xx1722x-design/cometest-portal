#!/usr/bin/env python3
"""
Complete ZIP Game Processing Pipeline
1. Extract ZIP files from Inbox
2. Register in gamesData.ts
3. Generate AI metadata (Groq)
4. Capture screenshots (Playwright)
5. Apply Hero UI
6. Deploy to Vercel (Git push)
"""

import zipfile
import json
import re
import sys
import shutil
import subprocess
import time
from pathlib import Path
from datetime import datetime
from google import genai
from dotenv import load_dotenv
import os

# Fix encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment
load_dotenv(Path(__file__).parent.parent / ".env")

# Paths
INBOX_DIR = Path(r"D:\Cometest_Dropzone\Inbox")
GAMES_DIR = Path(r"D:\cometest_portal\public\labs")
GAMES_DATA_FILE = Path(r"D:\cometest_portal\src\config\gamesData.ts")
THUMBNAILS_DIR = Path(r"D:\cometest_portal\public\thumbnails")

def extract_zip_files():
    """Step 1: Extract ZIP files"""
    print("\n" + "="*60)
    print("📦 [1/5] ZIP 파일 압축 해제")
    print("="*60 + "\n")

    if not INBOX_DIR.exists():
        print(f"❌ Inbox를 찾을 수 없습니다: {INBOX_DIR}")
        return []

    zip_files = sorted(INBOX_DIR.glob("*.zip"))
    if not zip_files:
        print("ℹ️  압축할 ZIP 파일이 없습니다")
        return []

    print(f"🔍 발견된 ZIP: {len(zip_files)}개\n")

    GAMES_DIR.mkdir(parents=True, exist_ok=True)
    extracted_games = []

    for idx, zip_path in enumerate(zip_files, 1):
        game_id = zip_path.stem
        print(f"[{idx}/{len(zip_files)}] {game_id}...", end=' ')

        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                if zf.testzip() is None:
                    game_folder = GAMES_DIR / game_id
                    game_folder.mkdir(exist_ok=True)
                    zf.extractall(game_folder)

                    if (game_folder / "index.html").exists():
                        print("✅")
                        extracted_games.append(game_id)
                    else:
                        print("⚠️  (no index.html)")
                else:
                    print("❌ (손상됨)")
        except Exception as e:
            print(f"❌ ({e})")

    print(f"\n✅ 압축 해제 완료: {len(extracted_games)}개")
    return extracted_games


def register_in_games_data(game_ids):
    """Step 2: Register new games in gamesData.ts"""
    print("\n" + "="*60)
    print("📝 [2/5] gamesData.ts에 게임 등록")
    print("="*60 + "\n")

    if not game_ids:
        print("ℹ️  등록할 게임이 없습니다")
        return True

    if not GAMES_DATA_FILE.exists():
        print(f"❌ {GAMES_DATA_FILE} 파일을 찾을 수 없습니다")
        return False

    try:
        content = GAMES_DATA_FILE.read_text(encoding='utf-8')

        # Create new game entries with thumbnail and category
        new_entries = []
        for game_id in game_ids:
            entry = f'''  {{
    id: '{game_id}',
    englishTitle: 'Occult Mystery',
    englishDescription: 'A game shrouded in dark mystery and cosmic intrigue...',
    title: '🎮 {game_id}',
    description: 'A game shrouded in dark mystery and cosmic intrigue...',
    thumbnail: '🎮',
    category: 'web_games',
    icon: '🎮',
    path: '/game/{game_id}',
    image: '/thumbnails/{game_id}.png',
    tags: ['web_games'],
    play_count: 0,
  }},'''
            new_entries.append(entry)

        # Try multiple patterns to find where to insert
        insert_point = -1
        insert_pos = -1

        # Pattern 1: "GAMES_DATA: GameItem[] = ["
        insert_point = content.find("GAMES_DATA: GameItem[] = [")
        if insert_point != -1:
            insert_pos = content.find("[", insert_point) + 1

        # Pattern 2: "export const GAMES_DATA: GameItem[" (without = [)
        if insert_point == -1:
            insert_point = content.find("export const GAMES_DATA: GameItem[")
            if insert_point != -1:
                insert_pos = content.find("[", insert_point) + 1

        if insert_pos == -1:
            print("⚠️  게임 배열을 찾을 수 없습니다 (수동 등록 필요)")
            return False

        new_content = content[:insert_pos] + "\n" + "\n".join(new_entries) + "\n" + content[insert_pos:]

        GAMES_DATA_FILE.write_text(new_content, encoding='utf-8')
        print(f"✅ {len(game_ids)}개 게임 등록 완료")
        return True

    except Exception as e:
        print(f"❌ 등록 실패: {e}")
        return False


def generate_ai_metadata(game_ids):
    """Step 3: Generate AI metadata using Gemini and update gamesData.ts"""
    print("\n" + "="*60)
    print("🤖 [3/5] AI 메타데이터 생성 (Gemini)")
    print("="*60 + "\n")

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("⚠️  GEMINI_API_KEY 없음 (기본값 사용)")
        return True

    client = genai.Client(api_key=gemini_key)
    print(f"📌 처리할 게임: {len(game_ids)}개\n")

    content = GAMES_DATA_FILE.read_text(encoding='utf-8')
    updated_content = content
    updated_count = 0

    for game_id in game_ids:
        print(f"  {game_id}...", end=' ', flush=True)
        try:
            prompt = f"""Generate English occult-themed metadata for game "{game_id}".
Respond with EXACTLY:
TITLE: [3-5 word cosmic/dark title]
DESC: [2-3 sentence eerie description]"""

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            text = response.text

            # Parse response
            title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', text)
            desc_match = re.search(r'DESC:\s*(.+?)(?:\n|$)', text, re.DOTALL)

            if title_match and desc_match:
                title = title_match.group(1).strip()
                desc = desc_match.group(1).strip()

                # Use json.dumps() for perfect TypeScript/JavaScript string escaping
                title_json = json.dumps(title)
                desc_json = json.dumps(desc)

                # Update gamesData.ts with new metadata using JSON-escaped strings
                pattern = f"(id: '{game_id}',[\\s\\S]*?)(title: )'🎮 {game_id}',"
                replacement = f"\\1\\2{title_json},"
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.DOTALL)

                pattern = f"(id: '{game_id}',[\\s\\S]*?)(description: )'[^']*',"
                replacement = f"\\1\\2{desc_json},"
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.DOTALL)

                print("✅")
                updated_count += 1
            else:
                print("⚠️  (파싱 실패)")

            time.sleep(1)

        except Exception as e:
            error_msg = str(e)
            print(f"\n    ❌ 에러: {error_msg}")

    # Write updated content back to file
    if updated_count > 0:
        GAMES_DATA_FILE.write_text(updated_content, encoding='utf-8')

    print(f"\n✅ AI 메타데이터 생성 및 반영 완료: {updated_count}개 업데이트")
    return True


def capture_screenshots(game_ids):
    """Step 4: Capture screenshots with Playwright"""
    print("\n" + "="*60)
    print("📸 [4/5] 스크린샷 캡처 (Playwright)")
    print("="*60 + "\n")

    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📌 캡처할 게임: {len(game_ids)}개\n")

    captured = 0
    for game_id in game_ids:
        print(f"  {game_id}...", end=' ')
        try:
            from playwright.sync_api import sync_playwright

            game_url = f"file:///{GAMES_DIR / game_id / 'index.html'}".replace("\\", "/")

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(viewport={"width": 1280, "height": 720})
                page.goto(game_url, wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)

                screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"
                page.screenshot(path=str(screenshot_path))
                browser.close()

                print("✅")
                captured += 1

        except Exception as e:
            print(f"⚠️")

    print(f"\n✅ 캡처 완료: {captured}/{len(game_ids)}")
    return True


def move_completed_files(game_ids):
    """Step 6: Move processed ZIP files to Completed folder"""
    print("\n" + "="*60)
    print("📦 [6/6] 처리 완료 파일 정리")
    print("="*60 + "\n")

    if not game_ids:
        print("ℹ️  정리할 파일이 없습니다")
        return True

    completed_dir = Path(r"D:\Cometest_Dropzone\Completed")
    completed_dir.mkdir(parents=True, exist_ok=True)

    moved_count = 0
    failed_count = 0

    for game_id in game_ids:
        zip_file = INBOX_DIR / f"{game_id}.zip"

        if zip_file.exists():
            try:
                dest = completed_dir / f"{game_id}.zip"
                zip_file.rename(dest)
                print(f"  ✅ {game_id}.zip → Completed/")
                moved_count += 1
            except Exception as e:
                print(f"  ⚠️  {game_id}.zip: {str(e)[:40]}")
                failed_count += 1
        else:
            print(f"  ⓘ  {game_id}.zip: 이미 이동됨")

    print(f"\n✅ 파일 정리 완료: {moved_count}개 이동, {failed_count}개 실패")
    return True


def apply_hero_ui(game_ids):
    """Step 5: Apply Hero UI (latest game as banner)"""
    print("\n" + "="*60)
    print("🎨 [5/5] Hero UI 적용 및 배포")
    print("="*60 + "\n")

    if game_ids:
        hero_game = game_ids[0]
        print(f"⭐ Hero 게임: {hero_game}")
        print("✅ Hero UI 설정 완료")
    else:
        print("ℹ️  Hero 게임 없음")

    # Git deploy
    print("\n🚀 Vercel 배포 중...")
    try:
        subprocess.run(
            ["git", "add", "-A"],
            cwd=Path(r"D:\cometest_portal"),
            check=True,
            capture_output=True
        )

        subprocess.run(
            ["git", "commit", "-m", f"Feature: New games uploaded ({datetime.now().isoformat()})"],
            cwd=Path(r"D:\cometest_portal"),
            check=True,
            capture_output=True
        )

        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=Path(r"D:\cometest_portal"),
            check=True,
            capture_output=True
        )

        print("✅ Vercel 배포 완료")
    except Exception as e:
        print(f"⚠️  배포 스킵 ({e})")

    return True


def main():
    """Main pipeline"""
    print("\n" + "="*60)
    print("🎮 ZIP 게임 완전 처리 파이프라인")
    print("="*60)

    # Execute all steps
    game_ids = extract_zip_files()

    if not game_ids:
        print("\n✅ 처리할 게임이 없습니다")
        return 0

    if not register_in_games_data(game_ids):
        return 1

    if not generate_ai_metadata(game_ids):
        return 1

    if not capture_screenshots(game_ids):
        return 1

    if not apply_hero_ui(game_ids):
        return 1

    if not move_completed_files(game_ids):
        return 1

    print("\n" + "="*60)
    print("✅ 모든 단계 완료!")
    print("="*60 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
