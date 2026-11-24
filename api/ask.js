// POST /api/ask
//   { caseId, suspectId, message, showClueId?, unlocked, history }
// 용의자에게 질문하거나(단서 제시 포함) Gemini 응답을 받는다.
// 단서 해금은 rules.js가 정하고, Gemini는 대사만 만든다.

import { route, HttpError } from "./_lib/http.js";
import {
  loadCase,
  publicClue,
  hasClue,
  cleanUnlocked,
  cleanHistory,
  MAX_MESSAGE,
} from "./_lib/caseStore.js";
import { generateSuspectReply } from "./_lib/gemini.js";
import { buildSystemInstruction, buildShownClueMessage } from "./_lib/prompt.js";
import { unlockByAsk, unlockByShow, looksLikeConfession } from "./_lib/rules.js";
import { requireUser } from "./_lib/firebase.js";   

const CONFESSION_FALLBACK = {
  reply: "(입을 굳게 다문다.) ……더 드릴 말씀은 없습니다.",
  emotion: "nervous",
};

export default route(["POST"], async ({ body, req }) => {
  await requireUser(req);
  const { casePublic, caseSecret, clueMap } = loadCase(body.caseId, body.caseToken);

  const suspectId = body.suspectId;
  if (!casePublic.suspects.some((s) => s.id === suspectId)) {
    throw new HttpError(400, "없는 용의자입니다.");
  }

  const text = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);
  const unlocked = cleanUnlocked(body.unlocked, casePublic, clueMap);
  const history = cleanHistory(body.history);

  let newly = [];
  let shownClue = null;

  if (body.showClueId) {
    if (!hasClue(clueMap, body.showClueId)) {
      throw new HttpError(400, "가지고 있지 않은 단서입니다.");
    }
    const res = unlockByShow(caseSecret.unlockRules, {
      suspectId,
      clueId: body.showClueId,
      unlocked,
    });
    if (!res.ok) throw new HttpError(400, "가지고 있지 않은 단서입니다.");
    newly = res.newly;
    shownClue = clueMap[body.showClueId];
  } else {
    if (!text) throw new HttpError(400, "질문을 입력하세요.");
    newly = unlockByAsk(caseSecret.unlockRules, { suspectId, message: text, unlocked });
  }

  const newIds = [...new Set(newly)].filter((id) => hasClue(clueMap, id) && !unlocked.includes(id));
  const nextUnlocked = [...unlocked, ...newIds];

  const systemInstruction = buildSystemInstruction({
    casePublic,
    caseSecret,
    suspectId,
    unlocked: nextUnlocked,
    shownClueId: shownClue?.id,
  });
  const message = shownClue ? buildShownClueMessage(shownClue, text) : text;

  let r;
  try {
    r = await generateSuspectReply({ systemInstruction, history, message });
  } catch (err) {
    console.error("[ask] Gemini 오류:", err?.code || err?.message || err);
    throw new HttpError(503, "용의자가 잠시 생각 중입니다. 잠시 후 다시 시도해 주세요.");
  }

  // 범인이 자백한 것처럼 보이면 그 대사는 플레이어에게 보내지 않는다.
  let { reply, emotion } = r;
  const guarded = suspectId === caseSecret.culprit && looksLikeConfession(reply);
  if (guarded) {
    console.warn("[ask] 자백성 응답을 차단했습니다:", reply);
    ({ reply, emotion } = CONFESSION_FALLBACK);
  }

  return {
    reply,
    emotion,
    guarded,
    newClues: newIds.map((id) => publicClue(clueMap[id])),
    unlocked: nextUnlocked,
    // 브라우저가 history에 저장해 다음 요청에 되돌려 보낸다.
    historyUser: message,
    historyModel: reply,
  };
});
