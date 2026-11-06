// POST /api/hint  { caseId, hintCount }
// 힌트는 시드에 적힌 순서대로 준다. Gemini를 쓰지 않는다.

import { route } from "./_lib/http.js";
import { loadCase, cleanHintCount } from "./_lib/caseStore.js";

export default route(["POST"], async ({ body }) => {
  const { caseSecret } = loadCase(body.caseId);
  const used = cleanHintCount(body.hintCount);
  const hints = caseSecret.hints;

  return {
    hint: hints[Math.min(used, hints.length - 1)],
    hintCount: used + 1,
    penalty: caseSecret.scoring.hintPenalty,
  };
});