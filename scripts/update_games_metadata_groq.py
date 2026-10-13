#!/usr/bin/env python3
"""
Groq AI를 사용한 새 게임만 메타데이터 생성
- 기존 51개 게임 절대 건드리지 않음
- Inbox의 새 ZIP 파일들만 처리
"""

import sys
from pathlib import Path

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_new_game_ids():
    """Inbox에서 새 ZIP 파일 감지"""
    inbox_dir = Path(r"D:\Cometest_Dropzone\Inbox")
    games_file = Path(r"D:\cometest_portal\src\config\gamesData.ts")

    if not inbox_dir.exists():
        print(f"❌ Inbox 폴더를 찾을 수 없습니다: {inbox_dir}")
        return []

    # 기존 게임 ID 읽기
    existing_ids = set()
    if games_file.exists():
        content = games_file.read_text(encoding='utf-8')
        import re
        existing_ids = set(re.findall(r"id:\s*['\"]([^'\"]+)['\"]", content))

    # 새 게임만 필터링
    zip_files = sorted(inbox_dir.glob("*.zip"))
    new_games = [f.stem for f in zip_files if f.stem not in existing_ids]

    print(f"✅ 새 게임: {len(new_games)}개")
    for game_id in new_games:
        print(f"   - {game_id}")

    return new_games


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("🤖 새 게임 메타데이터 분석")
    print("="*60 + "\n")

    new_games = get_new_game_ids()

    if not new_games:
        print("\n✅ 새로운 게임이 없습니다.")
        return 0

    print(f"\n✅ 준비 완료: {len(new_games)}개 게임")
    print("   (자세한 처리는 auto_upload_ai_classifier.py에서 수행)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
