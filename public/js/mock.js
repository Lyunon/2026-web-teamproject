// 개발용 가짜 백엔드. USE_MOCK=true일 때만 로드됩니다.
// 내용은 전부 임시 예시입니다.

const CASES = [
  {
    id: "case001",
    title: "폭풍우 치던 밤의 저택",
    difficulty: "쉬움",
    summary: "저택의 주인이 서재에서 숨진 채 발견되었다. 용의자는 세 명.",
    intro:
      "폭풍우가 몰아치던 밤, 저택의 주인 한도윤이 서재에서 숨진 채 발견되었습니다. " +
      "저택에는 비서, 집사, 조카가 있었습니다. 단서를 모으고 용의자를 심문해 범인을 찾아내세요.",
    suspects: [
      { id: "s1", name: "윤세라", role: "개인 비서" },
      { id: "s2", name: "박태진", role: "집사" },
      { id: "s3", name: "최하나", role: "조카" },
    ],
    locations: ["서재", "정원", "주방"],
  },
];

const CLUES = {
  c1: { id: "c1", title: "깨진 찻잔", location: "서재", text: "서재 바닥에 깨진 찻잔. 남은 찻물에서 쓴 냄새가 난다." },
  c2: { id: "c2", title: "정원의 발자국", location: "정원", text: "정원 창가의 발자국은 건물 안쪽으로 이어지지 않는다. 외부 침입은 아닌 듯하다." },
  c3: { id: "c3", title: "라벨 없는 약병", location: "주방", text: "주방 선반 안쪽에 라벨이 뜯긴 약병이 숨겨져 있다." },
  c4: { id: "c4", title: "수정된 유언장", location: "집사 증언", text: "일주일 전 수정된 유언장에서 집사의 퇴직금 항목이 삭제되어 있다." },
  c5: { id: "c5", title: "비서의 알리바이", location: "비서 증언", text: "윤세라는 사건 시각에 서재 밖 복도 CCTV에 찍혀 있다." },
};
const INITIAL = ["c1"];

const INVESTIGATE = {
  서재: { desc: "책상 위에 서류가 흐트러져 있다. 새로 발견한 것은 없다.", unlock: [] },
  정원: { desc: "창가 아래 진흙 발자국을 발견했다.", unlock: ["c2"] },
  주방: { desc: "선반 안쪽을 뒤지자 약병이 나왔다.", unlock: ["c3"] },
};

const REPLIES = {
  s1: "저는 그날 서류 정리만 했습니다. 더 궁금하신 게 있나요?",
  s2: "저는 집사로서 맡은 일을 했을 뿐입니다.",
  s3: "삼촌이 돌아가시다니… 아직도 믿기지 않아요.",
};
const TRIGGERS = [
  { suspectId: "s2", keyword: "유언장", unlock: "c4", reply: "…유언장 말입니까. 저는 그런 건 모릅니다." },
  { suspectId: "s1", keyword: "알리바이", unlock: "c5", reply: "저는 복도에 있었어요. CCTV를 확인해 보세요." },
];
const HINTS = [
  "찻잔과 약병의 관계를 생각해 보세요.",
  "유언장 변경으로 이득 또는 손해를 본 사람은 누구일까요?",
  "주방에 드나들 수 있는 사람은 한정되어 있습니다.",
];
const CULPRIT = "s2";
const EXPLANATION =
  "범인은 집사 박태진입니다. 유언장 수정으로 퇴직금이 사라지자 앙심을 품고, " +
  "주방의 약품을 찻잔에 넣어 주인에게 건넸습니다. (임시 해설)";

// ---------- 내부 헬퍼 ----------
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const skey = (sid) => `mock:session:${sid}`;
const load = (sid) => JSON.parse(localStorage.getItem(skey(sid)) || "null");
const save = (s) => localStorage.setItem(skey(s.sessionId), JSON.stringify(s));
const publicCase = ({ id, title, intro, suspects, locations }) => ({ id, title, intro, suspects, locations });

function sessionView(s, c) {
  return {
    sessionId: s.sessionId,
    case: publicCase(c),
    clues: s.unlocked.map((id) => CLUES[id]),
    hintCount: s.hintCount,
    messages: s.messages,
  };
}

function needSession(sid) {
  const s = load(sid);
  if (!s) throw new Error("세션을 찾을 수 없습니다.");
  if (s.status !== "playing") throw new Error("이미 종료된 사건입니다.");
  return { s, c: CASES.find((x) => x.id === s.caseId) };
}

function unlock(s, clueId, out) {
  if (!s.unlocked.includes(clueId)) {
    s.unlocked.push(clueId);
    out.push(CLUES[clueId]);
  }
}

// ---------- 엔드포인트 ----------
export async function handle(path, body = {}) {
  await delay();

  switch (path) {
    case "/api/cases":
      return CASES.map(({ id, title, difficulty, summary }) => ({ id, title, difficulty, summary }));

    case "/api/session/start": {
      const c = CASES.find((x) => x.id === body.caseId);
      if (!c) throw new Error("존재하지 않는 사건입니다.");
      const sid = `mock-${c.id}`;
      let s = load(sid);
      if (!s || s.status !== "playing") {
        s = { sessionId: sid, caseId: c.id, status: "playing", unlocked: [...INITIAL], hintCount: 0, messages: {} };
        save(s);
      }
      return sessionView(s, c);
    }

    case "/api/interrogate": {
      const { s, c } = needSession(body.sessionId);
      const text = String(body.message || "").trim();
      if (!text) throw new Error("질문을 입력하세요.");
      if (text.length > 300) throw new Error("질문은 300자 이내로 입력하세요.");
      if (!c.suspects.some((x) => x.id === body.suspectId)) throw new Error("알 수 없는 용의자입니다.");

      const newly = [];
      const trig = TRIGGERS.find((t) => t.suspectId === body.suspectId && text.includes(t.keyword));
      const reply = trig ? trig.reply : REPLIES[body.suspectId];
      if (trig) unlock(s, trig.unlock, newly);
      const emotion = trig ? "긴장" : "평온";

      (s.messages[body.suspectId] ||= []).push({ role: "user", text }, { role: "model", text: reply, emotion });
      save(s);
      return { reply, emotion, newlyUnlockedClues: newly };
    }

    case "/api/investigate": {
      const { s } = needSession(body.sessionId);
      const spot = INVESTIGATE[body.location];
      if (!spot) throw new Error("조사할 수 없는 장소입니다.");
      const newly = [];
      spot.unlock.forEach((id) => unlock(s, id, newly));
      save(s);
      return { description: spot.desc, newlyUnlockedClues: newly };
    }

    case "/api/hint": {
      const { s } = needSession(body.sessionId);
      if (s.hintCount >= HINTS.length) throw new Error("더 이상 힌트가 없습니다.");
      const hint = HINTS[s.hintCount++];
      save(s);
      return { hint, hintCount: s.hintCount };
    }

    case "/api/accuse": {
      const { s, c } = needSession(body.sessionId);
      const correct = body.suspectId === CULPRIT;
      const score = correct ? Math.max(100 - s.hintCount * 10, 10) : 0;
      s.status = correct ? "solved" : "failed";
      save(s);
      return {
        correct,
        score,
        culpritName: c.suspects.find((x) => x.id === CULPRIT).name,
        explanation: EXPLANATION,
      };
    }

    default:
      throw new Error(`알 수 없는 요청: ${path}`);
  }
}
