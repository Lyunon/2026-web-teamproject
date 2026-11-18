// POST /api/accuse  { caseId, suspectId, hintCount, elapsedSeconds }
// 범인 판정. 정답은 이 응답에서만 공개된다.

import { route, HttpError } from "./_lib/http.js";
import { calculateScore, canAccuse } from "../public/js/scoring.js";
import { loadCase, cleanHintCount } from "./_lib/caseStore.js";

export default route(["POST"], async ({ body }) => {
  const { casePublic, caseSecret } = loadCase(body.caseId);

  if (!casePublic.suspects.some((s) => s.id === body.suspectId)) {
    throw new HttpError(400, "없는 용의자입니다.");
  }

  if (!canAccuse(body.elapsedSeconds)) {
    throw new HttpError(400, "사건을 시작한 뒤 1분이 지나야 범인을 지목할 수 있습니다.");
  }
  const correct = body.suspectId === caseSecret.culprit;
  const hintCount = cleanHintCount(body.hintCount);
  const points = calculateScore({ isCorrect: correct, elapsedSeconds: body.elapsedSeconds, hintCount });

  return {
    correct,
    culprit: caseSecret.culprit,
    ...points,
    elapsedSeconds: body.elapsedSeconds,
    hintCount,
    solutionExplain: caseSecret.solutionExplain,
  };
});