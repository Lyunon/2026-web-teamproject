// POST /api/hint  { caseId, hintCount }   (Authorization: Bearer <ID 토큰>)
// 힌트는 시드에 적힌 순서대로 준다. Gemini를 쓰지 않는다.
// 첫 지목 전에는 받은 힌트 수를 서버 기록(sessions)에 남긴다. 채점은 이 값과 브라우저 값 중 큰 쪽을 쓴다.

import { route } from "./_lib/http.js";
import { loadCase, cleanHintCount } from "./_lib/caseStore.js";
import { db, requireUser } from "./_lib/firebase.js";
import { sessionRef } from "./_lib/session.js";

export default route(["POST"], async ({ body, req }) => {
  const user = await requireUser(req);
  const { caseSecret } = loadCase(body.caseId);
  const used = cleanHintCount(body.hintCount);
  const hints = caseSecret.hints;

  const ref = sessionRef(user.uid, body.caseId);
  await db().runTransaction(async (tx) => {
    const s = (await tx.get(ref)).data() || {};
    if (s.firstAccusedAt) return; // 랭킹 기록이 끝난 뒤의 재도전은 남기지 않는다
    const next = Math.min(used + 1, hints.length);
    if (next > cleanHintCount(s.hintCount)) tx.set(ref, { hintCount: next }, { merge: true });
  });

  return {
    hint: hints[Math.min(used, hints.length - 1)],
    hintCount: used + 1,
    penalty: caseSecret.scoring.hintPenalty,
  };
});
