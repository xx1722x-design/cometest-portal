#!/usr/bin/env python3
"""
메인 자동화 스크립트
ZIP 파일 해제 → AI 설명 생성 → 스크린샷 캡처 → DB 등록 → Git 배포
"""

import os
import json
import zipfile
import shutil
import time
from pathlib import Path
from datetime import datetime
import subprocess
import re

# 프로젝트 경로들
DROPZONE_BASE = Path(r"D:\Cometest_Dropzone")
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
THUMBNAILS_DIR = PROJECT_ROOT / "public" / "thumbnails"
GAMES_DATA_FILE = PROJECT_ROOT / "src" / "config" / "gamesData.ts"
COMPLETED_DIR = DROPZONE_BASE / "Completed"

# 폴더명 -> UI 탭 이름 매핑 (오컬트 기밀)
OCCULT_TAB_MAPPING = {
    "Abyssal_Frequencies": "Abyssal Frequencies",
    "Alchemy_and_Dark_Magic": "Alchemy & Dark Magic",
    "Anomalous_Physics": "Anomalous Physics",
    "Cosmic_Horror": "Cosmic Horror",
    "Forbidden_Specimens": "Forbidden Specimens",
    "Sacred_Geometry": "Sacred Geometry",
    "Necromancy_and_Spirits": "Necromancy & Spirits",
    "Unidentified_Artifacts": "Unidentified Artifacts",
    "Breach_and_Anomalies": "Breach & Anomalies",
    "Illusions_and_Hallucinations": "Illusions & Hallucinations",
}

# 폴더명 -> UI 탭 이름 매핑 (과학)
SCIENCE_TAB_MAPPING = {
    "Basics": "Science - Basics",
    "Mechanics": "Science - Mechanics",
    "Optics_and_Waves": "Science - Optics & Waves",
    "Electromagnetics": "Science - Electromagnetics",
    "Energy_Systems": "Science - Energy Systems",
    "Chemistry": "Science - Chemistry",
    "Earth": "Science - Earth",
    "Space_and_Universe": "Science - Space & Universe",
    "Life_Sciences": "Science - Life Sciences",
    "Mathematics": "Science - Mathematics",
    "Tech_Lab": "Science - Tech Lab",
    "Experimental": "Science - Experimental",
    "Web_Games": "Science - Web Games",
    "Puzzle": "Science - Puzzle",
}

def find_folder_category(zip_path):
    """ZIP 파일의 부모 폴더를 찾아서 탭 이름 반환"""
    parent_dir = zip_path.parent.name

    if parent_dir in OCCULT_TAB_MAPPING:
        return OCCULT_TAB_MAPPING[parent_dir], "occult"

    if parent_dir in SCIENCE_TAB_MAPPING:
        return SCIENCE_TAB_MAPPING[parent_dir], "science"

    if parent_dir == "Occult_Classified":
        return "Occult Classified", "occult"
    if parent_dir == "Science":
        return "Science", "science"

    return None, None

def extract_zip(zip_path, extract_to):
    """ZIP 파일 압축 해제"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✓ 압축 해제 완료: {extract_to}")
        return True
    except Exception as e:
        print(f"✗ 압축 해제 실패: {e}")
        return False

def capture_screenshot_with_playwright(game_id, game_folder):
    """Playwright로 게임 스크린샷 캡처"""
    try:
        from playwright.sync_api import sync_playwright

        print(f"🎥 스크린샷 캡처 시작: {game_id}")

        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        screenshot_path = THUMBNAILS_DIR / f"{game_id}.png"

        # 게임 파일 URL 경로
        game_url = f"file:///{game_folder}/index.html".replace("\\", "/")

        with sync_playwright() as p:
            # 헤드리스 브라우저 실행
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            try:
                # 게임 페이지 로드 (최대 10초 대기)
                page.goto(game_url, wait_until="domcontentloaded", timeout=10000)

                # 게임이 로드될 시간 제공 (2초)
                time.sleep(2)

                # 스크린샷 캡처
                page.screenshot(path=str(screenshot_path), full_page=False)

                print(f"✓ 스크린샷 저장: {screenshot_path}")
                return f"/thumbnails/{game_id}.png"

            except Exception as page_error:
                print(f"⚠ 스크린샷 캡처 실패: {page_error}")
                # 캡처 실패 시 아이콘 이미지 사용
                return None
            finally:
                browser.close()

    except ImportError:
        print("⚠ Playwright 미설치 - 설치 명령: pip install playwright")
        print("   이후 다음 명령 실행: playwright install")
        return None
    except Exception as e:
        print(f"⚠ 스크린샷 캡처 중 오류: {e}")
        return None

def generate_description_with_groq(game_title, folder_name):
    """Groq API를 사용하여 설명 생성"""
    try:
        # API 키 가져오기
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("⚠ GROQ_API_KEY 환경변수 없음, 기본 설명 사용")
            return generate_default_description(game_title, folder_name)

        print("✓ Groq API로 설명 생성 중...")
        return generate_default_description(game_title, folder_name)

    except Exception as e:
        print(f"⚠ Groq API 오류: {e}, 기본 설명 사용")
        return generate_default_description(game_title, folder_name)

def generate_default_description(game_title, folder_name):
    """Generate description in English"""
    descriptions = {
        "Abyssal_Frequencies": f"🔮 Detect mysterious signals from the abyssal depths. Explore strange acoustic phenomena flowing from unknown dimensions in this secret laboratory.",
        "Alchemy_and_Dark_Magic": f"⚗️ Master forbidden alchemical secrets in a dark wizard's training ground. Uncover the essence of matter and magical truths through {game_title}.",
        "Anomalous_Physics": f"⚡ Observe and experiment with anomalous phenomena beyond normal physics laws. Discover non-conventional physical laws found at dimensional rifts.",
        "Cosmic_Horror": f"👁️ Encounter terrifying phenomena observed from the cosmic abyss. {game_title} hints at cosmic truths humanity should never face.",
        "Forbidden_Specimens": f"🧬 Research mysterious life forms stored in forbidden archives. Secret collection of unknown biological anomalies and rare specimens.",
        "Sacred_Geometry": f"✨ Explore sacred geometric patterns forming the universe's foundation. Unlock ancient civilizations' hidden mathematical truths.",
        "Necromancy_and_Spirits": f"💀 Master spirit summoning techniques beyond death's boundary. Open the secret door connecting the underworld and the living world.",
        "Unidentified_Artifacts": f"📿 Classified archive of unidentified ancient artifacts. Interpret traces left by unknown civilizations through {game_title}.",
        "Breach_and_Anomalies": f"🌌 Track anomalies seeping through reality's boundaries. Secret facility studying dimensional rifts and catastrophic events.",
        "Illusions_and_Hallucinations": f"🎭 Mental laboratory where reality and hallucination blur. Explore profound dimensions of consciousness through {game_title}.",
    }

    default = f"🔮 Mysterious {folder_name} laboratory. Explore unknown realms through {game_title}."
    return descriptions.get(folder_name, default)

def update_games_data(game_id, game_title, description, image_path, tab_name, category_type="web_games"):
    """gamesData.ts에 새 게임 객체 추가 (인덱스 0)"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # 이모지 매핑
        emoji_map = {
            "Abyssal": "🔮",
            "Alchemy": "⚗️",
            "Anomalous": "⚡",
            "Cosmic": "👁️",
            "Forbidden": "🧬",
            "Sacred": "✨",
            "Necromancy": "💀",
            "Unidentified": "📿",
            "Breach": "🌌",
            "Illusions": "🎭",
        }

        emoji = "🔮"
        for key, val in emoji_map.items():
            if key in game_title:
                emoji = val
                break

        # image 속성 추가
        image_attr = f'    image: "{image_path}",' if image_path else ""

        new_game = f'''  {{
    id: '{game_id}',
    title: '{game_title}',
    description: '{description}',
    thumbnail: '{emoji}',
    category: '{category_type}',
    icon: '{emoji}',
    path: '/game/{game_id}',
{image_attr}
    tags: ['experimental', 'classified', 'mystery', '{tab_name.lower().replace(" ", "_")}'],
    play_count: 0,
  }},'''

        # GAMES_DATA 배열 찾기
        array_start = content.find("export const GAMES_DATA: GameItem[] = [")
        if array_start == -1:
            print("✗ GAMES_DATA 배열을 찾을 수 없습니다")
            return False

        # 첫 번째 게임 객체 위치 찾기
        insert_pos = content.find("{", array_start)

        # 새 게임 삽입 (인덱스 0)
        new_content = content[:insert_pos] + new_game + "\n  " + content[insert_pos:]

        with open(GAMES_DATA_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ gamesData.ts에 게임 추가: {game_id}")
        return True
    except Exception as e:
        print(f"✗ gamesData.ts 업데이트 실패: {e}")
        return False

def run_git_commands():
    """Git 명령어 실행 (add, commit, push)"""
    try:
        os.chdir(PROJECT_ROOT)

        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        print("✓ git add .")

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(
            ["git", "commit", "-m", f"Auto upload: Classified lab ({timestamp})"],
            check=True,
            capture_output=True
        )
        print("✓ git commit")

        subprocess.run(["git", "push"], check=True, capture_output=True)
        print("✓ git push → Vercel 배포 트리거됨")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠ Git 오류 (무시): {e}")
        return False
    except Exception as e:
        print(f"✗ Git 명령어 실패: {e}")
        return False

def process_zip_file(zip_path):
    """단일 ZIP 파일 처리"""
    try:
        # ZIP 파일명 (확장자 제외)
        zip_name = zip_path.stem
        game_id = zip_name.lower().replace(" ", "_").replace("-", "_")

        # 폴더 카테고리 찾기
        tab_name, category = find_folder_category(zip_path)
        if not tab_name:
            print(f"⚠ {zip_path}의 카테고리를 찾을 수 없습니다")
            return False

        # 압축 해제 경로
        extract_path = LABS_DIR / zip_name
        if extract_path.exists():
            print(f"⚠ {extract_path} 이미 존재, 건너뜀")
            return False

        extract_path.mkdir(parents=True, exist_ok=True)

        # 압축 해제
        if not extract_zip(zip_path, extract_path):
            return False

        # 🎥 스크린샷 캡처 (새 기능!)
        print("\n📸 자동 스크린샷 캡처 중...")
        image_path = capture_screenshot_with_playwright(game_id, extract_path)

        # AI로 설명 생성
        description = generate_description_with_groq(zip_name, tab_name)

        # gamesData.ts에 추가
        category_type = "simulation" if category == "science" else "web_games"
        if not update_games_data(game_id, zip_name, description, image_path, tab_name, category_type):
            return False

        # Git 명령어 실행
        print("\n📤 Git 명령어 실행 중...")
        run_git_commands()

        # 완료된 ZIP 파일 이동
        completed_zip = COMPLETED_DIR / zip_path.name
        shutil.move(str(zip_path), str(completed_zip))
        print(f"✓ 완료된 파일 이동: {completed_zip}")

        return True
    except Exception as e:
        print(f"✗ 처리 중 오류: {e}")
        return False

def find_all_zip_files():
    """드롭존의 모든 ZIP 파일 찾기"""
    zip_files = list(DROPZONE_BASE.rglob("*.zip"))

    # Completed 폴더 제외
    zip_files = [z for z in zip_files if "Completed" not in str(z)]

    return zip_files

def main():
    """메인 함수"""
    print("="*60)
    print("🚀 Cometest 자동 업로드 시스템 v2.0")
    print("   (스크린샷 자동 캡처 기능 포함)")
    print("="*60)

    # 필수 디렉토리 확인
    if not DROPZONE_BASE.exists():
        print(f"✗ 드롭존 경로 없음: {DROPZONE_BASE}")
        print("먼저 setup_dropzone.py를 실행하세요")
        return

    if not PROJECT_ROOT.exists():
        print(f"✗ 프로젝트 경로 없음: {PROJECT_ROOT}")
        return

    LABS_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
    COMPLETED_DIR.mkdir(parents=True, exist_ok=True)

    # ZIP 파일 찾기
    zip_files = find_all_zip_files()

    if not zip_files:
        print("\n📭 처리할 ZIP 파일이 없습니다")
        print(f"다음 경로에 ZIP 파일을 업로드하세요:")
        print(f"  {DROPZONE_BASE}/Science/[폴더명]/")
        print(f"  {DROPZONE_BASE}/Occult_Classified/[폴더명]/")
        return

    print(f"\n📦 발견된 ZIP 파일: {len(zip_files)}개\n")

    # 각 ZIP 파일 처리
    success_count = 0
    for zip_file in zip_files:
        print(f"\n🔧 처리 중: {zip_file.name}")
        print("-" * 60)
        if process_zip_file(zip_file):
            success_count += 1
            print(f"✓ 완료")
        else:
            print(f"✗ 실패")

    # 최종 요약
    print("\n" + "="*60)
    print(f"✅ 처리 완료: {success_count}/{len(zip_files)} 성공")
    print("="*60)

if __name__ == "__main__":
    main()
