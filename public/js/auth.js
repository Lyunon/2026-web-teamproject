// Google 로그인과 모든 화면에서 하나의 Firebase 앱/인증 인스턴스를 공유한다.
import { firebaseConfig } from "./firebase-config.js";
const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && !firebaseConfig.apiKey.startsWith("YOUR_"));
let ctxPromise;
export function getFirebaseContext() {
  if (!isConfigured) throw new Error("Firebase 설정이 필요합니다.");
  ctxPromise ??= (async () => {
    const [appSDK, A] = await Promise.all([
      import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`),
    ]);
    const app = appSDK.getApps().length ? appSDK.getApp() : appSDK.initializeApp(firebaseConfig);
    return { app, A, auth: A.getAuth(app) };
  })().catch((error) => { ctxPromise = null; throw error; });
  return ctxPromise;
}
export async function waitForUser() {
  const { auth, A } = await getFirebaseContext();
  await auth.authStateReady();
  return auth.currentUser;
}
export async function signInWithGoogle() {
  const { auth, A } = await getFirebaseContext();
  return A.signInWithPopup(auth, new A.GoogleAuthProvider());
}
export async function signOutUser() {
  const { auth, A } = await getFirebaseContext();
  await A.signOut(auth);
}
export async function getIdToken() {
  const user = await waitForUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user.getIdToken();
}
