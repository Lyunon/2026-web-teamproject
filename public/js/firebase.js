import { USE_MOCK, firebaseConfig } from "./config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.14.1";
const MOCK_KEY = "mock:user";

let sdk; // { m: auth 모듈, auth: 인스턴스 }

async function load() {
  if (sdk) return sdk;
  const [{ initializeApp }, m] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
  ]);
  sdk = { m, auth: m.getAuth(initializeApp(firebaseConfig)) };
  return sdk;
}

const readMockUser = () => JSON.parse(localStorage.getItem(MOCK_KEY) || "null");
const setMockUser = (uid, displayName) =>
  localStorage.setItem(MOCK_KEY, JSON.stringify({ uid, displayName }));

/** 로그인 상태 구독. user 또는 null을 콜백으로 전달 */
export async function watchAuth(cb) {
  if (USE_MOCK) return cb(readMockUser());
  const { m, auth } = await load();
  m.onAuthStateChanged(auth, cb);
}

/** 로그인된 사용자를 반환. 없으면 로그인 화면으로 이동 */
export function requireUser() {
  return new Promise((resolve) => {
    watchAuth((user) => {
      if (user) resolve(user);
      else location.replace("index.html");
    });
  });
}

export async function loginGoogle() {
  if (USE_MOCK) return setMockUser("mock-google", "테스트 탐정 (Google)");
  const { m, auth } = await load();
  await m.signInWithPopup(auth, new m.GoogleAuthProvider());
}

export function loginNaver() {
  if (USE_MOCK) {
    setMockUser("mock-naver", "테스트 탐정 (Naver)");
    return Promise.resolve();
  }
  // 서버(api/auth/naver/start)가 네이버 인증 페이지로 리다이렉트
  location.href = "/api/auth/naver/start";
  return new Promise(() => {}); // 페이지 이동 중이므로 끝나지 않는 Promise
}

/** 네이버 로그인 후 서버가 발급한 커스텀 토큰으로 로그인 */
export async function signInWithToken(token) {
  const { m, auth } = await load();
  await m.signInWithCustomToken(auth, token);
}

export async function logout() {
  if (USE_MOCK) return localStorage.removeItem(MOCK_KEY);
  const { m, auth } = await load();
  await m.signOut(auth);
}

export async function getIdToken() {
  if (USE_MOCK) return "mock-token";
  const { auth } = await load();
  if (!auth.currentUser) throw new Error("로그인이 필요합니다.");
  return auth.currentUser.getIdToken();
}
