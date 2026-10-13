#!/usr/bin/env python3
"""
파이썬으로 배치 파일을 UTF-8 인코딩으로 안전하게 생성
Windows 배치 파일 인코딩 문제를 완전히 우회하기
"""

import sys
from pathlib import Path

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def create_master_batch():
    """Master_ZIP_Upload.bat를 UTF-8로 생성"""

    batch_path = Path(r"D:\Cometest_Dropzone\Master_ZIP_Upload.bat")

    # 배치 파일 내용
    batch_content = """@echo off
chcp 65001 >nul
echo [INFO] Starting ZIP Pipeline...
cd /d "D:\cometest_portal\scripts"
python -u process_zip_games.py
pause
"""

    print("📝 배치 파일 생성 중...")
    print(f"경로: {batch_path}")

    try:
        # UTF-8 인코딩으로 저장 (BOM 없음)
        batch_path.write_text(batch_content, encoding='utf-8')

        print("✅ Master_ZIP_Upload.bat 생성 완료!")
        print(f"파일 크기: {batch_path.stat().st_size} bytes")
        print("\n🚀 다음 단계:")
        print("1. D:\\Cometest_Dropzone\\Master_ZIP_Upload.bat를 더블클릭")
        print("2. process_zip_games.py가 실행됩니다")

        return 0

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(create_master_batch())
