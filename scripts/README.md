# 🚀 Cometest 자동 업로드 시스템 가이드

## 📋 시스템 개요

이 자동화 시스템은 ZIP 파일을 드롭존에 넣고 버튼을 클릭하면:
1. ✅ ZIP 파일 자동 압축 해제
2. ✅ AI 설명 자동 생성 (오컬트 테마)
3. ✅ 게임 데이터베이스에 자동 등록
4. ✅ Git 자동 커밋 및 Vercel 배포 트리거

---

## 🛠️ 초기 설정 (1회만 수행)

### 1단계: 드롭존 폴더 구조 생성

```bash
python scripts/setup_dropzone.py
```

이 스크립트는 `D:\Cometest_Dropzone\` 아래에 다음을 생성합니다:

```
D:\Cometest_Dropzone\
├── Science/
│   ├── Basics/
│   ├── Mechanics/
│   ├── Optics_and_Waves/
│   ├── Electromagnetics/
│   ├── Energy_Systems/
│   ├── Chemistry/
│   ├── Earth/
│   ├── Space_and_Universe/
│   ├── Life_Sciences/
│   ├── Mathematics/
│   ├── Tech_Lab/
│   ├── Experimental/
│   ├── Web_Games/
│   └── Puzzle/
├── Occult_Classified/
│   ├── Abyssal_Frequencies/
│   ├── Alchemy_and_Dark_Magic/
│   ├── Anomalous_Physics/
│   ├── Cosmic_Horror/
│   ├── Forbidden_Specimens/
│   ├── Sacred_Geometry/
│   ├── Necromancy_and_Spirits/
│   ├── Unidentified_Artifacts/
│   ├── Breach_and_Anomalies/
│   └── Illusions_and_Hallucinations/
└── Completed/
```

### 2단계: 바탕화면 바로가기 생성 (선택사항)

```bash
python scripts/바탕화면_바로가기_생성.bat
```

또는 수동으로 다음 파일에 바로가기를 생성하세요:
- 대상: `D:\cometest_portal\scripts\업로드_실행.bat`
- 시작 위치: `D:\cometest_portal`

---

## 🎮 사용 방법

### 기본 플로우

1. **ZIP 파일 준비**
   - 웹 게임 또는 3D 시뮬레이션을 ZIP 파일로 압축
   - 파일명 예: `Quantum_Tunneling_Lab.zip`, `Dimensional_Rift.zip`

2. **드롭존에 업로드**
   - `D:\Cometest_Dropzone\Science\[폴더명]\` → 과학 탭 게임
   - `D:\Cometest_Dropzone\Occult_Classified\[폴더명]\` → 오컬트 게임

3. **자동 업로드 실행**
   - 바탕화면 바로가기 클릭 또는 `업로드_실행.bat` 실행
   - 또는 명령줄에서:
     ```bash
     cd D:\cometest_portal
     python scripts/auto_upload.py
     ```

4. **자동 처리**
   - ✅ ZIP 파일 압축 해제
   - ✅ 오컬트 테마 설명 생성
   - ✅ `gamesData.ts` 인덱스 0에 삽입
   - ✅ Git 자동 커밋
   - ✅ Vercel 자동 배포

5. **완료 확인**
   - 콘솔에서 진행 상황 실시간 확인
   - `D:\Cometest_Dropzone\Completed\` 폴더에 완료된 ZIP 이동

---

## 📂 폴더명 → UI 탭 매핑

### 과학 탭 (Science)
| 폴더명 | UI 탭 이름 |
|--------|----------|
| Basics | Science - Basics |
| Mechanics | Science - Mechanics |
| Optics_and_Waves | Science - Optics & Waves |
| Electromagnetics | Science - Electromagnetics |
| Energy_Systems | Science - Energy Systems |
| Chemistry | Science - Chemistry |
| Earth | Science - Earth |
| Space_and_Universe | Science - Space & Universe |
| Life_Sciences | Science - Life Sciences |
| Mathematics | Science - Mathematics |
| Tech_Lab | Science - Tech Lab |
| Experimental | Science - Experimental |
| Web_Games | Science - Web Games |
| Puzzle | Science - Puzzle |

### 오컬트 기밀 탭 (Occult_Classified)
| 폴더명 | UI 탭 이름 |
|--------|----------|
| Abyssal_Frequencies | Abyssal Frequencies |
| Alchemy_and_Dark_Magic | Alchemy & Dark Magic |
| Anomalous_Physics | Anomalous Physics |
| Cosmic_Horror | Cosmic Horror |
| Forbidden_Specimens | Forbidden Specimens |
| Sacred_Geometry | Sacred Geometry |
| Necromancy_and_Spirits | Necromancy & Spirits |
| Unidentified_Artifacts | Unidentified Artifacts |
| Breach_and_Anomalies | Breach & Anomalies |
| Illusions_and_Hallucinations | Illusions & Hallucinations |

---

## 🔧 설정 및 커스터마이징

### API 키 설정 (선택사항)

Groq API를 사용하려면 환경변수를 설정하세요:

**Windows (PowerShell)**
```powershell
$env:GROQ_API_KEY = "your-api-key-here"
```

**Windows (CMD)**
```cmd
set GROQ_API_KEY=your-api-key-here
```

API 키가 없으면 기본 오컬트 테마 설명이 자동으로 생성됩니다.

### 설명 커스터마이징

`auto_upload.py`의 `OCCULT_TAB_MAPPING` 또는 `descriptions` 딕셔너리를 편집하여 각 카테고리의 기본 설명을 커스터마이징할 수 있습니다.

---

## 📊 생성되는 파일 구조

### 압축 해제 위치
```
D:\cometest_portal\public\labs\
└── [ZIP파일명]/
    ├── index.html (또는 게임 파일들)
    ├── assets/
    └── ...
```

### 업데이트되는 파일
- `D:\cometest_portal\src\config\gamesData.ts` → 인덱스 0에 새 게임 삽입

### 생성 예시 (gamesData.ts)
```typescript
{
  id: 'quantum_tunneling_lab',
  title: 'Quantum Tunneling Lab',
  description: '🔮 양자 차원의 경계를 넘나드는 비밀 연구소...',
  thumbnail: '🔮',
  category: 'web_games',
  icon: '🔮',
  path: '/game/quantum_tunneling_lab',
  tags: ['experimental', 'classified', 'mystery', 'abyssal_frequencies'],
  play_count: 0,
}
```

---

## 🐛 문제 해결

### 문제: "Python이 설치되지 않았습니다"
**해결**: Python 3.8+ 설치 후 PATH에 추가
- [python.org](https://www.python.org) 에서 다운로드
- 설치 시 "Add Python to PATH" 체크

### 문제: "git command not found"
**해결**: Git 설치 또는 PATH 확인
- [git-scm.com](https://git-scm.com) 에서 다운로드
- PowerShell 재시작 후 재시도

### 문제: "gamesData.ts를 찾을 수 없습니다"
**해결**: 프로젝트 경로 확인
- 스크립트 경로: `D:\cometest_portal\scripts\`
- 프로젝트 루트: `D:\cometest_portal\`

### 문제: "파일이 이미 존재합니다"
**해결**: 다른 이름의 ZIP 파일 사용
- ZIP 파일명이 동일하면 기존 파일을 덮어쓰지 않습니다
- 새로운 이름으로 압축하여 재시도하세요

### 문제: Git 커밋 실패
**해결**: Git 설정 확인
```bash
cd D:\cometest_portal
git config user.name
git config user.email
```

초기 설정이 필요하면:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🚀 고급 사용법

### 여러 ZIP 파일 일괄 처리
`D:\Cometest_Dropzone\` 아래 여러 폴더에 ZIP 파일을 넣고 한 번에 실행하면 모두 처리됩니다.

### Git 푸시 건너뛰기
네트워크 문제가 있을 때는 압축 해제와 DB 업데이트만 수행하고, 나중에 수동으로 푸시할 수 있습니다.

`auto_upload.py`의 `run_git_commands()` 호출을 주석 처리하세요.

---

## 📝 스크립트 파일 목록

| 파일명 | 용도 |
|--------|------|
| `setup_dropzone.py` | 드롭존 폴더 구조 초기 생성 (1회) |
| `auto_upload.py` | 메인 자동 처리 스크립트 |
| `업로드_실행.bat` | 윈도우 배치 실행 파일 |
| `바탕화면_바로가기_생성.bat` | 바탕화면 바로가기 생성 (선택사항) |
| `README.md` | 이 파일 |

---

## 📞 지원

문제 발생 시:
1. 콘솔 메시지 확인
2. 이 README의 "문제 해결" 섹션 참고
3. 로그 파일 확인 (필요시 로깅 기능 추가 가능)

---

## 📅 버전

- **v1.0.0** (2026-10-07)
  - 초기 버전 (드롭존 + 자동 압축 해제 + AI 설명 생성)
  - Git 자동 배포 지원

---

🎉 **이제 게임 업로드가 완전 자동화되었습니다!**
