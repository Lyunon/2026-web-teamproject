// Firebase Auth 도우미. firebase-config.js 가 비어 있으면 Firebase 를 불러오지 않고 목업 모드로 동작한다.
import { firebaseConfig } from "./firebase-config.js";

const SDK_VERSION = "10.12.2"; // 바꾸려면 firebase 공식 문서에서 쓸 수 있는 버전을 확인한다.
const BASE = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let ctxPromise = null;
function getCtx() {
  if (!isConfigured) return null;
  ctxPromise ??= (async () => {
    const [{ initializeApp }, A] = await Promise.all([
      import(`${BASE}/firebase-app.js`),
      import(`${BASE}/firebase-auth.js`),
    ]);
    const app = initializeApp(firebaseConfig);
    return { A, auth: A.getAuth(app) };
  })();
  return ctxPromise;
}

// 로그인 상태가 확정될 때까지 기다렸다가 사용자(없으면 null)를 돌려준다.
export async function waitForUser() {
  const ctx = await getCtx();
  if (!ctx) return null;
  return new Promise((resolve) => {
    const off = ctx.A.onAuthStateChanged(ctx.auth, (user) => {
      off();
      resolve(user);
    });
  });
}

export async function signInWithGoogle() {
  const ctx = await getCtx();
  if (!ctx) throw new Error("Firebase 설정이 비어 있습니다.");
  const provider = new ctx.A.GoogleAuthProvider();
  return ctx.A.signInWithPopup(ctx.auth, provider);
}

export async function signOutUser() {
  const ctx = await getCtx();
  if (ctx) await ctx.A.signOut(ctx.auth);
}