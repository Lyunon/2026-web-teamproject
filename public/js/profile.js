import { getFirebaseContext } from "./auth.js";
import { validateNickname } from "./profile-validation.js";
export { hasProfile } from "./profile-validation.js";
let storePromise;
async function store() {
  storePromise ??= (async () => {
    const [{ app }, F] = await Promise.all([
      getFirebaseContext(), import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    ]);
    return { F, db: F.getFirestore(app) };
  })().catch((error) => { storePromise = null; throw error; });
  return storePromise;
}
export async function getProfile(user) {
  const { F, db } = await store();
  // 서버 조회 실패를 미가입으로 오해하지 않는다. 실패는 호출자에게 전달한다.
  const snapshot = await F.getDocFromServer(F.doc(db, "users", user.uid));
  return snapshot.exists() ? snapshot.data() : null;
}
export async function createProfile(user, input) {
  const nickname = validateNickname(input);
  const { F, db } = await store();
  const ref = F.doc(db, "users", user.uid);
  // 여러 탭에서 동시에 가입해도 먼저 생성된 프로필을 덮어쓰지 않는다.
  return F.runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    if (snapshot.exists()) return snapshot.data();
    const profile = { nickname, createdAt: F.serverTimestamp() };
    tx.set(ref, profile);
    return profile;
  });
}
