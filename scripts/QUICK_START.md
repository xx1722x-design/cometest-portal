# ⚡ Master Upload Hero Pipeline - 빠른 시작 가이드

## 🎯 5분 안에 시작하기

### **Step 1️⃣ : 준비 확인 (30초)**

```bash
✅ Groq API Key: D:\cometest_portal\.env에 설정됨?
✅ Python 설치: python --version
✅ 라이브러리: pip list | grep groq, playwright
✅ Inbox 폴더: D:\Cometest_Dropzone\Inbox\ 존재?
```

### **Step 2️⃣ : 파이프라인 실행 (2-3분)**

```
D:\cometest_portal\scripts\Master_Upload_Hero.bat를 더블클릭

또는 PowerShell:
cd D:\cometest_portal\scripts
.\Master_Upload_Hero.bat
```

### **Step 3️⃣ : 결과 확인 (1분)**

```
브라우저 열기 → http://localhost:3000

확인사항:
✅ 최신 게임이 큰 Hero 배너로 상단에 표시?
✅ AI 생성 영문 제목이 보임?
✅ 스크린샷 썸네일이 표시됨?
✅ 나머지 게임들이 최신순 정렬?
```

---

## 📦 필수 설치 항목

### **라이브러리 한 번에 설치**

```bash
pip install groq python-dotenv playwright
playwright install chromium
```

---

## 📋 생성되는 파일들

| 파일 | 위치 | 용도 |
|------|------|------|
| gamesData.ts (수정) | `src/config/` | 영문 메타데이터 추가 |
| hero.css (신규) | `public/styles/` | Hero UI 스타일 |
| thumbnails/*.png | `public/thumbnails/` | 게임 스크린샷 |
| games-manifest.json | `public/data/` | 게임 목록 + 정렬 정보 |
| master_upload_*.log | `scripts/logs/` | 실행 로그 |

---

## 🚀 자동 생성되는 메타데이터

각 게임마다 AI가 자동 생성:

```typescript
{
  id: 'game-id',
  englishTitle: 'Creative Game Title',          // ← AI 생성
  englishDescription: '2-3줄 영문 설명...',      // ← AI 생성
  storyDescription: '4줄 스토리...',            // ← AI 생성
  seoKeywords: ['keyword1', 'keyword2', ...],  // ← AI 생성
  occultTheme: 'cosmic-horror',                 // ← 기존
  themeEmoji: '👁️',                            // ← 새로 추가
  thumbnail: 'thumbnails/game-id.png',          // ← 자동 캡처
}
```

---

## ⚡ 빠른 문제 해결

| 문제 | 해결법 |
|------|--------|
| `GROQ_API_KEY not found` | `.env` 파일 확인 및 API 키 설정 |
| `Playwright not installed` | `pip install playwright && playwright install` |
| `ZIP 파일 손상` | Inbox에서 손상 파일 삭제 후 재다운로드 |
| `게임 폴더 없음` | `D:\cometest_portal\public\labs\[game-id]\` 확인 |
| Hero UI 미적용 | 브라우저 캐시 지우기 (Ctrl+Shift+Del) |

---

## 📊 실행 결과 확인

### 로그 파일 위치
```
D:\cometest_portal\scripts\logs\master_upload_[날짜_시간].log
```

### 로그 내용 확인
```bash
# PowerShell에서
Get-Content .\logs\master_upload_*.log -Tail 20
```

---

## 🎬 Hero UI 어떻게 보일까?

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [최신 게임 스크린샷 - 2배 큰 Hero 배너]        │
│                                                 │
│  🎮 Latest Release                             │
│  "AI 생성 영문 제목"                           │
│  "AI 생성 영문 설명 2-3줄..."                 │
│  👁️ Cosmic Horror  |  Play Now →             │
│                                                 │
└─────────────────────────────────────────────────┘

[게임1 카드] [게임2 카드] [게임3 카드]
[게임4 카드] [게임5 카드] [게임6 카드]
...
```

---

## 🔄 정기 업데이트 흐름

13개 게임 모두 업로드할 때:

```
1️⃣ ZIP 무결성 검사
   ↓
2️⃣ AI가 각 게임마다:
   - 영문 제목 생성
   - 영문 설명 생성
   - SEO 키워드 생성
   ↓
3️⃣ Playwright가 각 게임:
   - 실행 시간 2-3초
   - 스크린샷 캡처
   ↓
4️⃣ Hero 배너:
   - 최신 게임 1개 강조
   - 나머지는 그리드로 표시
   ↓
5️⃣ 서버 배포 완료
```

**총 소요 시간: 약 2-3분** ⏱️

---

## ✅ 체크리스트

마지막 확인 전에:

- [ ] `.env`에 GROQ_API_KEY 설정
- [ ] Python 3.8+ 설치
- [ ] `pip install groq python-dotenv playwright`
- [ ] `playwright install chromium`
- [ ] Inbox 폴더에 ZIP 파일 있음
- [ ] `D:\cometest_portal\public\labs\` 게임 폴더들 있음

모두 확인되면:

```
Master_Upload_Hero.bat 더블클릭 실행!
```

🎉 **완료!**

---

## 📞 도움말

- 자세한 설명: `PIPELINE_GUIDE.md` 읽기
- 개별 스크립트 실행: `scripts/` 폴더의 `.py` 파일들 직접 실행
- 로그 확인: `scripts/logs/` 폴더의 로그 파일 확인
