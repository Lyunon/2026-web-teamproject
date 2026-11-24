// Gemini 로 새 사건을 만들고, 게임 규칙에 맞는지 서버가 검증해 data/cases/*.json 과 같은 모양으로 돌려준다.
// Gemini 는 "사건 설계"만 하고, 해금 규칙의 일관성(도달 가능 여부, 증거 연쇄 깊이, 모순 수 등)은 이 파일이 판정한다.
// 검증에 실패하면 GeminiError(BAD_RESPONSE)를 던져 gemini.js 가 다시 시도하게 한다.

import crypto from "node:crypto";

import { GeminiError, generateStructured, CHAT_MODELS } from "./gemini.js";
import { DIFFICULTY_RULES } from "./difficulty.js";
import { GENRES, RANDOM_GENRE } from "../../public/js/genres.js";

export const ICON_TYPES = [
  "door", "window", "medicine_cabinet", "armchair", "tray", "document",
  "drawer", "cctv", "bag", "glass_dome", "vent",
];
const ICON_EMOJI = {
  door: "🚪", window: "🪟", medicine_cabinet: "💊", armchair: "🪑", tray: "🍷", document: "📄",
  drawer: "🗄️", cctv: "📹", bag: "🧰", glass_dome: "💎", vent: "🌀",
};
const CLUE_ROLES = ["핵심", "유도", "핵심(동기)", "결정적 증거"];
const RULE_TYPES = ["investigate", "ask", "show"];

// play.js 의 현장 화면에서 겹치지 않는 오브젝트 자리 (x, y 는 % 단위, 최대 14개)
const HOTSPOT_SLOTS = [
  [4.5, 24], [18, 9], [35.5, 11], [19.5, 44], [38.5, 43],
  [53.5, 42], [55.5, 64], [75.5, 10], [77, 56], [18, 62],
  [88, 32], [36, 64], [64, 20], [89, 72],
];

// ---------- 무작위 설정 (같은 장르 요청마다 다른 사건이 나오도록 서버가 뽑는다) ----------
const SEEDS = {
  mansion: {
    settings: ["폭설로 고립된 산장형 저택", "해안 절벽 위의 별장", "비밀이 많은 한옥 고택", "외딴 섬의 사립 저택", "안개 낀 호숫가 저택"],
    crimes: ["약물 바꿔치기에 의한 독살", "계단 추락으로 위장한 살인", "밀실에서의 질식사", "와인에 탄 독", "정전 중에 일어난 살인"],
    motives: ["유언장과 상속", "숨겨 온 횡령", "오래된 원한", "협박당하던 과거의 비밀", "사업 매각을 둘러싼 갈등"],
  },
  gallery: {
    settings: ["국립미술관 야간 특별전", "사설 보석 경매장", "대학 박물관 신관", "고서화 전시회 개막 직전", "보안 구역이 있는 사립 컬렉션"],
    crimes: ["진품과 모조품 바꿔치기", "도난으로 위장한 보험 사기", "전시품 반출", "감정서 위조를 통한 절도", "경매 직전의 보석 증발"],
    motives: ["빚과 밀수 조직의 압박", "해고에 대한 앙갚음", "위조 사실을 숨기려는 목적", "보험금", "가문의 유산을 되찾으려는 집착"],
  },
  train: {
    settings: ["설원을 달리는 특급열차 VIP 객실", "국경을 넘는 야간열차", "폭설로 멈춘 관광열차", "해안선을 따라 달리는 호화 열차", "고지대 산악열차의 마지막 편"],
    crimes: ["수면제를 이용한 문서 탈취", "독극물 중독", "객실 밀실 살인", "승객 실종", "귀중품이 든 가방 바꿔치기"],
    motives: ["기밀 문서의 가치", "과거 사건의 은폐", "승진을 둘러싼 경쟁", "밀수 조직과의 거래", "가족을 둘러싼 오래된 원한"],
  },
};

const pick = (arr) => arr[crypto.randomInt(arr.length)];
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function resolveGenre(genreId) {
  if (genreId === RANDOM_GENRE.id) return pick(GENRES);
  const g = GENRES.find((x) => x.id === genreId);
  return g || null;
}

// ---------- Gemini 응답 스키마 ----------
const S = { type: "string" };
const strArr = { type: "array", items: S };
const clueProps = {
  id: S, title: S, location: S, text: S,
  iconType: { type: "string", enum: ICON_TYPES },
  label: S,
};

export const CASE_SCHEMA = {
  type: "object",
  properties: {
    title: S,
    intro: S,
    roomTitle: S,
    culprit: S,
    motive: S,
    method: S,
    solutionExplain: S,
    decisiveClueId: S,
    suspects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: S, name: S, role: S, publicBio: S, personality: S,
          knows: strArr, hides: strArr, lies: strArr, reveals: strArr,
          showReactions: {
            type: "array",
            items: { type: "object", properties: { clueId: S, text: S }, required: ["clueId", "text"] },
          },
        },
        required: ["id", "name", "role", "publicBio", "personality", "knows", "hides", "lies", "reveals", "showReactions"],
      },
    },
    startClues: {
      type: "array",
      items: { type: "object", properties: clueProps, required: ["id", "title", "location", "text", "iconType", "label"] },
    },
    hiddenClues: {
      type: "array",
      items: {
        type: "object",
        properties: { ...clueProps, role: { type: "string", enum: CLUE_ROLES } },
        required: ["id", "title", "location", "text", "iconType", "label", "role"],
      },
    },
    unlockRules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          clueId: S,
          type: { type: "string", enum: RULE_TYPES },
          target: S,
          suspect: S,
          keywords: strArr,
          clue: S,
          requires: strArr,
        },
        required: ["clueId", "type"],
      },
    },
    contradictions: {
      type: "array",
      items: { type: "object", properties: { suspectId: S, clueId: S, note: S }, required: ["suspectId", "clueId", "note"] },
    },
    hints: strArr,
  },
  required: [
    "title", "intro", "roomTitle", "culprit", "motive", "method", "solutionExplain", "decisiveClueId",
    "suspects", "startClues", "hiddenClues", "unlockRules", "contradictions", "hints",
  ],
};

// ---------- 프롬프트 ----------
export function buildSystemInstruction() {
  return [
    "너는 한국어 추리 게임의 시나리오 작가이자 퍼즐 설계자다. 플레이어는 수사관이 되어 현장을 조사하고 용의자를 심문해 범인을 지목한다.",
    "폭력은 묘사하지 않고 추리 소설 수준으로만 다룬다. 실존 인물·단체·브랜드는 쓰지 않는다. 모든 이름은 지어낸 한국어 이름이다.",
    "반드시 요청한 JSON 스키마대로만 답한다. 설명 문장이나 코드 블록을 덧붙이지 않는다.",
    "공정한 추리여야 한다: 범인은 플레이어가 얻을 수 있는 단서만으로 논리적으로 특정할 수 있어야 하고, 정답은 한 명뿐이다.",
  ].join("\n");
}

export function buildPrompt({ genre, difficultyId }) {
  const d = DIFFICULTY_RULES[difficultyId];
  const seed = SEEDS[genre.id];
  const setting = pick(seed.settings);
  const crime = pick(seed.crimes);
  const motive = pick(seed.motives);
  const iconGuide = "door(문), window(창문), medicine_cabinet(약장·수납장), armchair(의자·좌석), tray(쟁반·식기), document(서류·메모), drawer(서랍·보관함), cctv(CCTV·모니터), bag(가방), glass_dome(진열대·유리장), vent(환기구)";

  return [
    `[장르] ${genre.label} — ${genre.desc}`,
    `[이번 사건의 설정(반드시 반영)] 배경: ${setting} / 사건 유형: ${crime} / 동기의 방향: ${motive}`,
    `[난이도] ${d.label}`,
    "",
    "[구성 규칙 — 숫자는 최소 기준이며 모두 지켜야 한다]",
    `- suspects: 정확히 ${d.suspects}명. id 는 영문 소문자와 밑줄(예: butler, doctor), 서로 달라야 한다. 범인(culprit)은 이 중 한 명이다.`,
    `- startClues: 정확히 ${d.startClues[0]}~${d.startClues[1]}개. 시작할 때 모두 공개되는 현장 기본 단서. id 는 c01, c02 순서.`,
    `- hiddenClues: ${d.hidden[0]}~${d.hidden[1]}개. id 는 startClues 다음 번호부터 이어서(c04…). role 은 핵심/유도/핵심(동기)/결정적 증거 중 하나.`,
    `  · role 이 "유도"인 가짜 단서(무고한 사람을 의심하게 만드는 단서)를 ${d.redHerrings}개 이상 넣는다.`,
    `  · role 이 "결정적 증거"인 단서는 정확히 1개이고 그 id 를 decisiveClueId 에 적는다. 이 증거가 범인을 확정한다.`,
    `- unlockRules: hiddenClues 마다 정확히 1개. type 은 세 가지.`,
    `  · investigate: 현장 오브젝트를 조사하면 얻음. target 은 영문 소문자·밑줄 id(예: study_desk), 규칙끼리 중복 금지.`,
    `  · ask: 용의자(suspect)에게 질문하면 얻음. keywords 는 플레이어가 자연스럽게 쓸 한국어 단어 3~5개(각 2~6자, 비슷한말 포함).`,
    `  · show: 용의자(suspect)에게 이미 가진 단서(clue)를 보여 주면 얻음.`,
    `  · requires: 미리 얻어야 하는 단서 id 목록. 규칙 전체에서 requires 가 있는 규칙을 ${d.gatedRules}개 이상 만든다.`,
    `  · ask 규칙은 ${d.askRules}개 이상, show 규칙은 ${d.showRules}개 이상 만든다.`,
    `  · 순환 의존이 없어야 하며, 시작 단서만으로 모든 단서를 결국 얻을 수 있어야 한다.`,
    `- 증거 연쇄: decisiveClueId 단서는 시작 단서로부터 최소 ${d.chainDepth}단계를 거쳐야 얻는다(단서 A를 얻어야 B, B를 얻어야 C … 식으로 requires 나 show 의 clue 가 이어진다).`,
    `  decisiveClueId 규칙의 requires 와 show 대상 단서를 합쳐 ${d.decisiveDeps}개 이상의 선행 단서가 필요하다.`,
    `- 오브젝트: investigate 규칙의 개수 + startClues 개수는 합쳐서 10개 이하. iconType 은 ${iconGuide} 중에서 단서와 어울리는 것을 고르고, label 은 현장 오브젝트 이름(15자 이내, 이모지 없음).`,
    `- contradictions: 정확히 ${d.contradictions}개 이상. "이 용의자(suspectId)의 진술이 이 단서(clueId)와 어긋난다"를 뜻하며 note 에 어떻게 어긋나는지 한 문장으로 쓴다.`,
    `  · 범인에 대한 모순이 최소 1개 있어야 한다. clueId 는 실제 존재하는 단서 id 여야 한다.`,
    `- 거짓말: 범인의 lies 는 ${d.culpritLies}개 이상. 범인이 아닌 용의자 중 lies 가 1개 이상인 사람이 ${d.innocentLiars}명 이상이어야 한다(그들은 범행과 무관한 개인 사정 때문에 숨기거나 거짓말을 한다).`,
    `  · lies 의 각 항목은 "무엇이라고 말한다 (cNN 단서와 모순)" 형태로 쓴다.`,
    `- 각 용의자는 personality(말투 포함), knows(아는 것, 1개 이상), hides, lies, reveals(어떤 질문에 어떻게 반응하는지), showReactions(단서를 보여 줬을 때 반응; clueId 는 실제 단서 id) 를 가진다. 항목 하나는 60자 이내로 짧게.`,
    `- 범인의 persona 에는 자백하지 않는다는 전제로 작성한다. 범인의 knows 에 동기와 수법의 핵심을 포함한다.`,
    `- hints: 정확히 3개. 순서대로 점점 구체적이다. 스타일: ${d.hintStyle}`,
    `- 이 난이도의 추가 규칙: ${d.extra}`,
    "",
    "[글 분량] title 20자 이내, intro 200~350자(사건 개요와 플레이어의 임무), 단서 text 는 1~2문장, solutionExplain 은 4~6문장(범인·동기·수법·결정적 증거·오답 유도의 정체).",
    "[단서 작성] 단서 text 는 사실만 적고 추리 결론을 적지 않는다. 같은 사실을 다른 단서에 반복하지 않는다.",
    "",
    "위 규칙을 모두 만족하는 새 사건 하나를 JSON 으로 만들어라.",
  ].join("\n");
}

// ---------- 검증·보정 ----------
// Gemini(특히 가벼운 모델)는 숫자 조건을 한두 개씩 놓치기 쉽다. 사건 전체를 버리면 시간 안에 완성하지 못하므로
// 고칠 수 있는 것은 서버가 고치고(아이디 정리, 빠진 규칙 보충, 순환 끊기, 힌트 채우기 등),
// 게임이 성립하지 않는 경우(범인 없음, 용의자·단서가 너무 적음)만 GeminiError(BAD_RESPONSE)로 다시 만들게 한다.
const bad = (msg) => new GeminiError("BAD_RESPONSE", `사건 검증 실패: ${msg}`);
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v, maxItems, maxLen) =>
  (Array.isArray(v) ? v : []).map((s) => str(s, maxLen)).filter(Boolean).slice(0, maxItems);
const SUSPECT_ID = /^[a-z][a-z0-9_]{1,19}$/;
const TARGET_ID = /^[a-z][a-z0-9_]{1,30}$/;
const pad2 = (n) => `c${String(n).padStart(2, "0")}`;

const MIN_SUSPECTS = 3, MAX_SUSPECTS = 6;
const MIN_HIDDEN = 3, MAX_HIDDEN = 10;
const FALLBACK_HINTS = [
  "용의자들의 진술 중 단서와 맞지 않는 부분을 찾아보세요.",
  "아직 조사하지 않은 현장 물건이나, 단서를 보여 주지 않은 용의자가 있는지 확인해 보세요.",
  "범인만 알 수 있었던 사실이 무엇인지 생각해 보세요.",
];

function normClue(c, role, id) {
  const iconType = ICON_TYPES.includes(c?.iconType) ? c.iconType : "document";
  const title = str(c?.title, 30) || "이름 없는 단서";
  return {
    id,
    title,
    location: str(c?.location, 30) || "현장",
    role,
    text: str(c?.text, 300),
    iconType,
    label: str(c?.label, 20) || title.slice(0, 20),
  };
}

/**
 * Gemini 가 만든 사건을 보정·검증한다. 게임이 성립하지 않으면 GeminiError(BAD_RESPONSE).
 * @returns {{ public: object, secret: object, warnings: string[] }}
 */
export function validateGeneratedCase(raw, { genre, difficultyId }) {
  const cfg = DIFFICULTY_RULES[difficultyId];
  if (!cfg) throw bad("알 수 없는 난이도");
  if (!raw || typeof raw !== "object") throw bad("객체가 아님");
  const warnings = []; // 난이도 기준을 못 맞춘 부분 (서버 로그용)

  // --- 용의자: 아이디를 정리하고 원래 아이디 → 새 아이디 표를 만든다
  const suspectsIn = (Array.isArray(raw.suspects) ? raw.suspects : []).filter((s) => str(s?.name, 12));
  if (suspectsIn.length < MIN_SUSPECTS) throw bad(`용의자가 너무 적음 (${suspectsIn.length})`);
  if (suspectsIn.length !== cfg.suspects) warnings.push(`용의자 ${suspectsIn.length}명 (기준 ${cfg.suspects})`);
  const sMap = new Map();
  const suspects = [];
  const personas = {};
  suspectsIn.slice(0, MAX_SUSPECTS).forEach((s, i) => {
    const orig = str(s.id, 40);
    let id = orig.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^[^a-z]+/, "").slice(0, 20);
    if (!SUSPECT_ID.test(id) || personas[id]) id = `suspect_${i + 1}`;
    if (orig) sMap.set(orig, id);
    sMap.set(id, id);
    const name = str(s.name, 12);
    sMap.set(name, id); // Gemini 가 아이디 대신 이름을 적는 경우
    const publicBio = str(s.publicBio, 120) || str(s.role, 20) || "사건 관계자";
    suspects.push({ id, name, role: str(s.role, 20) || "관계자", publicBio });
    personas[id] = {
      personality: str(s.personality, 160) || "차분한 존댓말을 쓴다.",
      knows: strList(s.knows, 6, 120).length ? strList(s.knows, 6, 120) : [publicBio],
      hides: strList(s.hides, 6, 120),
      lies: strList(s.lies, 5, 160),
      reveals: strList(s.reveals, 6, 160),
      showReactions: {},
      _showRaw: Array.isArray(s.showReactions) ? s.showReactions : [],
    };
  });
  const sid = (v) => sMap.get(str(v, 40)) || null;
  const culprit = sid(raw.culprit);
  if (!culprit) throw bad("culprit 가 용의자 목록에 없음");

  // --- 단서: c01 부터 다시 번호를 매기고 원래 아이디 → 새 아이디 표를 만든다
  const startIn = (Array.isArray(raw.startClues) ? raw.startClues : []).filter((c) => str(c?.text, 300));
  const hiddenIn = (Array.isArray(raw.hiddenClues) ? raw.hiddenClues : []).filter((c) => str(c?.text, 300));
  if (startIn.length < 1) throw bad("시작 단서 없음");
  if (hiddenIn.length < MIN_HIDDEN) throw bad(`숨은 단서가 너무 적음 (${hiddenIn.length})`);
  const startUse = startIn.slice(0, 4);
  const hiddenUse = hiddenIn.slice(0, MAX_HIDDEN);
  if (startUse.length < cfg.startClues[0] || startUse.length > cfg.startClues[1]) warnings.push(`시작 단서 ${startUse.length}`);
  if (hiddenUse.length < cfg.hidden[0]) warnings.push(`숨은 단서 ${hiddenUse.length}`);
  const cMap = new Map();
  let n = 0;
  const startClues = startUse.map((c) => {
    const id = pad2(++n);
    if (str(c.id, 10)) cMap.set(str(c.id, 10), id);
    return normClue(c, "현장 기본", id);
  });
  const hiddenClues = hiddenUse.map((c) => {
    const id = pad2(++n);
    if (str(c.id, 10)) cMap.set(str(c.id, 10), id);
    return normClue(c, CLUE_ROLES.includes(c?.role) ? c.role : "핵심", id);
  });
  for (const c of [...startClues, ...hiddenClues]) cMap.set(c.id, cMap.get(c.id) || c.id);
  const allIds = new Set([...startClues, ...hiddenClues].map((c) => c.id));
  const startIds = new Set(startClues.map((c) => c.id));
  const hiddenIds = new Set(hiddenClues.map((c) => c.id));
  const cid = (v) => {
    const id = cMap.get(str(v, 10));
    return id && allIds.has(id) ? id : null;
  };
  if (hiddenClues.filter((c) => c.role === "유도").length < cfg.redHerrings) warnings.push("유도 단서 부족");

  // --- 해금 규칙: 잘못된 규칙은 현장 조사 규칙으로 바꾸고, 빠진 단서는 규칙을 만들어 준다
  const ruleFor = new Map();
  const targets = new Set();
  const uniqueTarget = (want, clueId) => {
    let t = str(want, 31).toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^[^a-z]+/, "").slice(0, 28);
    if (!TARGET_ID.test(t)) t = `spot_${clueId}`;
    let out = t, k = 2;
    while (targets.has(out)) out = `${t}_${k++}`;
    targets.add(out);
    return out;
  };
  for (const r of Array.isArray(raw.unlockRules) ? raw.unlockRules : []) {
    const clueId = cid(r?.clueId);
    if (!clueId || !hiddenIds.has(clueId) || ruleFor.has(clueId)) continue;
    const requires = [...new Set((Array.isArray(r.requires) ? r.requires : []).map(cid).filter((id) => id && id !== clueId))].slice(0, 4);
    const suspect = sid(r.suspect);
    let type = RULE_TYPES.includes(r.type) ? r.type : "investigate";
    const keywords = strList(r.keywords, 6, 8);
    const shown = cid(r.clue);
    if (type === "ask" && (!suspect || !keywords.length)) type = "investigate";
    if (type === "show" && (!suspect || !shown || shown === clueId)) type = "investigate";
    const rule = { clueId, type };
    if (requires.length) rule.requires = requires;
    if (type === "investigate") rule.target = uniqueTarget(r.target, clueId);
    if (type !== "investigate") rule.suspect = suspect;
    if (type === "ask") rule.keywords = keywords;
    if (type === "show") rule.clue = shown;
    ruleFor.set(clueId, rule);
  }
  for (const id of hiddenIds) {
    if (!ruleFor.has(id)) ruleFor.set(id, { clueId: id, type: "investigate", target: uniqueTarget("", id) });
  }
  const rules = hiddenClues.map((c) => ruleFor.get(c.id));

  // 현장 오브젝트가 자리보다 많으면, 남는 조사 규칙을 '범인이 아닌 용의자에게 단서 보여 주기'로 바꾼다
  const otherSuspects = suspects.filter((s) => s.id !== culprit).map((s) => s.id);
  let invRules = rules.filter((r) => r.type === "investigate");
  while (startClues.length + invRules.length > HOTSPOT_SLOTS.length) {
    const r = invRules.pop();
    targets.delete(r.target);
    delete r.target;
    r.type = "show";
    r.suspect = otherSuspects[invRules.length % otherSuspects.length];
    r.clue = startClues[0].id;
  }

  // 순환이나 끊긴 연결은 선행 조건을 지워서 모든 단서에 도달할 수 있게 만든다
  const depsOf = (r) => [...(r.requires || []), ...(r.type === "show" ? [r.clue] : [])];
  const computeLevels = () => {
    const level = new Map([...startIds].map((id) => [id, 0]));
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const r of rules) {
        if (level.has(r.clueId)) continue;
        const deps = depsOf(r);
        if (deps.every((id) => level.has(id))) {
          level.set(r.clueId, 1 + Math.max(0, ...deps.map((id) => level.get(id))));
          progressed = true;
        }
      }
    }
    return level;
  };
  let level = computeLevels();
  for (let guard = 0; guard < rules.length * 2 && rules.some((r) => !level.has(r.clueId)); guard++) {
    const r = rules.find((x) => !level.has(x.clueId));
    if (r.requires) delete r.requires;
    else if (r.type === "show") r.clue = startClues[0].id;
    level = computeLevels();
  }
  if (rules.some((r) => !level.has(r.clueId))) throw bad("도달할 수 없는 단서");

  // --- 결정적 증거: 지정이 틀렸으면 가장 깊은 단서로 정한다
  let decisiveId = cid(raw.decisiveClueId);
  if (!decisiveId || !hiddenIds.has(decisiveId)) {
    decisiveId = [...hiddenIds].sort((a, b) => level.get(b) - level.get(a))[0];
    warnings.push("decisiveClueId 보정");
  }
  hiddenClues.forEach((c) => {
    if (c.id === decisiveId) c.role = "결정적 증거";
    else if (c.role === "결정적 증거") c.role = "핵심";
  });
  if (level.get(decisiveId) < cfg.chainDepth) warnings.push(`증거 단계 ${level.get(decisiveId)} (기준 ${cfg.chainDepth})`);
  if (rules.filter((r) => r.requires?.length).length < cfg.gatedRules) warnings.push("조건부 규칙 부족");

  // --- 모순·거짓말 (기준 미달은 기록만)
  const contradictions = (Array.isArray(raw.contradictions) ? raw.contradictions : [])
    .map((c) => ({ suspectId: sid(c?.suspectId), clueId: cid(c?.clueId), note: str(c?.note, 160) }))
    .filter((c) => c.suspectId && c.clueId && c.note);
  if (contradictions.length < cfg.contradictions) warnings.push(`모순 ${contradictions.length} (기준 ${cfg.contradictions})`);
  if (!contradictions.some((c) => c.suspectId === culprit)) warnings.push("범인 모순 없음");
  const innocentLiars = suspects.filter((s) => s.id !== culprit && personas[s.id].lies.length > 0).length;
  if (innocentLiars < cfg.innocentLiars) warnings.push(`무고한 거짓말 ${innocentLiars} (기준 ${cfg.innocentLiars})`);

  // --- 단서 제시 반응
  for (const s of suspects) {
    const p = personas[s.id];
    for (const sr of p._showRaw) {
      const id = cid(sr?.clueId);
      const text = str(sr?.text, 200);
      if (id && text) p.showReactions[id] = text;
    }
    delete p._showRaw;
  }

  // --- 힌트·본문
  const hints = strList(raw.hints, 3, 160);
  while (hints.length < 3) hints.push(FALLBACK_HINTS[hints.length]);
  const title = str(raw.title, 40) || `${genre.label} 사건`;
  const intro = str(raw.intro, 600);
  if (intro.length < 20) throw bad("사건 소개 없음");
  const roomTitle = str(raw.roomTitle, 60) || genre.label;
  const culpritName = suspects.find((s) => s.id === culprit).name;
  const motive = str(raw.motive, 400) || "밝혀지지 않음";
  const method = str(raw.method, 500) || "밝혀지지 않음";
  const solutionExplain = str(raw.solutionExplain, 900) || `범인은 ${culpritName}입니다. 동기: ${motive} 수법: ${method}`;

  // --- 현장 오브젝트 배치 (서버가 자리를 정한다)
  const spots = [
    ...startClues.map((c) => ({ mode: "clue", clue: c })),
    ...rules.filter((r) => r.type === "investigate").map((r) => ({
      mode: "investigate", clue: hiddenClues.find((c) => c.id === r.clueId), target: r.target,
    })),
  ];
  const slots = shuffle(HOTSPOT_SLOTS);
  const hotspots = spots.map((sp, i) => {
    const hs = {
      mode: sp.mode,
      clueId: sp.clue.id,
      iconType: sp.clue.iconType,
      label: `${ICON_EMOJI[sp.clue.iconType] || "🔎"} ${sp.clue.label}`,
      x: slots[i][0],
      y: slots[i][1],
    };
    if (sp.mode === "investigate") hs.target = sp.target;
    return hs;
  });

  const strip = ({ iconType, label, ...rest }) => rest; // 아이콘·라벨은 현장 배치에만 쓴다
  return {
    warnings,
    public: {
      title,
      intro,
      difficulty: cfg.label,
      difficultyId,
      genre: genre.id,
      suspects,
      clues: startClues.map(strip),
      scene: { roomTitle, sceneTheme: genre.sceneTheme, hotspots },
    },
    secret: {
      culprit,
      motive,
      method,
      personas,
      clues: Object.fromEntries(hiddenClues.map((c) => [c.id, strip(c)])),
      unlockRules: rules,
      hints,
      scoring: { culprit: 50, method: 25, motive: 25, hintPenalty: 5 },
      solutionExplain,
      contradictions,
    },
  };
}

// ---------- 생성 ----------
const parseList = (value, fallback) => {
  const arr = String(value || "").split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : fallback;
};

/** @returns {Promise<{ id: string, public: object, secret: object, model: string }>} */
export async function generateCase({ genreId, difficultyId }) {
  const genre = resolveGenre(genreId);
  if (!genre) throw new GeminiError("BAD_REQUEST", "알 수 없는 장르입니다.");
  if (!DIFFICULTY_RULES[difficultyId]) throw new GeminiError("BAD_REQUEST", "알 수 없는 난이도입니다.");

  const { data, model } = await generateStructured({
    models: parseList(process.env.GEMINI_CASE_MODELS, CHAT_MODELS),
    systemInstruction: buildSystemInstruction(),
    history: [],
    message: buildPrompt({ genre, difficultyId }),
    schema: CASE_SCHEMA,
    validate: (d) => {
      try {
        return validateGeneratedCase(d, { genre, difficultyId });
      } catch (e) {
        console.warn("[generate]", e?.message);
        throw e;
      }
    },
    options: {
      temperature: 0.9,
      maxOutputTokens: 16000,
      maxMessageChars: 8000,
      perAttemptTimeoutMs: 50000, // 한 번에 충분한 시간을 준다 (Vercel 제한 60초)
      totalBudgetMs: 56000,
    },
  });

  const { warnings, ...caseData } = data;
  if (warnings.length) console.warn(`[generate] ${genre.id}/${difficultyId} 보정: ${warnings.join(", ")}`);
  return { id: `gen-${crypto.randomBytes(5).toString("hex")}`, ...caseData, model };
}
