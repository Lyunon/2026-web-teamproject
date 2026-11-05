# 2026-web-teamproject

해당 레포지토리는 2026 웹프로그래밍 팀프로젝트 레포지토리입니다.

.env 파일, API 키들이 평문으로 작성되어 있는 json 파일이 필요하기에 레포지토리 상태가 Private로 되어 있으니 LLM을 활용할 거면 따로 커넥터 기능을 사용하는 것을 권장합니다.

개발 환경 : HTML+CSS+JavaScript, Gemini API, Firebase

| 영역 | 기술 |
| --- | --- |
| 프런트엔드 | HTML, CSS, JavaScript (순수, ES modules) |
| 백엔드 | Vercel Serverless Functions (Node.js, api/ 폴더) |
| 인증, DB | Firebase Auth, Firestore |
| AI | Gemini API (서버에서만 호출) |
| 배포 | GitHub main push → Vercel 자동 배포 |

## 설계 예정도
```
2026-web-teamproject/
├─ public/
│   ├─ index.html          # 랜딩 + 로그인
│   ├─ cases.html          # 사건 목록
│   ├─ play.html           # 게임 화면
│   ├─ result.html         # 결과 + 해설
│   ├─ css/  base.css, layout.css, chat.css, play.css
│   └─ js/   firebase.js, api.js, state.js, chat.js,
│            clues.js, notes.js, accuse.js
├─ api/
│   ├─ _lib/  auth.js, firestore.js, gemini.js, prompt.js, rules.js
│   └─ session/start.js
│      interrogate.js, investigate.js, hint.js, accuse.js
├─ firestore.rules
├─ package.json            # firebase-admin, @google/genai
├─ vercel.json
├─ .env.example            # 키 이름만 적은 템플릿 (커밋)
└─ .gitignore              # .env.local 제외
```
