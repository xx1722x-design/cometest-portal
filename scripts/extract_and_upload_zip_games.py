#!/usr/bin/env python3
"""
ZIP 게임 파일 추출 및 업로드 파이프라인
1. ZIP 압축 해제
2. 게임 폴더로 복사
3. 메타데이터 생성
4. 스크린샷 캡처
5. Hero UI 적용
6. Vercel 배포
"""

import zipfile
import shutil
import sys
from pathlib import Path

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

INBOX_DIR = Path(r"D:\Cometest_Dropzone\Inbox")
GAMES_DIR = Path(r"D:\cometest_portal\public\games")
BACKUP_DIR = Path(r"D:\Cometest_Dropzone\Backup")

def extract_zip_files():
    """ZIP 파일 압축 해제 및 폴더로 이동"""
    print("\n" + "="*60)
    print("📦 [1/6] ZIP 파일 압축 해제 중...")
    print("="*60 + "\n")

    if not INBOX_DIR.exists():
        print(f"❌ Inbox 폴더를 찾을 수 없습니다: {INBOX_DIR}")
        return False

    zip_files = sorted(INBOX_DIR.glob("*.zip"))

    if not zip_files:
        print(f"⚠️  Inbox에 ZIP 파일이 없습니다")
        return True

    print(f"🔍 발견된 ZIP 파일: {len(zip_files)}개\n")

    # 게임 폴더 생성
    GAMES_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    success_count = 0
    failed_files = []

    for idx, zip_path in enumerate(zip_files, 1):
        game_id = zip_path.stem
        print(f"[{idx}/{len(zip_files)}] 압축 해제: {game_id}...", end=' ')

        try:
            # ZIP 파일 무결성 확인
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # 테스트
                test_result = zip_ref.testzip()
                if test_result:
                    print(f"❌ 손상됨 (파일: {test_result})")
                    failed_files.append((game_id, "ZIP 손상"))
                    continue

                # 게임 폴더 생성
                game_folder = GAMES_DIR / game_id
                game_folder.mkdir(exist_ok=True)

                # 압축 해제
                zip_ref.extractall(game_folder)

            # index.html 확인
            if (game_folder / "index.html").exists():
                print(f"✅ 완료 ({game_folder})")
                success_count += 1
            else:
                print(f"⚠️  index.html 없음")
                failed_files.append((game_id, "index.html 없음"))

        except zipfile.BadZipFile as e:
            print(f"❌ ZIP 오류: {e}")
            failed_files.append((game_id, f"ZIP 오류: {e}"))
        except Exception as e:
            print(f"❌ 오류: {e}")
            failed_files.append((game_id, str(e)))

    print(f"\n✅ 압축 해제 완료: {success_count}/{len(zip_files)}")

    if failed_files:
        print(f"\n⚠️  실패한 파일:")
        for game_id, reason in failed_files:
            print(f"   - {game_id}: {reason}")

    return success_count > 0


def verify_games():
    """추출된 게임 폴더 확인"""
    print("\n" + "="*60)
    print("✅ [2/6] 게임 폴더 확인")
    print("="*60 + "\n")

    game_folders = sorted([d for d in GAMES_DIR.iterdir() if d.is_dir()])

    if not game_folders:
        print("❌ 게임 폴더가 없습니다")
        return False

    print(f"🎮 추출된 게임: {len(game_folders)}개\n")
    for folder in game_folders[:10]:
        print(f"   ✓ {folder.name}")

    if len(game_folders) > 10:
        print(f"   ... 외 {len(game_folders) - 10}개")

    return True


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("🎮 ZIP 게임 압축 해제 및 준비 파이프라인")
    print("="*60)

    # Step 1: ZIP 압축 해제
    if not extract_zip_files():
        print("\n❌ ZIP 압축 해제 실패")
        return 1

    # Step 2: 게임 폴더 확인
    if not verify_games():
        print("\n❌ 게임 폴더 확인 실패")
        return 1

    print("\n" + "="*60)
    print("✅ ZIP 압축 해제 및 준비 완료!")
    print("="*60)
    print("\n다음 단계:")
    print("- 메타데이터 생성 및 캡처를 위해 다음 스크립트 실행:")
    print("  python auto_upload_ai_classifier.py")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
