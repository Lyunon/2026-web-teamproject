// 기존 모듈에서 사용하는 함수명만 유지하고 Google 인증 인스턴스를 공유한다.
import { getFirebaseContext, waitForUser, signInWithGoogle, signOutUser } from "./auth.js";
export { getIdToken } from "./auth.js";
export const loginGoogle = signInWithGoogle;
export const logout = signOutUser;
export async function watchAuth(callback) {
  const { A, auth } = await getFirebaseContext();
  return A.onAuthStateChanged(auth, callback);
}
export async function requireUser() {
  const user = await waitForUser();
  if (!user) location.replace("./index.html");
  return user;
}
