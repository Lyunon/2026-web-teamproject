// true: Firebase/백엔드 없이 가짜 로그인 + 가짜 API로 동작
// false: 실제 Firebase + /api/* 사용
export const USE_MOCK = true;

// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹)에서 복사. 공개되어도 되는 값입니다.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID",
};
