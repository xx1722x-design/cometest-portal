#!/usr/bin/env python3
"""
Groq API 400 에러 복구 및 메타데이터 업데이트 스크립트
1. gamesData.ts에서 13개 신규 게임 찾기
2. Groq AI로 정확한 오컬트 영문 메타데이터 생성
3. 파일 업데이트 및 Vercel 배포
"""

import re
import sys
import subprocess
import time
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
import os

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(Path(__file__).parent.parent / ".env")

GAMES_DATA_FILE = Path(r"D:\cometest_portal\src\config\gamesData.ts")
NEW_GAME_IDS = [
    'at-both-ends', 'gjallarhorn', 'huecorn', 'panzercorn', 'prismhoof',
    'rainbow-rescue', 'seven-cushions', 'sp13ktra', 'spectral-horn',
    'suupaa-yunikoon', 'swinicorn', 'unicorn-fireball', 'unifrost'
]

def generate_metadata(game_id):
    """Gemini API로 메타데이터 생성"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print(f"  ⚠️  API 키 없음")
        return None, None

    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel("models/gemini-3.5-flash")

    prompt = f"""Generate a single line English occult-themed title and description for game "{game_id}".
Format EXACTLY as:
TITLE:cosmic-dark-title
DESC:eerie description spanning 2-3 sentences about cosmic horror and the void."""

    try:
        response = model.generate_content(prompt)
        text = response.text

        # Parse response
        title_match = re.search(r'TITLE:([^\n]+)', text)
        desc_match = re.search(r'DESC:([^\n]+)', text)

        title = title_match.group(1).strip() if title_match else "Mysterious Game"
        desc = desc_match.group(1).strip() if desc_match else "An enigmatic experience."

        return title, desc

    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ 에러: {error_msg[:60]}")
        return None, None


def update_games_metadata():
    """gamesData.ts 파일의 게임 메타데이터 업데이트"""
    print("\n" + "="*60)
    print("🔧 [1/2] 메타데이터 복구 중...")
    print("="*60 + "\n")

    if not GAMES_DATA_FILE.exists():
        print(f"❌ {GAMES_DATA_FILE} 파일을 찾을 수 없습니다")
        return False

    content = GAMES_DATA_FILE.read_text(encoding='utf-8')
    updated_count = 0

    print(f"📌 처리할 게임: {len(NEW_GAME_IDS)}개\n")

    for game_id in NEW_GAME_IDS:
        print(f"  {game_id}...", end=' ', flush=True)

        # Groq에서 메타데이터 생성
        title, desc = generate_metadata(game_id)

        if title and desc:
            # 정규식으로 게임 항목 찾기
            pattern = f"id: '{game_id}',[\\s\\S]*?englishTitle: '[^']*',[\\s\\S]*?englishDescription: '[^']*',"

            def replace_metadata(match):
                return f"""id: '{game_id}',
    englishTitle: '{title}',
    englishDescription: '{desc}',"""

            new_content = re.sub(pattern, replace_metadata, content)

            if new_content != content:
                content = new_content
                print("✅")
                updated_count += 1
                time.sleep(2)  # Groq API 레이트 제한
            else:
                print("⚠️  (패턴 불일치)")
        else:
            print("❌")

    # 파일 저장
    GAMES_DATA_FILE.write_text(content, encoding='utf-8')
    print(f"\n✅ 메타데이터 업데이트 완료: {updated_count}/{len(NEW_GAME_IDS)}")

    return updated_count > 0


def deploy_to_vercel():
    """Git Push로 Vercel 자동 배포"""
    print("\n" + "="*60)
    print("🚀 [2/2] Vercel 배포 중...")
    print("="*60 + "\n")

    portal_dir = Path(r"D:\cometest_portal")

    try:
        print("  📦 Git add...", end=' ', flush=True)
        subprocess.run(
            ["git", "add", "-A"],
            cwd=portal_dir,
            check=True,
            capture_output=True
        )
        print("✅")

        print("  💬 Git commit...", end=' ', flush=True)
        subprocess.run(
            ["git", "commit", "-m", "Fix: Restore occult metadata for 13 games"],
            cwd=portal_dir,
            check=True,
            capture_output=True
        )
        print("✅")

        print("  🌐 Git push...", end=' ', flush=True)
        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=portal_dir,
            check=True,
            capture_output=True
        )
        print("✅")

        print("\n✅ Vercel 배포 완료")
        return True

    except subprocess.CalledProcessError as e:
        print(f"\n⚠️  배포 실패: {e}")
        return False
    except Exception as e:
        print(f"\n⚠️  배포 중 에러: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("🎮 메타데이터 복구 및 배포 파이프라인")
    print("="*60)

    if not update_games_metadata():
        print("\n⚠️  메타데이터 복구 부분 실패")
        return 1

    if not deploy_to_vercel():
        print("\n⚠️  배포 실패")
        return 1

    print("\n" + "="*60)
    print("✅ 모든 작업 완료!")
    print("Vercel에 최신 메타데이터가 배포되었습니다.")
    print("="*60 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
