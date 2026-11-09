# 현 진행 상황을 메모하는 마크다운 파일입니다.

현재 폴더 구조
```
public/
├─ index.html            # 랜딩 + 로그인
├─ cases.html            # 사건 목록
├─ play.html             # 게임 화면
├─ result.html           # 결과 + 해설
├─ auth-complete.html    # 네이버 로그인 마무리 (커스텀 토큰)
├─ css/
│   ├─ base.css
│   └─ play.css
└─ js/
    ├─ config.js         # USE_MOCK, firebaseConfig
    ├─ firebase.js       # 인증 (Google / Naver / mock)
    ├─ api.js            # fetch 래퍼 (토큰 자동 첨부)
    ├─ state.js          # 간단한 전역 상태
    ├─ ui.js             # 헤더, 토스트
    ├─ chat.js           # 채팅 UI
    ├─ clues.js          # 단서 보관함
    ├─ notes.js          # 추리 노트
    ├─ accuse.js         # 범인 지목
    ├─ index.js  cases.js  play.js  result.js  auth-complete.js
```

현재 detective-visual-scene-v5 기반의 UI로 구현 완료. Gemini 연결해둔 상태.
