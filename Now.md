# 현재 진행 상황

- Google 로그인 + 최초 탐정 닉네임 등록 구현.
- 회원 프로필: Firestore `users/{uid}`, `nickname`, `createdAt`.
- 사건 선택/게임/결과 페이지에 로그인 및 가입 완료 확인 연결.
- 네이버 로그인 UI와 인증 코드 제거. 옛 콜백 주소는 로그인 화면으로 이동.
- 결과 랭킹은 아직 샘플 데이터이며 실제 점수 저장은 별도 작업.
- 적용/검증 안내: `docs/signup-setup.md`.
- 자동 저장 및 이어 하기 구현 완료.
- 사건 생성 구현: 사건 목록의 [Gemini로 새 사건 생성] → 장르(저택/미술관/열차/랜덤) + 난이도(쉬움/보통/어려움/매우어려움) 팝업 → `/api/generate`.
- 생성 사건은 서버가 정답을 암호화한 `caseToken` 과 함께 브라우저에 저장(계정별 최대 8개). 설명: `docs/case-generation.md`.
- 필요한 환경변수: `CASE_TOKEN_SECRET`(권장), `GEMINI_CASE_MODELS`(선택). `vercel.json` 에서 생성 API 실행 시간을 60초로 늘림.
- 테스트: `npm run test:generate`.
