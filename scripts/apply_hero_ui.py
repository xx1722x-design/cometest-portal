#!/usr/bin/env python3
"""
Hero UI 적용: 최신 게임을 Hero 배너로 강조 표시
- 최신 업로드 게임을 2-3배 크게 표시
- 날짜 기준 내림차순 정렬
- Hero 스타일 CSS 적용
"""

import re
import json
from pathlib import Path
from datetime import datetime
import sys
import os

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

GAMES_FILE = Path(r"D:\cometest_portal\src\config\gamesData.ts")
INDEX_FILE = Path(r"D:\cometest_portal\public\index.html")
STYLES_FILE = Path(r"D:\cometest_portal\public\styles\hero.css")

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

def get_sorted_games(games):
    """게임을 최신 업로드 순(내림차순)으로 정렬"""
    try:
        sorted_games = sorted(
            games,
            key=lambda g: g.get('uploadDate', '2000-01-01'),
            reverse=True
        )
        return sorted_games
    except Exception as e:
        print(f"⚠️  정렬 오류: {e}")
        return games

def generate_hero_css():
    """Hero UI 스타일시트 생성"""
    css_content = """/* Hero UI Styles - 최신 게임 강조 */

.games-hero-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 40px;
}

.hero-card-wrapper {
    width: 100%;
    margin-bottom: 20px;
}

.hero-card {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: flex-end;
    padding: 32px;
}

.hero-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
}

.hero-card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.7;
    z-index: 1;
}

.hero-card-content {
    position: relative;
    z-index: 2;
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    width: 100%;
}

.hero-card-badge {
    display: inline-block;
    background: rgba(255, 215, 0, 0.9);
    color: #000;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.hero-card-title {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 12px;
    line-height: 1.2;
}

.hero-card-description {
    font-size: 18px;
    margin-bottom: 16px;
    opacity: 0.95;
    max-width: 600px;
    line-height: 1.5;
}

.hero-card-meta {
    display: flex;
    gap: 20px;
    font-size: 14px;
    opacity: 0.85;
}

.hero-card-theme {
    display: flex;
    align-items: center;
    gap: 6px;
}

.regular-games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
}

.game-card {
    border-radius: 12px;
    overflow: hidden;
    background: #1a1a1a;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.game-card-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.game-card-content {
    padding: 16px;
}

.game-card-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #fff;
}

.game-card-description {
    font-size: 14px;
    color: #999;
    margin-bottom: 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
    .hero-card-title {
        font-size: 36px;
    }

    .hero-card-description {
        font-size: 16px;
    }
}

@media (max-width: 640px) {
    .hero-card-title {
        font-size: 24px;
    }

    .hero-card-description {
        font-size: 14px;
    }

    .regular-games-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    .hero-card {
        padding: 16px;
    }
}

/* 다크 테마 지원 */
@media (prefers-color-scheme: dark) {
    .hero-card {
        background: linear-gradient(135deg, #2d3561 0%, #1a1a2e 100%);
    }

    .game-card {
        background: #0f0f0f;
    }
}

/* 라이트 테마 지원 */
@media (prefers-color-scheme: light) {
    .hero-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .game-card {
        background: #f5f5f5;
    }

    .game-card-title {
        color: #000;
    }

    .game-card-description {
        color: #666;
    }
}
"""
    return css_content

def update_hero_css():
    """Hero CSS 파일 생성/업데이트"""
    try:
        STYLES_FILE.parent.mkdir(parents=True, exist_ok=True)
        css_content = generate_hero_css()
        STYLES_FILE.write_text(css_content, encoding='utf-8')
        print(f"✅ Hero CSS 파일 생성: {STYLES_FILE}")
        return True
    except Exception as e:
        print(f"❌ Hero CSS 생성 실패: {e}")
        return False

def create_hero_html_snippet(game):
    """Hero 카드용 HTML 스니펫 생성"""
    game_id = game.get('id', 'unknown')
    title = game.get('title', 'Unknown Game')
    english_title = game.get('englishTitle', title)
    description = game.get('englishDescription', game.get('description', 'A mysterious game awaits...'))
    theme = game.get('theme', 'unidentified-artifacts')
    thumbnail = game.get('thumbnail', f'thumbnails/{game_id}.png')
    emoji = game.get('themeEmoji', '📿')

    # Hero 카드 HTML
    html = f"""
    <!-- Hero Card - Latest Game -->
    <div class="hero-card-wrapper">
        <div class="hero-card" onclick="window.location.href='/play/{game_id}'">
            <img src="/{thumbnail}" alt="{english_title}" class="hero-card-image">
            <div class="hero-card-content">
                <span class="hero-card-badge">🎮 Latest Release</span>
                <h1 class="hero-card-title">{english_title}</h1>
                <p class="hero-card-description">{description}</p>
                <div class="hero-card-meta">
                    <div class="hero-card-theme">
                        <span>{emoji}</span>
                        <span>{theme.replace('-', ' ').title()}</span>
                    </div>
                    <span>Play Now →</span>
                </div>
            </div>
        </div>
    </div>
"""
    return html.strip()

def apply_hero_ui():
    """Hero UI를 게임 페이지에 적용"""
    print("\n📊 Hero UI 적용 중...\n")

    # 1. gamesData.ts에서 게임 목록 읽기
    print("  📖 게임 데이터 로드 중...")
    games = extract_games_from_ts()

    if not games or len(games) == 0:
        print("❌ 게임을 찾을 수 없습니다.")
        return False

    # 2. 게임 정렬 (최신순)
    print(f"  📅 {len(games)}개 게임 정렬 중...")
    sorted_games = get_sorted_games(games)

    if len(sorted_games) > 0:
        hero_game = sorted_games[0]
        print(f"  ⭐ Hero 게임: {hero_game.get('englishTitle', hero_game.get('title', 'Unknown'))}")

    # 3. Hero CSS 업데이트
    print("  🎨 Hero CSS 생성 중...")
    if not update_hero_css():
        return False

    # 4. 게임 메타데이터 JSON 생성 (프론트엔드용)
    try:
        output_dir = Path(r"D:\cometest_portal\public\data")
        output_dir.mkdir(parents=True, exist_ok=True)

        games_json = {
            'games': sorted_games,
            'heroGameId': sorted_games[0].get('id') if sorted_games else None,
            'lastUpdated': datetime.now().isoformat(),
            'totalGames': len(sorted_games),
        }

        output_file = output_dir / "games-manifest.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(games_json, f, ensure_ascii=False, indent=2)

        print(f"  ✅ 게임 매니페스트 생성: {output_file}")

    except Exception as e:
        print(f"  ⚠️  게임 매니페스트 생성 실패: {e}")

    # 5. 정렬된 게임 목록 로그
    print(f"\n  📋 정렬된 게임 순서:")
    for idx, game in enumerate(sorted_games[:5]):
        upload_date = game.get('uploadDate', 'N/A')
        print(f"     {idx + 1}. {game.get('englishTitle', game.get('title', 'Unknown'))} ({upload_date})")

    if len(sorted_games) > 5:
        print(f"     ... 그 외 {len(sorted_games) - 5}개 게임")

    print(f"\n✅ Hero UI 적용 완료!")
    print(f"   - Hero CSS: {STYLES_FILE}")
    print(f"   - 게임 매니페스트: {output_dir}/games-manifest.json")

    return True

if __name__ == "__main__":
    try:
        success = apply_hero_ui()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        sys.exit(1)
