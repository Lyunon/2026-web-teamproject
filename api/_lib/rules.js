// 단서 해금 규칙 판정. 서버 코드가 정하고 AI 응답에는 의존하지 않는다.
// 입력만 받고 값을 돌려주는 순수 함수만 둔다. (Firestore, Gemini 호출 없음)

/** 공개 단서와 비공개 단서를 id로 찾을 수 있게 합친다. */
export function getClueMap(casePublic, caseSecret) {
  const map = {};
  for (const c of casePublic.clues) map[c.id] = c;
  for (const c of Object.values(caseSecret.clues)) map[c.id] = c;
  return map;
}

/** 시작 시 공개되는 단서 id 목록 */
export function initialUnlocked(casePublic) {
  return casePublic.clues.map((c) => c.id);
}

function hasAll(have, ids) {
  return (ids || []).every((id) => have.has(id));
}

/** 질문 메시지의 키워드로 해금될 단서 id 배열 */
export function unlockByAsk(rules, { suspectId, message, unlocked }) {
  const have = new Set(unlocked);
  const text = String(message || "");
  return rules
    .filter(
      (r) =>
        r.type === "ask" &&
        r.suspect === suspectId &&
        !have.has(r.clueId) &&
        hasAll(have, r.requires) &&
        r.keywords.some((k) => text.includes(k))
    )
    .map((r) => r.clueId);
}

/**
 * 단서 제시. 해금되지 않은 단서는 제시할 수 없다.
 * @returns {{ ok: boolean, reason?: string, newly: string[] }}
 */
export function unlockByShow(rules, { suspectId, clueId, unlocked }) {
  const have = new Set(unlocked);
  if (!have.has(clueId)) return { ok: false, reason: "NOT_OWNED", newly: [] };
  const newly = rules
    .filter(
      (r) =>
        r.type === "show" &&
        r.suspect === suspectId &&
        r.clue === clueId &&
        !have.has(r.clueId) &&
        hasAll(have, r.requires)
    )
    .map((r) => r.clueId);
  return { ok: true, newly };
}

/**
 * 현장 조사.
 * status: NOTHING(아무것도 없음) | ALREADY(이미 얻음) | LOCKED(조건 부족) | UNLOCKED(새 단서)
 */
export function unlockByInvestigate(rules, { target, unlocked }) {
  const have = new Set(unlocked);
  const rule = rules.find((r) => r.type === "investigate" && r.target === target);
  if (!rule) return { status: "NOTHING" };
  if (have.has(rule.clueId)) return { status: "ALREADY", clueId: rule.clueId };
  if (!hasAll(have, rule.requires)) return { status: "LOCKED" };
  return { status: "UNLOCKED", clueId: rule.clueId };
}

/** 조사 가능한 대상 목록 */
export function investigateTargets(rules) {
  return rules.filter((r) => r.type === "investigate").map((r) => r.target);
}

/** 범인 페르소나가 채팅에서 자백했는지 거칠게 검사한다. (테스트 경고용) */
const CONFESSION_PATTERNS = [
  /자백(합니다|할게|하겠)/,
  /(내|제)\s*(짓|소행)(이|입니다|이다)/,
  /(내가|제가)\s*(회장[님]?(을)?\s*)?(죽였|독살|바꿔치)/,
  /약병을\s*(제가|내가)\s*바꿔치/,
  /(내가|제가)\s*(다이아(몬드)?|보석|진품|푸른\s*별)(을|를)?\s*(훔쳤|바꿔|빼돌|숨겼)/,
];
export function looksLikeConfession(text) {
  return CONFESSION_PATTERNS.some((re) => re.test(String(text || "")));
}
