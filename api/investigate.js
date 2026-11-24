// POST /api/investigate  { caseId, target, unlocked }
// 현장 조사. Gemini를 쓰지 않는다.

import { route } from "./_lib/http.js";
import { loadCase, publicClue, hasClue, cleanUnlocked } from "./_lib/caseStore.js";
import { unlockByInvestigate } from "./_lib/rules.js";

export default route(["POST"], async ({ body }) => {
  const { casePublic, caseSecret, clueMap } = loadCase(body.caseId, body.caseToken);
  const unlocked = cleanUnlocked(body.unlocked, casePublic, clueMap);
  const target = String(body.target ?? "").trim().slice(0, 50);

  const res = unlockByInvestigate(caseSecret.unlockRules, { target, unlocked });

  const none = (status, message) => ({ status, message, newClues: [], unlocked });
  if (res.status === "NOTHING") return none("NOTHING", "조사할 만한 것이 없다.");
  if (res.status === "ALREADY") return none("ALREADY", "이미 확인한 곳이다.");
  if (res.status === "LOCKED") return none("LOCKED", "아직 열 이유가 없다.");

  if (!hasClue(clueMap, res.clueId) || unlocked.includes(res.clueId)) {
    return none("ALREADY", "이미 확인한 곳이다.");
  }
  return {
    status: "FOUND",
    message: "새 단서를 발견했다.",
    newClues: [publicClue(clueMap[res.clueId])],
    unlocked: [...unlocked, res.clueId],
  };
});