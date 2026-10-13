#!/usr/bin/env python3
"""
배치 게임 스크린샷 캡처 + 메타데이터 자동 매핑
- 각 게임의 예고 화면(썸네일) 자동 캡처
- 캡처된 이미지를 gamesData.ts 메타데이터와 매핑
- Hero UI용 썸네일 생성
"""

import time
import re
import json
import sys
from pathlib import Path

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Project paths
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"
GAMES_FILE = PROJECT_ROOT / "src" / "config" / "gamesData.ts"

def extract_games_from_ts():
    """gamesData.ts에서 GAMES_DATA 배열 추출"""
    if not GAMES_FILE.exists():
        print(f"❌ {GAMES_FILE} 파일을 찾을 수 없습니다.")
        return []

    try:
        content = GAMES_FILE.read_text(encoding='utf-8')

        # GAMES_DATA 배열 찾기 (export const GAMES_DATA: GameItem[] = [...])
        games_match = re.search(
            r'export\s+const\s+GAMES_DATA\s*:\s*GameItem\[\]\s*=\s*\[([\s\S]*?)\]\s*(?:;|$)',
            content
        )

        if not games_match:
            # 대체 패턴: export const games = [...]
            games_match = re.search(
                r'export\s+const\s+(?:games|GAMES_DATA)\s*=\s*\[([\s\S]*?)\]\s*(?:;|$)',
                content
            )

        if not games_match:
            print("❌ gamesData.ts에서 GAMES_DATA 배열을 찾을 수 없습니다.")
            return []

        games_str = '[' + games_match.group(1) + ']'

        # 수동 JSON 파싱 (TypeScript 형식 제거)
        # 작은따옴표를 큰따옴표로 변환
        games_str = re.sub(r"'([^']*)'", r'"\1"', games_str)

        # true/false/null 을 Python 형식으로 변환
        games_str = games_str.replace('true', 'True')
        games_str = games_str.replace('false', 'False')
        games_str = games_str.replace('null', 'None')

        # 콤마 오류 수정 (},} → })
        games_str = re.sub(r'},\s*}', '}', games_str)

        # 속성 뒤의 콤마 제거 (다음이 }, 또는 ] 일 때)
        games_str = re.sub(r',(\s*[\}\]])', r'\1', games_str)

        # Python eval로 파싱
        games = eval(games_str)

        if isinstance(games, list) and len(games) > 0:
            print(f"✅ {len(games)}개 게임 로드됨")
            return games
        else:
            print("❌ 게임 배열을 파싱할 수 없습니다.")
            return []

    except Exception as e:
        print(f"❌ gamesData.ts 파싱 오류: {type(e).__name__}")
        print(f"   상세: {str(e)[:100]}")
        return []

def capture_game_screenshot(game_id, game_folder):
    """Playwright로 게임 스크린샷 캡처"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"  🎥 캡처 중: {game_id}")

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
                print(f"     📄 페이지 로드: {game_url}")
                page.goto(game_url, wait_until="domcontentloaded", timeout=15000)

                # Wait for game rendering
                print(f"     ⏳ 렌더링 대기 중...")
                time.sleep(3)

                # Capture screenshot
                page.screenshot(path=str(screenshot_path), full_page=False)

                print(f"     ✅ 저장 완료: {screenshot_path}")
                return f"thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"     ❌ 캡처 실패: {page_error}")
                return None
            finally:
                browser.close()

    except ImportError:
        print("  ❌ Playwright가 설치되지 않았습니다.")
        print("     설치: pip install playwright")
        print("     그 후: playwright install")
        return None
    except Exception as e:
        print(f"  ❌ 캡처 오류: {e}")
        return None

def update_games_metadata(games, captured_images):
    """캡처된 이미지를 게임 메타데이터에 추가"""
    updated_count = 0

    for game in games:
        game_id = game.get('id')
        if game_id in captured_images:
            game['thumbnail'] = captured_images[game_id]
            updated_count += 1

    return updated_count

def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("📸 게임 스크린샷 배치 캡처 + 메타데이터 매핑")
    print("="*60 + "\n")

    # 1. gamesData.ts에서 게임 목록 읽기
    print("📖 게임 데이터 로드 중...")
    games = extract_games_from_ts()

    if not games:
        print("❌ 게임을 찾을 수 없습니다.")
        return 1

    print(f"✅ {len(games)}개 게임 로드됨\n")

    # 2. LABS_DIR에서 실제 존재하는 게임만 필터링
    games_to_capture = []
    for game in games:
        game_id = game.get('id')
        game_folder = LABS_DIR / game_id

        if game_folder.exists() and (game_folder / "index.html").exists():
            games_to_capture.append((game_id, game_folder, game))
        else:
            print(f"⚠️  {game_id}: 폴더를 찾을 수 없음 (스킵)")

    if not games_to_capture:
        print("\n❌ 캡처할 게임이 없습니다.")
        return 1

    print(f"🎮 캡처할 게임 {len(games_to_capture)}개 준비됨\n")

    # 3. 각 게임 캡처
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    captured_images = {}
    success_count = 0

    for idx, (game_id, game_folder, game_data) in enumerate(games_to_capture, 1):
        print(f"[{idx}/{len(games_to_capture)}] 🔧 {game_id} 처리 중")

        image_path = capture_game_screenshot(game_id, game_folder)
        if image_path:
            captured_images[game_id] = image_path
            success_count += 1
        print()

    # 4. 메타데이터 업데이트
    if captured_images:
        print("\n📝 메타데이터에 썸네일 매핑 중...")
        updated_count = update_games_metadata(games, captured_images)
        print(f"✅ {updated_count}개 게임 메타데이터 업데이트됨")

    # 최종 요약
    print("\n" + "="*60)
    print(f"✅ 캡처 완료: {success_count}/{len(games_to_capture)} 성공")
    print("="*60)
    print(f"\n📸 저장된 이미지:")
    for game_id, image_path in captured_images.items():
        print(f"  ✓ {image_path}")

    print(f"\n📋 썸네일 디렉토리: {THUMBNAILS_DIR}")

    return 0

if __name__ == "__main__":
    sys.exit(main())
