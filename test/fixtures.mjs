// 난이도 규칙을 정확히 만족하는 가짜 Gemini 응답 (테스트용)
import { DIFFICULTY_RULES } from "../api/_lib/difficulty.js";

const pad = (n) => `c${String(n).padStart(2, "0")}`;

export function makeRaw(difficultyId) {
  const cfg = DIFFICULTY_RULES[difficultyId];
  const ids = Array.from({ length: cfg.suspects }, (_, i) => `person${i}`);
  const culprit = ids[0];
  const suspects = ids.map((id, i) => ({
    id, name: `이름${i}`, role: `역할${i}`, publicBio: `소개${i}`, personality: "차분한 존댓말",
    knows: ["아는 것"], hides: ["숨기는 것"], reveals: ["질문하면 답한다"],
    lies: i === 0 ? Array.from({ length: cfg.culpritLies }, (_, k) => `거짓말${k} (c01 단서와 모순)`)
      : i <= cfg.innocentLiars ? ["개인 사정으로 거짓말 (c01 단서와 모순)"] : [],
    showReactions: [{ clueId: "c01", text: "당황한다" }],
  }));

  const startN = cfg.startClues[0];
  const startClues = Array.from({ length: startN }, (_, i) => ({
    id: pad(i + 1), title: `시작${i}`, location: "현장", text: "현장 단서", iconType: "window", label: "창문",
  }));
  const H = cfg.hidden[1];
  const hiddenClues = [];
  const unlockRules = [];
  const cycle = ["ask", "show", "investigate"];
  for (let k = 1; k <= H; k++) {
    const id = pad(startN + k);
    hiddenClues.push({
      id, title: `숨은${k}`, location: "어딘가", text: "단서 내용", iconType: "drawer", label: "서랍",
      role: k <= cfg.redHerrings ? "유도" : "핵심",
    });
    const type = k === 1 ? "investigate" : cycle[(k - 2) % 3];
    const rule = { clueId: id, type };
    if (k > 1) rule.requires = [pad(startN + k - 1)];
    if (k === H) rule.requires = Array.from({ length: cfg.decisiveDeps }, (_, j) => pad(startN + H - 1 - j));
    if (type === "investigate") rule.target = `spot_${k}`;
    else rule.suspect = ids[k % ids.length];
    if (type === "ask") rule.keywords = ["약", "시간", "어디"];
    if (type === "show") rule.clue = pad(1);
    unlockRules.push(rule);
  }
  const contradictions = Array.from({ length: cfg.contradictions }, (_, i) => ({
    suspectId: ids[i === 0 ? 0 : i % ids.length], clueId: pad(1), note: "진술과 단서가 어긋난다",
  }));
  return {
    title: "테스트 사건", intro: "가".repeat(80), roomTitle: "테스트 현장", culprit,
    motive: "동기", method: "수법", solutionExplain: "나".repeat(80),
    decisiveClueId: pad(startN + H),
    suspects, startClues, hiddenClues, unlockRules, contradictions,
    hints: ["힌트1", "힌트2", "힌트3"],
  };
}

