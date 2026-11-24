// POST /api/start  { caseId }   (Authorization: Bearer <ID 토큰>)
// 사건 공개 정보 + 시작 단서를 돌려주고, 서버 쪽 플레이 기록(sessions)이 없으면 만든다.
// 정답(secret)은 내보내지 않는다.

import { route } from "./_lib/http.js";
import { loadCase, publicClue } from "./_lib/caseStore.js";
import { initialUnlocked, investigateTargets } from "./_lib/rules.js";
import { requireUser } from "./_lib/firebase.js";
import { ensureSession } from "./_lib/session.js";

export default route(["POST"], async ({ body, req }) => {
  const user = await requireUser(req);
  const { casePublic, caseSecret, clueMap } = loadCase(body.caseId);
  await ensureSession(user.uid, body.caseId);
  const unlocked = initialUnlocked(casePublic);

  return {
    caseId: body.caseId,
    title: casePublic.title,
    difficulty: casePublic.difficulty ?? null,
    scene: casePublic.scene ?? null, // 사건 JSON 에 scene 이 있으면 쓰고, 없으면 play.js 의 자체 배치를 쓴다.
    intro: casePublic.intro,
    suspects: casePublic.suspects,
    clues: unlocked.map((id) => publicClue(clueMap[id])),
    unlocked,
    targets: investigateTargets(caseSecret.unlockRules),
    hintPenalty: caseSecret.scoring.hintPenalty,
    hintTotal: caseSecret.hints.length,
  };
});
