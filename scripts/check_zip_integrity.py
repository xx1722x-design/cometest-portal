#!/usr/bin/env python3
"""
ZIP 파일 무결성 검사 및 복구 가이드
"""

import zipfile
import json
from pathlib import Path
import sys
import os

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Inbox 경로
INBOX_DIR = Path(r"D:\Cometest_Dropzone\Inbox")
BACKUP_DIR = Path(r"D:\cometest_portal\backups")

def check_zip_integrity():
    """모든 ZIP 파일의 무결성 검사"""

    if not INBOX_DIR.exists():
        print(f"✅ Inbox 디렉토리가 없습니다: {INBOX_DIR}")
        return True

    zip_files = sorted(INBOX_DIR.glob("*.zip"))

    if not zip_files:
        print(f"✅ Inbox에 ZIP 파일이 없습니다.")
        return True

    print(f"📦 {len(zip_files)}개의 ZIP 파일 검사 시작...\n")

    corrupted_files = []
    valid_files = []

    for zip_path in zip_files:
        try:
            print(f"  검사: {zip_path.name}", end=" ... ")

            # ZIP 파일 무결성 테스트
            with zipfile.ZipFile(zip_path, 'r') as zf:
                result = zf.testzip()

                if result is None:
                    print("✅ 정상")
                    valid_files.append(zip_path.name)
                else:
                    print(f"❌ 손상됨 (파일: {result})")
                    corrupted_files.append(zip_path.name)

        except zipfile.BadZipFile as e:
            print(f"❌ 손상됨 (오류: {str(e)[:30]}...)")
            corrupted_files.append(zip_path.name)
        except Exception as e:
            print(f"⚠️  오류 (예외: {str(e)[:30]}...)")
            corrupted_files.append(zip_path.name)

    print(f"\n{'='*60}")
    print(f"✅ 정상: {len(valid_files)}/{len(zip_files)}")
    print(f"❌ 손상: {len(corrupted_files)}/{len(zip_files)}")
    print(f"{'='*60}\n")

    if corrupted_files:
        print("🔧 손상된 파일 복구 가이드:\n")
        print(corrupted_files)

        for filename in corrupted_files:
            print(f"\n  📌 {filename}")
            print(f"     1. 원본 백업본에서 복구:")
            print(f"        cp {BACKUP_DIR}/{filename} {INBOX_DIR}/{filename}")
            print(f"     2. 또는 다시 다운로드:")
            print(f"        - cometest.com에서 재다운로드")
            print(f"        - {INBOX_DIR}로 이동")

        return False

    return True

if __name__ == "__main__":
    success = check_zip_integrity()
    sys.exit(0 if success else 1)
