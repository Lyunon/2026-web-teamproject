// POST /api/start  { caseId }
// 사건 공개 정보 + 시작 단서를 돌려준다. 정답(secret)은 내보내지 않는다.

import { route } from "./_lib/http.js";
import { loadCase, publicClue } from "./_lib/caseStore.js";
import { initialUnlocked, investigateTargets } from "./_lib/rules.js";

export default route(["POST"], async ({ body }) => {
  const { casePublic, caseSecret, clueMap } = loadCase(body.caseId);
  const unlocked = initialUnlocked(casePublic);

  return {
    caseId: body.caseId,
    title: casePublic.title,
    intro: casePublic.intro,
    suspects: casePublic.suspects,
    clues: unlocked.map((id) => publicClue(clueMap[id])),
    unlocked,
    targets: investigateTargets(caseSecret.unlockRules),
    hintPenalty: caseSecret.scoring.hintPenalty,
    hintTotal: caseSecret.hints.length,
  };
});