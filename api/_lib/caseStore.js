// 사건 시드 로드 + 클라이언트가 보낸 값 정리.
// 임시 개발 모드에서는 unlocked/history를 브라우저가 들고 있으므로,
// 서버는 받은 값을 그대로 믿지 않고 형식과 범위만이라도 검증한다.

import fs from "node:fs";
import path from "node:path";

import { HttpError } from "./http.js";
import { getClueMap, initialUnlocked } from "./rules.js";
import { openCase } from "./caseToken.js";

const CASE_DIR = path.join(process.cwd(), "data", "cases");

export const MAX_MESSAGE = 300;

function build(data) {
  return {
    casePublic: data.public,
    caseSecret: data.secret,
    clueMap: getClueMap(data.public, data.secret),
  };
}

// 사건 ID가 gen- 으로 시작하면 Gemini 가 만든 사건이다. 서버가 봉인한 caseToken 에서 꺼낸다.
export function loadCase(caseId, caseToken) {
  if (typeof caseId !== "string" || !/^[a-z0-9-]{1,40}$/.test(caseId)) {
    throw new HttpError(400, "잘못된 사건 ID입니다.");
  }

  if (caseId.startsWith("gen-")) {
    const data = openCase(caseToken);
    if (data?.id !== caseId || !data.public || !data.secret) {
      throw new HttpError(400, "사건 정보가 올바르지 않습니다. 사건 목록에서 다시 시작해 주세요.");
    }
    return build(data);
  }

  const file = path.join(CASE_DIR, `${caseId}.json`);
  if (!fs.existsSync(file)) throw new HttpError(404, "없는 사건입니다.");

  // 개발 중 시드를 고치면 바로 반영되도록 매번 읽는다. (파일이 작다)
  return build(JSON.parse(fs.readFileSync(file, "utf8")));
}

// 브라우저로 내보내는 단서는 이 4개 필드만.
export function publicClue(c) {
  return { id: c.id, title: c.title, location: c.location, text: c.text };
}

export function hasClue(clueMap, id) {
  return typeof id === "string" && Object.hasOwn(clueMap, id);
}

// 시작 단서는 항상 포함, 나머지는 실제 존재하는 단서 id만 통과.
export function cleanUnlocked(input, casePublic, clueMap) {
  const base = initialUnlocked(casePublic);
  const extra = Array.isArray(input) ? input.filter((id) => hasClue(clueMap, id)) : [];
  return [...new Set([...base, ...extra])];
}

export function cleanHistory(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((h) => h && (h.role === "user" || h.role === "model") && typeof h.text === "string")
    .map((h) => ({ role: h.role, text: h.text.slice(0, 2000) }))
    .slice(-12);
}

export function cleanHintCount(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 20) : 0;
}