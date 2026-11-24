// POST /api/accuse  { caseId, suspectId, hintCount, elapsedSeconds }   (Authorization: Bearer <ID 토큰>)
// 범인 판정 + 점수 계산(public/js/scoring.js 공통 규칙) + 첫 지목이 정답이면 랭킹 등록.
// 힌트 수는 브라우저 값과 서버 기록 중 큰 값을 쓴다. 시간은 브라우저가 잰 플레이 시간이다(scoring-v2 설계).

import { route, HttpError } from "./_lib/http.js";
import { calculateScore, canAccuse } from "../public/js/scoring.js";
import { loadCase, cleanHintCount } from "./_lib/caseStore.js";
import { db, requireUser } from "./_lib/firebase.js";
import { sessionRef, rankingRef, sortKeyOf } from "./_lib/session.js";

export default route(["POST"], async ({ body, req }) => {
  const user = await requireUser(req);
  const { casePublic, caseSecret } = loadCase(body.caseId, body.caseToken);

  if (!casePublic.suspects.some((s) => s.id === body.suspectId)) {
    throw new HttpError(400, "없는 용의자입니다.");
  }
  if (!canAccuse(body.elapsedSeconds)) {
    throw new HttpError(400, "사건을 시작한 뒤 1분이 지나야 범인을 지목할 수 있습니다.");
  }
  const correct = body.suspectId === caseSecret.culprit;
  const elapsedSeconds = body.elapsedSeconds;
  const clientHints = cleanHintCount(body.hintCount);

  const sRef = sessionRef(user.uid, body.caseId);
  const rRef = rankingRef(user.uid, body.caseId);
  const uRef = db().collection("users").doc(user.uid);

  const { hintCount, ranked } = await db().runTransaction(async (tx) => {
    const [sSnap, rSnap, uSnap] = await tx.getAll(sRef, rRef, uRef);
    const s = sSnap.data() || {};

    // 재도전: 점수는 보여 주되 랭킹·서버 기록은 바꾸지 않는다.
    if (s.firstAccusedAt) return { hintCount: clientHints, ranked: false };

    const hintCount = Math.max(clientHints, cleanHintCount(s.hintCount));
    const now = Date.now();
    tx.set(sRef, { firstAccusedAt: now, firstCorrect: correct, hintCount, elapsedSeconds }, { merge: true });
    if (!correct || rSnap.exists || body.caseId.startsWith("gen-")) return { hintCount, ranked: false }; // 생성 사건은 랭킹 제외

    const p = calculateScore({ isCorrect: true, elapsedSeconds, hintCount });
    tx.set(rRef, {
      nickname: String(uSnap.get("nickname") || "수사관").slice(0, 12), // 브라우저 값이 아니라 프로필에서 읽는다
      score: p.score,
      elapsedSeconds,
      hintCount,
      scoringVersion: p.scoringVersion,
      sortKey: sortKeyOf(p.score, elapsedSeconds),
      createdAt: now,
    });
    return { hintCount, ranked: true };
  });

  const points = calculateScore({ isCorrect: correct, elapsedSeconds, hintCount });
  return {
    correct,
    culprit: caseSecret.culprit,
    ...points,
    elapsedSeconds,
    hintCount,
    ranked,
    solutionExplain: caseSecret.solutionExplain,
  };
});
