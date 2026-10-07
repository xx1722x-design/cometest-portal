#!/usr/bin/env python3
"""
드롭존 폴더 트리 생성 스크립트
D:\Cometest_Dropzone\ 아래에 과학 및 오컬트 탭별 하위 폴더 자동 생성
"""

import os
from pathlib import Path

# 드롭존 기본 경로
DROPZONE_BASE = r"D:\Cometest_Dropzone"

# 과학 탭 폴더들
SCIENCE_FOLDERS = [
    "Basics",
    "Mechanics",
    "Optics_and_Waves",
    "Electromagnetics",
    "Energy_Systems",
    "Chemistry",
    "Earth",
    "Space_and_Universe",
    "Life_Sciences",
    "Mathematics",
    "Tech_Lab",
    "Experimental",
    "Web_Games",
    "Puzzle",
]

# 오컬트 기밀 탭 폴더들
OCCULT_FOLDERS = [
    "Abyssal_Frequencies",
    "Alchemy_and_Dark_Magic",
    "Anomalous_Physics",
    "Cosmic_Horror",
    "Forbidden_Specimens",
    "Sacred_Geometry",
    "Necromancy_and_Spirits",
    "Unidentified_Artifacts",
    "Breach_and_Anomalies",
    "Illusions_and_Hallucinations",
]

def create_dropzone_structure():
    """드롭존 폴더 구조 생성"""

    # 기본 디렉토리 생성
    base_path = Path(DROPZONE_BASE)
    base_path.mkdir(parents=True, exist_ok=True)
    print(f"✓ 기본 폴더 생성: {base_path}")

    # 과학 탭 폴더들 생성
    science_path = base_path / "Science"
    science_path.mkdir(exist_ok=True)

    for folder in SCIENCE_FOLDERS:
        folder_path = science_path / folder
        folder_path.mkdir(exist_ok=True)
        print(f"  ✓ {folder}")

    print(f"\n✓ 과학 탭 폴더 생성 완료: {science_path}")

    # 오컬트 탭 폴더들 생성
    occult_path = base_path / "Occult_Classified"
    occult_path.mkdir(exist_ok=True)

    for folder in OCCULT_FOLDERS:
        folder_path = occult_path / folder
        folder_path.mkdir(exist_ok=True)
        print(f"  ✓ {folder}")

    print(f"\n✓ 오컬트 탭 폴더 생성 완료: {occult_path}")

    # Completed 폴더 생성
    completed_path = base_path / "Completed"
    completed_path.mkdir(exist_ok=True)
    print(f"\n✓ 완료 폴더 생성: {completed_path}")

    print("\n" + "="*60)
    print("🎉 드롭존 폴더 구조 생성 완료!")
    print("="*60)
    print(f"\n드롭존 경로: {base_path}")
    print(f"\n폴더 구조:")
    print(f"  {base_path}/")
    print(f"  ├── Science/ (13개 폴더)")
    print(f"  ├── Occult_Classified/ (10개 폴더)")
    print(f"  └── Completed/")

if __name__ == "__main__":
    create_dropzone_structure()
