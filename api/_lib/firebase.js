// 서버 전용 Firebase Admin + 로그인 토큰 검증.
// 서비스 계정 키는 FIREBASE_SERVICE_ACCOUNT 환경변수(base64 또는 JSON 원문)에서 읽는다.
// Admin SDK 는 Firestore 보안 규칙을 거치지 않으므로 api/ 안에서만 쓴다.
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpError } from "./http.js";

function readServiceAccount() {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim();
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT 환경변수가 없습니다.");
  const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT 값을 읽지 못했습니다. base64 또는 JSON 형식인지 확인하세요.");
  }
  if (typeof json.private_key === "string") json.private_key = json.private_key.replace(/\\n/g, "\n");
  return json;
}

let app = null;
function adminApp() {
  if (!app) app = getApps()[0] ?? initializeApp({ credential: cert(readServiceAccount()) });
  return app;
}

export const db = () => getFirestore(adminApp());

function bearer(req) {
  const h = req?.headers?.authorization || "";
  const m = /^Bearer\s+(\S+)$/i.exec(String(h));
  return m ? m[1] : null;
}

// Authorization: Bearer <Firebase ID 토큰> 을 검증하고 { uid, provider } 를 돌려준다.
export async function requireUser(req) {
  const token = bearer(req);
  if (!token) throw new HttpError(401, "로그인이 필요합니다. 다시 로그인해 주세요.");
  const auth = getAuth(adminApp()); // 키 설정 오류는 HttpError 가 아니므로 500 으로 기록된다
  try {
    const t = await auth.verifyIdToken(token);
    return { uid: t.uid, provider: t.firebase?.sign_in_provider || "" };
  } catch {
    throw new HttpError(401, "로그인 정보가 만료되었습니다. 새로고침해 주세요.");
  }
}

// 토큰이 있으면 검증하고, 없거나 틀리면 null (랭킹 조회처럼 로그인이 선택인 곳에서 쓴다)
export async function optionalUser(req) {
  if (!bearer(req)) return null;
  try {
    return await requireUser(req);
  } catch {
    return null;
  }
}
