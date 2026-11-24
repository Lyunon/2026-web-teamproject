// 생성된 사건(정답 포함)을 브라우저에 맡기되 읽거나 고칠 수 없게 봉인한다.
// 서버만 아는 키로 AES-256-GCM 암호화하므로, 브라우저는 내용을 볼 수 없고 바꾸면 복호화에 실패한다.
// Vercel 서버리스는 파일/메모리를 요청 사이에 유지하지 못해 DB 없이 쓰려고 이 방식을 쓴다.

import crypto from "node:crypto";
import zlib from "node:zlib";

import { HttpError } from "./http.js";

const MAX_TOKEN_CHARS = 120_000;

function getKey() {
  const secret = process.env.CASE_TOKEN_SECRET || process.env.GEMINI_API_KEY;
  if (!secret) throw new HttpError(500, "서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요.");
  return crypto.createHash("sha256").update(`case-token:${secret}`).digest();
}

export function sealCase(caseData) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const body = zlib.deflateSync(Buffer.from(JSON.stringify(caseData), "utf8"));
  const enc = Buffer.concat([cipher.update(body), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function openCase(token) {
  const bad = () => new HttpError(400, "사건 정보가 올바르지 않습니다. 사건 목록에서 다시 시작해 주세요.");
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_CHARS) throw bad();
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const body = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    return JSON.parse(zlib.inflateSync(body).toString("utf8"));
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw bad();
  }
}
