# 🚀 Cometest Portal - Master Upload Hero Pipeline

**통합 자동화 파이프라인: ZIP 검사 + AI 메타데이터 + 썸네일 캡처 + Hero UI 적용**

---

## 📋 구성 요소

### 1. **Master_Upload_Hero.bat**
   - 마스터 컨트롤 스크립트
   - 모든 단계를 순차적으로 실행
   - 로그 파일 자동 생성

### 2. **check_zip_integrity.py**
   - Inbox 폴더의 ZIP 파일 무결성 검사
   - 손상된 파일 감지 및 복구 가이드 제공
   - ✅ Python 3.8+

### 3. **update_games_metadata_groq.py** (개선됨)
   - Groq AI를 사용한 메타데이터 자동 생성
   - **생성 항목:**
     - `englishTitle`: 창의적인 영문 제목
     - `englishDescription`: 영문 게임 설명
     - `storyDescription`: 스토리 배경
     - `seoKeywords`: SEO 키워드 배열
     - `occultTheme`: 오컬트 테마
     - `themeEmoji`: 테마 이모지
   - AI 실패 시 자동으로 기본값 적용

### 4. **capture_existing_games.py** (개선됨)
   - Playwright를 사용한 자동 스크린샷 캡처
   - gamesData.ts에서 게임 목록 자동 감지
   - 캡처된 썸네일을 메타데이터와 자동 매핑
   - 해상도: 1280x720px (Hero UI용)

### 5. **apply_hero_ui.py** (신규)
   - 최신 업로드 게임을 Hero 배너로 강조
   - 날짜 기준 내림차순 정렬
   - Hero CSS 스타일시트 자동 생성
   - 게임 매니페스트 JSON 생성

---

## 🎯 실행 방법

### **방법 1: 배치 파일 더블클릭 (가장 쉬움)**

```bash
# 경로: D:\cometest_portal\scripts\
# 파일: Master_Upload_Hero.bat
# 작업: 더블클릭 실행
```

**진행 과정:**
1. ✅ ZIP 무결성 검사
2. ✅ AI 메타데이터 생성 (Groq)
3. ✅ 게임 스크린샷 캡처
4. ✅ Hero UI 레이아웃 적용
5. ✅ 서버 배포

### **방법 2: PowerShell에서 개별 실행**

```powershell
# 1단계: ZIP 검사
cd D:\cometest_portal\scripts
python check_zip_integrity.py

# 2단계: AI 메타데이터 생성
python update_games_metadata_groq.py

# 3단계: 스크린샷 캡처
python capture_existing_games.py

# 4단계: Hero UI 적용
python apply_hero_ui.py
```

---

## 🔧 필수 환경 설정

### **1. Python 라이브러리 설치**

```bash
pip install groq python-dotenv playwright
playwright install chromium
```

### **2. .env 파일 확인**

```env
# D:\cometest_portal\.env
GROQ_API_KEY=your_groq_api_key_here
```

### **3. 디렉토리 구조 확인**

```
D:\cometest_portal\
├── public\
│   ├── labs\              # 게임 폴더들
│   ├── thumbnails\        # 캡처된 썸네일 저장
│   ├── data\              # 게임 매니페스트 JSON
│   └── styles\
│       └── hero.css       # Hero UI 스타일
├── src\
│   └── config\
│       └── gamesData.ts   # 게임 메타데이터 (수정됨)
└── scripts\
    ├── Master_Upload_Hero.bat
    ├── check_zip_integrity.py
    ├── update_games_metadata_groq.py
    ├── capture_existing_games.py
    ├── apply_hero_ui.py
    └── logs\              # 실행 로그 저장
```

---

## 📊 Hero UI 적용 결과

### **적용 전:**
- 모든 게임이 동일한 크기의 카드로 표시
- 최신순 정렬 없음
- 최신 게임이 눈에 띄지 않음

### **적용 후:**
- 🎨 **Hero 배너:** 최신 게임이 2-3배 크게 상단에 표시
- 📅 **정렬:** 업로드 날짜 기준 내림차순 (최신순)
- 📝 **메타데이터:** AI 생성 영문 제목/설명 표시
- 🖼️  **썸네일:** 실제 게임 스크린샷 자동 매핑

### **Hero 배너 CSS 클래스:**
```html
<div class="hero-card-wrapper">
  <div class="hero-card">
    <img src="thumbnails/[latest-game].png" class="hero-card-image">
    <div class="hero-card-content">
      <span class="hero-card-badge">🎮 Latest Release</span>
      <h1 class="hero-card-title">[AI 생성 영문 제목]</h1>
      <p class="hero-card-description">[AI 생성 영문 설명]</p>
      <div class="hero-card-meta">
        <span>[Theme Emoji]</span>
        <span>Play Now →</span>
      </div>
    </div>
  </div>
</div>

<!-- 나머지 게임들 -->
<div class="regular-games-grid">
  <!-- 일반 게임 카드들... -->
</div>
```

---

## 📋 로그 파일 확인

```
D:\cometest_portal\scripts\logs\
└── master_upload_[YYYYMMDD_HHMMSS].log
```

### **로그 내용:**
- 각 단계의 실행 시간
- 에러 메시지 (있을 경우)
- 처리된 게임 수
- 썸네일 저장 경로

---

## 🐛 문제 해결

### **ZIP 파일 손상 오류**

```
❌ ZIP 무결성 검사 실패
```

**해결법:**
```bash
# 백업에서 복구
copy D:\cometest_portal\backups\[filename].zip D:\Cometest_Dropzone\Inbox\[filename].zip

# 또는 다시 다운로드 후 Inbox에 넣기
```

### **Groq API 키 오류**

```
GROQ_API_KEY not found in .env file
```

**해결법:**
1. .env 파일 확인: `D:\cometest_portal\.env`
2. GROQ_API_KEY 값 확인
3. API 키 유효성 검사: https://console.groq.com

### **Playwright 설치 오류**

```
❌ Playwright not installed
```

**해결법:**
```bash
pip install playwright
playwright install chromium
```

### **게임 폴더를 찾을 수 없음**

```
⚠️ [game-id]: 폴더를 찾을 수 없음
```

**확인사항:**
- `D:\cometest_portal\public\labs\[game-id]\index.html` 존재 여부
- 폴더 이름 정확성 (대소문자 구분)

---

## 🎮 테스트 흐름

### **1단계: 파이프라인 실행**
```bash
# Master_Upload_Hero.bat 더블클릭
```

### **2단계: 웹 서버 시작**
```bash
# 프로젝트 루트에서
npm run dev  # 또는 yarn dev
```

### **3단계: 브라우저 확인**
- URL: `http://localhost:3000` 또는 `http://cometest.com`
- 확인사항:
  - [ ] 최신 게임이 Hero 배너로 표시됨
  - [ ] AI 생성 영문 제목 정상 표시
  - [ ] AI 생성 영문 설명 정상 표시
  - [ ] 스크린샷 썸네일 정상 표시
  - [ ] 게임 카드가 최신순으로 정렬됨

---

## 📈 성능 최적화

### **캡처 해상도**
- 현재: 1280x720px (Hero UI 최적)
- 변경하려면: `capture_existing_games.py` 라인 37 수정

### **AI 생성 시간**
- Groq API 평균 응답: 2-3초/게임
- 13개 게임 기준: 약 30-40초

### **실행 예상 시간**
```
총 소요 시간: 약 2-3분
├─ ZIP 검사: 10초
├─ AI 메타데이터: 40초
├─ 스크린샷 캡처: 60-90초
├─ Hero UI 적용: 10초
└─ 서버 배포: 30초
```

---

## 📞 지원

문제 발생 시:
1. 로그 파일 확인: `logs/master_upload_*.log`
2. 에러 메시지 기록
3. 단계별 개별 실행해서 문제 지점 파악

---

## 🎉 완료!

파이프라인이 성공적으로 실행되면:
- ✅ 모든 게임 메타데이터 업데이트
- ✅ 게임 스크린샷 자동 캡처
- ✅ 최신 게임이 Hero 배너로 강조
- ✅ 서버에 배포됨

**이제 cometest.com에 접속하여 결과를 확인하세요!** 🚀
