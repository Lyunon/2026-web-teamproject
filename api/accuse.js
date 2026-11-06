// POST /api/accuse  { caseId, suspectId, hintCount }
// 범인 판정. 정답은 이 응답에서만 공개된다.

import { route, HttpError } from "./_lib/http.js";
import { loadCase, cleanHintCount } from "./_lib/caseStore.js";

export default route(["POST"], async ({ body }) => {
  const { casePublic, caseSecret } = loadCase(body.caseId);

  if (!casePublic.suspects.some((s) => s.id === body.suspectId)) {
    throw new HttpError(400, "없는 용의자입니다.");
  }

  const correct = body.suspectId === caseSecret.culprit;
  const hintCount = cleanHintCount(body.hintCount);
  const penalty = hintCount * caseSecret.scoring.hintPenalty;
  const base = correct ? caseSecret.scoring.culprit : 0;

  return {
    correct,
    culprit: caseSecret.culprit,
    base,
    penalty,
    score: Math.max(0, base - penalty),
    solutionExplain: caseSecret.solutionExplain,
  };
});