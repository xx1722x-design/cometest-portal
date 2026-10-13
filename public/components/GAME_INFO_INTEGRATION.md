# 🎮 Game Info Toggle Panel - 통합 가이드

## 개요

게임 플레이 화면에 **토글식 설명창 UI**를 추가하여 플레이 중 언제든 게임 설명, 조작키, 카테고리 정보를 확인할 수 있습니다.

### 주요 기능

- 🎨 **토글 버튼** (^, v): 화면 우측 하단의 반투명 원형 버튼
- 📖 **스토리 설명**: AI가 생성한 오컬트풍 게임 배경
- 🎮 **조작키 안내**: 신비로운 톤의 조작키 설명
- 🏷️ **태그/카테고리**: 게임의 오컬트 장르 표시
- ⌨️ **키보드 지원**: ESC로 패널 닫기 가능
- 📱 **반응형**: 모든 화면 크기에 최적화

---

## 🚀 게임 페이지에 통합하는 방법

### Step 1: HTML에 컴포넌트 추가

게임을 플레이하는 HTML 파일 (예: `play.html`, `game.html`)의 `<body>` 끝에 추가:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Play Game</title>
</head>
<body>
    <!-- 게임 콘텐츠 -->
    <div id="gameContainer">
        <iframe id="gameFrame" src="path/to/game/index.html"></iframe>
    </div>

    <!-- 게임 정보 토글 패널 추가 -->
    <include src="components/game-info-toggle.html"></include>

    <!-- 또는 직접 파일 로드 -->
    <script>
        fetch('/components/game-info-toggle.html')
            .then(r => r.text())
            .then(html => {
                const template = document.createElement('template');
                template.innerHTML = html;
                document.body.appendChild(template.content.cloneNode(true));
            });
    </script>
</body>
</html>
```

### Step 2: 게임 데이터 설정 (JavaScript)

게임 페이지 로드 후 게임 정보를 설정:

```javascript
// gamesData에서 현재 게임의 데이터 가져오기
const gameId = 'my-game-id'; // URL 파라미터나 props에서 가져오기
const gameData = gamesData.find(g => g.id === gameId);

if (gameData) {
    // 토글 패널에 정보 설정
    window.setGameInfo({
        title: gameData.englishTitle,           // AI 생성 영문 제목
        story: gameData.storyDescription,       // AI 생성 스토리
        controls: gameData.controls,            // AI 생성 조작키
        category: gameData.occultCategory,      // AI 자동 분류 카테고리
        keywords: gameData.seoKeywords          // AI 생성 키워드
    });
}
```

### Step 3: React 컴포넌트에서 사용 (권장)

```jsx
import { useEffect } from 'react';

export function GamePlayer({ gameId }) {
  const gameData = GAMES_DATA.find(g => g.id === gameId);

  useEffect(() => {
    if (gameData && window.setGameInfo) {
      window.setGameInfo({
        title: gameData.englishTitle,
        story: gameData.storyDescription,
        controls: gameData.controls,
        category: gameData.occultCategory,
        keywords: gameData.seoKeywords
      });
    }
  }, [gameData]);

  return (
    <div className="game-container">
      <iframe src={`/play/${gameId}`} />
      {/* game-info-toggle.html 컨텐츠가 자동 로드됨 */}
    </div>
  );
}
```

---

## 📋 데이터 포맷

### gameData 객체 예시

```javascript
{
  title: 'Void Whispers',                              // englishTitle
  story: 'Signals from the cosmic void pierce...',     // storyDescription
  controls: 'WASD to move | Mouse to explore...',      // controls
  category: 'Cosmic Horror',                           // occultCategory
  keywords: [                                          // seoKeywords
    'cosmic-anomaly',
    'dimensional-entity',
    'void-exploration',
    'interdimensional',
    'cosmic-mystery'
  ]
}
```

---

## 🎨 커스터마이징

### 색상 변경

CSS 변수로 테마 커스터마이징:

```css
:root {
  --overlay-bg: rgba(10, 10, 20, 0.95);        /* 패널 배경 */
  --overlay-text: #e0e0f0;                     /* 텍스트 색상 */
  --overlay-accent: #9d4edd;                   /* 강조 색상 */
  --overlay-border: #5a189a;                   /* 테두리 색상 */
  --toggle-btn-bg: rgba(157, 78, 221, 0.8);    /* 토글 버튼 배경 */
  --transition-speed: 0.35s;                   /* 애니메이션 속도 */
}
```

### 패널 높이 조정

```css
.game-info-panel {
  max-height: 60vh;  /* 기본값: 화면 높이의 60% */
  /* 원하는 값으로 변경 (예: 50vh, 70vh, 80vh) */
}
```

### 토글 버튼 위치 변경

```css
.game-info-toggle-btn {
  bottom: 20px;   /* 아래로부터 거리 */
  right: 20px;    /* 우측으로부터 거리 */
  /* 위치 변경: left, top 사용 가능 */
}
```

---

## 🔧 JavaScript API

### setGameInfo(gameData)

패널에 게임 정보를 설정합니다.

```javascript
window.setGameInfo({
  title: string,              // 게임 제목
  story: string,              // 스토리 설명
  controls: string,           // 조작키
  category: string,           // 오컬트 카테고리
  keywords: string[]          // 키워드 배열
});
```

### 수동 토글 (옵션)

```javascript
// 패널 열기
document.getElementById('gameInfoOverlay').classList.add('active');

// 패널 닫기
document.getElementById('gameInfoOverlay').classList.remove('active');

// 토글
document.getElementById('gameInfoOverlay').classList.toggle('active');
```

---

## 📱 사용자 인터랙션

### 터치스크린 사용자

- **토글 버튼 탭**: 패널 열기/닫기
- **패널 외부 탭**: 패널 자동 닫기
- **스와이프 다운**: 패널 닫기 (구현 시 추가)

### 데스크톱 사용자

- **클릭**: 토글 버튼 클릭하여 패널 열기/닫기
- **ESC**: 패널 닫기
- **클릭**: 패널 외부 클릭하여 닫기

---

## 🌙 라이트/다크 테마

컴포넌트는 자동으로 시스템 테마를 감지합니다:

```css
/* 다크 테마 (기본값) */
@media (prefers-color-scheme: dark) {
  /* 다크 색상 적용 */
}

/* 라이트 테마 */
@media (prefers-color-scheme: light) {
  /* 라이트 색상 적용 */
}
```

---

## 📦 파일 구조

```
public/
├── components/
│   ├── game-info-toggle.html          ← 이 파일 (HTML + CSS + JS)
│   └── GAME_INFO_INTEGRATION.md        ← 이 문서
├── play.html                           ← 게임 플레이 페이지
└── [games]/
    └── [game-id]/
        └── index.html
```

---

## ✅ 체크리스트

게임 페이지에 통합할 때:

- [ ] `game-info-toggle.html` 컴포넌트가 `<body>` 끝에 로드됨
- [ ] 게임 로드 후 `window.setGameInfo()` 호출됨
- [ ] gamesData에서 `englishTitle`, `storyDescription`, `controls`, `occultCategory`, `seoKeywords` 확인됨
- [ ] 토글 버튼이 우측 하단에 표시됨
- [ ] 토글 버튼 클릭 시 패널이 슬라이드업 됨
- [ ] 다시 클릭 시 패널이 슬라이드다운 됨
- [ ] ESC 키로 패널이 닫힘

---

## 🎬 사용자 흐름

```
1. 사용자가 게임 플레이 페이지 접속
   ↓
2. 게임이 로드되고 window.setGameInfo() 호출
   ↓
3. 화면 우측 하단에 ^ 토글 버튼 표시
   ↓
4. 사용자가 ^ 클릭
   ↓
5. 패널이 슬라이드업 되어 스토리, 조작키, 카테고리 표시
   ↓
6. 사용자가 조작키 확인 후 v 클릭
   ↓
7. 패널이 슬라이드다운 되어 게임이 전체 화면으로 표시
```

---

## 🐛 문제 해결

### 토글 버튼이 보이지 않음

**확인 사항:**
1. `game-info-toggle.html`이 페이지에 로드되었는지
2. z-index 충돌이 있는지 (다른 요소의 z-index 확인)
3. CSS가 정상 로드되었는지 (개발자 도구 확인)

```javascript
// 콘솔에서 확인
document.getElementById('gameInfoToggle') // null이 아니면 OK
```

### 게임 정보가 표시되지 않음

**확인 사항:**
1. `window.setGameInfo()`가 호출되었는지
2. 데이터 형식이 정확한지

```javascript
// 콘솔에서 확인
window.setGameInfo // function 이면 OK
```

### 패널이 닫히지 않음

**확인 사항:**
1. ESC 키 리스너가 다른 라이브러리에 의해 방해받지 않는지
2. 클릭 이벤트 버블링이 정상인지

```javascript
// 수동으로 닫기
document.getElementById('gameInfoOverlay').classList.remove('active');
```

---

## 📞 지원

추가 커스터마이징이 필요한 경우 `game-info-toggle.html`의 JavaScript 섹션을 수정하세요.

모든 코드는 바닐라 JavaScript로 작성되어 어떤 프레임워크와도 호환됩니다! ✨
