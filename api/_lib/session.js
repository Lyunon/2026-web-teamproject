// 서버 쪽 플레이 기록 sessions/{uid}_{caseId}
//   hintCount      : 첫 지목 전까지 받은 힌트 수 (처음부터 다시 해도 줄지 않는다)
//   firstAccusedAt : 첫 지목 시각. 값이 있으면 이후 지목은 랭킹에 반영하지 않는다.
// 랭킹 rankings/{caseId}/entries/{uid}
// 브라우저는 두 경로를 읽거나 쓰지 못한다(보안 규칙에 허용 규칙이 없음). Admin SDK 만 쓴다.
import { db } from "./firebase.js";

export const sessionRef = (uid, caseId) => db().collection("sessions").doc(`${uid}_${caseId}`);
export const rankingCol = (caseId) => db().collection("rankings").doc(caseId).collection("entries");
export const rankingRef = (uid, caseId) => rankingCol(caseId).doc(uid);

// 처음 시작할 때 한 번만 만든다. 이미 있으면 그대로 둔다.
export async function ensureSession(uid, caseId) {
  try {
    await sessionRef(uid, caseId).create({ uid, caseId, hintCount: 0, firstAccusedAt: null, createdAt: Date.now() });
  } catch (err) {
    if (err?.code !== 6) throw err; // 6 = ALREADY_EXISTS
  }
}

// 랭킹 정렬용 숫자 하나: 점수 높은 순, 같으면 빨리 푼 순 (복합 색인 없이 정렬하려고)
export function sortKeyOf(score, elapsedSeconds) {
  return score * 1_000_000 + (999_999 - Math.min(elapsedSeconds, 999_999));
}
