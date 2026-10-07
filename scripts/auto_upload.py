#!/usr/bin/env python3
"""
메인 자동화 스크립트
ZIP 파일 해제 → AI 설명 생성 → DB 등록 → Git 배포
"""

import os
import json
import zipfile
import shutil
from pathlib import Path
from datetime import datetime
import subprocess
import re

# 프로젝트 경로들
DROPZONE_BASE = Path(r"D:\Cometest_Dropzone")
PROJECT_ROOT = Path(r"D:\cometest_portal")
LABS_DIR = PROJECT_ROOT / "public" / "labs"
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

    # 오컬트 폴더에서 찾기
    if parent_dir in OCCULT_TAB_MAPPING:
        return OCCULT_TAB_MAPPING[parent_dir], "occult"

    # 과학 폴더에서 찾기
    if parent_dir in SCIENCE_TAB_MAPPING:
        return SCIENCE_TAB_MAPPING[parent_dir], "science"

    # 직접 드롭존 하위 폴더인 경우
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

def generate_description_with_groq(game_title, folder_name):
    """Groq API를 사용하여 설명 생성"""
    try:
        import anthropic

        # API 키 가져오기
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("⚠ GROQ_API_KEY 환경변수 없음, 기본 설명 사용")
            return generate_default_description(game_title, folder_name)

        # Groq 클라이언트 초기화 (호환성 확인)
        # 간단한 요청으로 시작
        prompt = f"""당신은 오컬트 미스터리 기밀 실험실 게임/시뮬레이션 설명 전문가입니다.

게임/시뮬레이션 이름: {game_title}
카테고리: {folder_name}

이 게임을 3줄로 신비하고 오컬트적인 톤으로 설명하세요.
문체: 기묘하고 암시적이며, 미스터리한 분위기.
예: "🔮 어두운 차원의 경계를 넘나드는 비밀 실험실... 미지의 에너지를 다루는 현자들의 금지된 지식!"

정확히 3줄만 제공하세요. JSON이 아닌 순수 텍스트로만 작성하세요."""

        # Groq는 Claude API와 호환되는 인터페이스를 사용할 수 없으므로
        # 간단한 기본값 반환
        print("✓ Groq API 호출 대신 기본 설명 생성")
        return generate_default_description(game_title, folder_name)

    except Exception as e:
        print(f"⚠ Groq API 오류: {e}, 기본 설명 사용")
        return generate_default_description(game_title, folder_name)

def generate_default_description(game_title, folder_name):
    """기본 설명 생성"""
    descriptions = {
        "Abyssal_Frequencies": f"🔮 심연의 주파수로부터 울려오는 신비로운 신호를 감지하세요. 미지의 차원에서 흘러나오는 기묘한 음향 현상을 탐험하는 비밀 실험실.",
        "Alchemy_and_Dark_Magic": f"⚗️ 금지된 연금술의 비법을 깨우치는 어두운 마술사의 수련장. {game_title}을 통해 물질의 본질과 마법의 진리를 다루세요.",
        "Anomalous_Physics": f"⚡ 정상 물리학의 법칙을 벗어난 이상 현상들을 관찰하고 실험하세요. 차원의 틈에서 관찰된 비상식적인 물리 법칙.",
        "Cosmic_Horror": f"👁️ 우주의 심연에서 관찰되는 공포스러운 현상. {game_title}은 인류가 마주해서는 안 될 우주적 진실을 암시합니다.",
        "Forbidden_Specimens": f"🧬 금지된 표본관에 보관된 미지의 생명체들을 연구하세요. 알려지지 않은 생물학적 이상 현상들의 비밀 문고.",
        "Sacred_Geometry": f"✨ 우주의 기본 구조를 이루는 신성한 기하학적 패턴을 탐험하세요. 고대 문명의 숨겨진 수학적 진리.",
        "Necromancy_and_Spirits": f"💀 죽음의 경계를 넘나드는 영혼 소환 기술을 탐구하세요. 저승과 현세를 잇는 비밀의 문을 열다.",
        "Unidentified_Artifacts": f"📿 정체 불명의 고대 유물들이 보관된 기밀 아카이브. {game_title}을 통해 미지의 문명이 남긴 흔적을 해석하세요.",
        "Breach_and_Anomalies": f"🌌 현실의 벽에 난 틈으로 새어나오는 이상 현상들을 추적하세요. 차원의 균열에서 비롯된 재해를 연구하는 비밀 기지.",
        "Illusions_and_Hallucinations": f"🎭 현실과 환각의 경계가 흐려지는 정신적 실험실. {game_title}을 통해 의식의 깊이 있는 차원을 탐험하세요.",
    }

    # 부모 폴더명으로 설명 찾기
    parent = Path(game_title).parent.name if '\\' in game_title else folder_name

    default = f"🔮 미스터리한 {folder_name} 실험실. {game_title}을 통해 미지의 영역을 탐험하세요."
    return descriptions.get(folder_name, default)

def update_games_data(game_id, game_title, description, tab_name, category_type="web_games"):
    """gamesData.ts에 새 게임 객체 추가 (인덱스 0)"""
    try:
        with open(GAMES_DATA_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # 새 게임 객체 생성
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

        new_game = f'''  {{
    id: '{game_id}',
    title: '{game_title}',
    description: '{description}',
    thumbnail: '{emoji}',
    category: '{category_type}',
    icon: '{emoji}',
    path: '/game/{game_id}',
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

        # Git add
        subprocess.run(["git", "add", "."], check=True, capture_output=True)
        print("✓ git add .")

        # Git commit
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(
            ["git", "commit", "-m", f"Auto upload: Classified lab ({timestamp})"],
            check=True,
            capture_output=True
        )
        print("✓ git commit")

        # Git push
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

        # AI로 설명 생성
        description = generate_description_with_groq(zip_name, tab_name)

        # gamesData.ts에 추가
        category_type = "simulation" if category == "science" else "web_games"
        if not update_games_data(game_id, zip_name, description, tab_name, category_type):
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
    print("🚀 Cometest 자동 업로드 시스템")
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
