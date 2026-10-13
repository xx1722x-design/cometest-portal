#!/usr/bin/env python3
"""
Inbox에서 새로운 ZIP 파일 감지 및 처리
- 기존 게임은 건드리지 않음
- 새 게임만 추출 및 처리
"""

import zipfile
import json
from pathlib import Path
import sys
import re

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

INBOX_DIR = Path(r"D:\Cometest_Dropzone\Inbox")
GAMES_FILE = Path(r"D:\cometest_portal\src\config\gamesData.ts")

def get_existing_game_ids():
    """gamesData.ts에서 기존 게임 ID 목록 추출"""
    if not GAMES_FILE.exists():
        return []

    try:
        content = GAMES_FILE.read_text(encoding='utf-8')

        # GAMES_DATA에서 모든 id: 'xxx' 패턴 찾기
        id_pattern = r"id:\s*['\"]([^'\"]+)['\"]"
        existing_ids = re.findall(id_pattern, content)

        return set(existing_ids)

    except Exception as e:
        print(f"⚠️  기존 게임 ID 읽기 오류: {e}")
        return set()


def get_new_game_files():
    """Inbox에서 새 ZIP 파일 감지"""
    if not INBOX_DIR.exists():
        print(f"❌ Inbox 폴더를 찾을 수 없습니다: {INBOX_DIR}")
        return []

    existing_ids = get_existing_game_ids()
    print(f"✅ 기존 게임 {len(existing_ids)}개 감지됨")

    zip_files = sorted(INBOX_DIR.glob("*.zip"))
    print(f"📦 Inbox의 ZIP 파일 {len(zip_files)}개 발견됨\n")

    new_games = []

    for zip_file in zip_files:
        # ZIP 파일 이름에서 게임 ID 추출 (예: game-name.zip → game-name)
        game_id = zip_file.stem

        if game_id in existing_ids:
            print(f"  ⏭️  {game_id:30} (기존 게임 - 스킵)")
        else:
            print(f"  ✨ {game_id:30} (새 게임 - 처리 대기)")
            new_games.append({
                'id': game_id,
                'path': zip_file
            })

    print(f"\n📊 처리할 새 게임: {len(new_games)}개")
    return new_games


def extract_new_games():
    """새 게임 ZIP 파일 추출"""
    new_games = get_new_game_files()

    if not new_games:
        print("\n✅ 새로운 게임이 없습니다.")
        return []

    print("\n" + "="*60)
    print("📂 새 게임 추출 중...")
    print("="*60 + "\n")

    extracted_games = []
    games_dir = Path(r"D:\cometest_portal\public\labs")
    games_dir.mkdir(parents=True, exist_ok=True)

    for game in new_games:
        game_id = game['id']
        zip_path = game['path']

        print(f"  📦 {game_id} 추출 중...", end=' ')

        try:
            game_folder = games_dir / game_id
            game_folder.mkdir(exist_ok=True)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(game_folder)

            # index.html 존재 확인
            if (game_folder / "index.html").exists():
                print("✅ 완료")
                extracted_games.append(game)
            else:
                print("❌ index.html 없음")

        except Exception as e:
            print(f"❌ 오류: {e}")

    print(f"\n✅ 추출 완료: {len(extracted_games)}개")
    return extracted_games


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔍 새 게임 감지 및 추출")
    print("="*60 + "\n")

    new_games = extract_new_games()

    # 새 게임 ID 출력
    if new_games:
        print(f"\n📋 처리할 게임 ID:")
        for game in new_games:
            print(f"   - {game['id']}")

    sys.exit(0 if len(new_games) > 0 else 1)
