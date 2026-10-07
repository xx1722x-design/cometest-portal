#!/usr/bin/env python3
"""
기존 게임/시뮬레이션 실제 스크린샷 일괄 캡처
public/labs 내 모든 게임에 대해 자동 캡처 수행
"""

import time
from pathlib import Path

# 프로젝트 경로
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"

# 캡처할 게임 목록 (public/labs에 존재하는 폴더)
GAMES_TO_CAPTURE = [
    "dante",
    "clawstrike",
]

def capture_game_screenshot(game_id, game_folder):
    """Playwright로 게임 스크린샷 캡처"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 캡처 중: {game_id}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        # 게임 파일 URL 경로
        game_url = f"file:///{game_folder}/index.html".replace("\\", "/")

        with sync_playwright() as p:
            # 헤드리스 브라우저 실행
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                # 게임 페이지 로드
                print(f"  📄 페이지 로드 중: {game_url}")
                page.goto(game_url, wait_until="domcontentloaded", timeout=15000)

                # 게임이 로드될 시간 제공
                print(f"  ⏳ 게임 렌더링 대기 중...")
                time.sleep(3)

                # 스크린샷 캡처
                page.screenshot(path=str(screenshot_path), full_page=False)

                print(f"  ✅ 저장 완료: {screenshot_path}")
                return f"/thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"  ❌ 캡처 실패: {page_error}")
                return None
            finally:
                browser.close()

    except ImportError:
        print("❌ Playwright 미설치")
        print("   설치 명령: pip install playwright")
        print("   이후 실행: playwright install")
        return None
    except Exception as e:
        print(f"❌ 캡처 중 오류: {e}")
        return None

def main():
    """메인 함수"""
    print("="*60)
    print("🎬 기존 게임 실제 스크린샷 일괄 캡처")
    print("="*60)

    if not LABS_DIR.exists():
        print(f"❌ {LABS_DIR} 폴더 없음")
        return

    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

    # 각 게임 캡처
    success_count = 0
    for game_id in GAMES_TO_CAPTURE:
        game_folder = LABS_DIR / game_id

        if not game_folder.exists():
            print(f"\n⚠️  {game_id} 폴더 없음 - 건너뜀")
            continue

        index_file = game_folder / "index.html"
        if not index_file.exists():
            print(f"\n⚠️  {game_id}/index.html 없음 - 건너뜀")
            continue

        print(f"\n🔧 {game_id} 처리")
        print("-" * 60)

        image_path = capture_game_screenshot(game_id, game_folder)
        if image_path:
            success_count += 1

    # 최종 요약
    print("\n" + "="*60)
    print(f"✅ 캡처 완료: {success_count}/{len(GAMES_TO_CAPTURE)} 성공")
    print("="*60)
    print(f"\n📸 저장된 이미지 경로:")
    for game_id in GAMES_TO_CAPTURE:
        print(f"  ✓ /thumbnails/{game_id}.png")

if __name__ == "__main__":
    main()
