// 사건 생성기 검증 테스트 (Gemini 호출 없음). 실행: npm run test:generate
import test from "node:test";
import assert from "node:assert/strict";

process.env.CASE_TOKEN_SECRET = "test-secret";

const { validateGeneratedCase, buildPrompt, resolveGenre } = await import("../api/_lib/caseGenerator.js");
const { DIFFICULTY_RULES, DIFFICULTY_IDS } = await import("../api/_lib/difficulty.js");
const { sealCase, openCase } = await import("../api/_lib/caseToken.js");
const { loadCase } = await import("../api/_lib/caseStore.js");
const { buildSystemInstruction } = await import("../api/_lib/prompt.js");
const { GENRES } = await import("../public/js/genres.js");
const { makeRaw } = await import("./fixtures.mjs");

const genre = resolveGenre("mansion");

for (const id of DIFFICULTY_IDS) {
  test(`${id}: 규칙을 만족하는 사건은 통과하고 현장 배치가 만들어진다`, () => {
    const out = validateGeneratedCase(makeRaw(id), { genre, difficultyId: id });
    assert.equal(out.public.suspects.length, DIFFICULTY_RULES[id].suspects);
    assert.equal(out.public.difficultyId, id);
    const { hotspots, sceneTheme } = out.public.scene;
    assert.equal(sceneTheme, "mansion_study");
    const starts = hotspots.filter((h) => h.mode === "clue").length;
    assert.equal(starts, out.public.clues.length);
    const xy = new Set(hotspots.map((h) => `${h.x},${h.y}`));
    assert.equal(xy.size, hotspots.length, "오브젝트 자리가 겹치면 안 됨");
    // 정답 관련 필드는 공개 영역에 없어야 한다
    assert.equal(JSON.stringify(out.public).includes("culprit"), false);
    assert.equal(JSON.stringify(out.public).includes(out.secret.motive), false);
  });
}

test("난이도가 올라갈수록 요구 수치가 단조 증가한다", () => {
  const keys = ["suspects", "redHerrings", "contradictions", "innocentLiars", "chainDepth", "gatedRules"];
  for (const k of keys) {
    const v = DIFFICULTY_IDS.map((id) => DIFFICULTY_RULES[id][k]);
    for (let i = 1; i < v.length; i++) assert.ok(v[i] >= v[i - 1], `${k}: ${v}`);
    assert.ok(v[3] > v[0], `${k} 쉬움<매우어려움`);
  }
});

test("기준을 못 맞춘 사건은 버리지 않고 경고만 남긴다", () => {
  const out = validateGeneratedCase(makeRaw("easy"), { genre, difficultyId: "expert" });
  assert.ok(out.warnings.length > 0);
  assert.equal(out.public.suspects.length, 3);
});

test("고칠 수 있는 오류는 서버가 고친다", () => {
  const fix = (mut, id = "hard") => {
    const raw = makeRaw(id);
    mut(raw);
    return validateGeneratedCase(raw, { genre, difficultyId: id });
  };
  const reachableAll = (out) => {
    const start = new Set(out.public.clues.map((c) => c.id));
    const got = new Set(start);
    let grew = true;
    while (grew) {
      grew = false;
      for (const r of out.secret.unlockRules) {
        const deps = [...(r.requires || []), ...(r.type === "show" ? [r.clue] : [])];
        if (!got.has(r.clueId) && deps.every((d) => got.has(d))) { got.add(r.clueId); grew = true; }
      }
    }
    return Object.keys(out.secret.clues).every((id) => got.has(id));
  };

  // 범인을 이름으로 적음 → 아이디로 바꾼다
  assert.equal(fix((r) => { r.culprit = r.suspects[0].name; }).secret.culprit, "person0");
  // 잘못된 용의자 아이디 → 새 아이디를 주고 참조도 따라간다
  let out = fix((r) => { r.suspects[0].id = "Mr. Kim!"; r.culprit = "Mr. Kim!"; });
  assert.ok(/^[a-z][a-z0-9_]+$/.test(out.secret.culprit));
  assert.ok(out.public.suspects.some((s) => s.id === out.secret.culprit));
  // 규칙 누락 → 현장 조사 규칙을 만든다
  out = fix((r) => { r.unlockRules.pop(); });
  assert.equal(out.secret.unlockRules.length, Object.keys(out.secret.clues).length);
  // 순환 의존 → 끊어서 모두 도달 가능
  out = fix((r) => { r.unlockRules[0].requires = [r.hiddenClues.at(-1).id]; });
  assert.ok(reachableAll(out));
  // 결정적 증거 지정 오류 → 숨은 단서 중 하나로 정한다
  out = fix((r) => { r.decisiveClueId = "c01"; });
  assert.equal(Object.values(out.secret.clues).filter((c) => c.role === "결정적 증거").length, 1);
  // 키워드 부족한 ask, 잘못된 target → 조사 규칙으로 바꾸거나 아이디를 정리
  out = fix((r) => {
    r.unlockRules.find((u) => u.type === "ask").keywords = [];
    r.unlockRules.find((u) => u.type === "investigate").target = "Bad Target!";
  });
  assert.ok(out.secret.unlockRules.every((u) => u.type !== "investigate" || /^[a-z][a-z0-9_]+$/.test(u.target)));
  // 힌트 부족 → 기본 힌트로 채운다
  assert.equal(fix((r) => { r.hints = ["하나"]; }).secret.hints.length, 3);
  // 단서 아이디가 제멋대로여도 c01 부터 다시 매기고 모두 도달 가능
  out = fix((r) => {
    const ren = (id) => `clue-${id}`;
    r.startClues.forEach((c) => { c.id = ren(c.id); });
    r.hiddenClues.forEach((c) => { c.id = ren(c.id); });
    r.unlockRules.forEach((u) => {
      u.clueId = ren(u.clueId);
      if (u.requires) u.requires = u.requires.map(ren);
      if (u.clue) u.clue = ren(u.clue);
    });
    r.decisiveClueId = ren(r.decisiveClueId);
  });
  assert.ok(Object.keys(out.secret.clues).every((id) => /^c\d{2}$/.test(id)));
  assert.ok(reachableAll(out));
  // 현장 오브젝트가 자리보다 많으면 일부를 단서 제시 규칙으로 바꾼다
  out = fix((r) => { r.unlockRules.forEach((u) => { u.type = "investigate"; u.target = `t_${u.clueId}`; delete u.requires; }); }, "expert");
  assert.ok(out.public.scene.hotspots.length <= 14);
  assert.ok(reachableAll(out));
});

test("게임이 성립하지 않는 사건은 다시 만들게 한다", () => {
  const run = (mut) => {
    const raw = makeRaw("normal");
    mut(raw);
    return () => validateGeneratedCase(raw, { genre, difficultyId: "normal" });
  };
  assert.throws(run((r) => { r.culprit = "nobody"; }), /culprit/);
  assert.throws(run((r) => { r.suspects = r.suspects.slice(0, 2); }), /용의자/);
  assert.throws(run((r) => { r.hiddenClues = r.hiddenClues.slice(0, 2); }), /숨은 단서/);
  assert.throws(run((r) => { r.startClues = []; }), /시작 단서/);
  assert.throws(run((r) => { r.intro = ""; }), /소개/);
});

test("프롬프트에 난이도 수치와 장르가 들어간다", () => {
  for (const id of DIFFICULTY_IDS) {
    const p = buildPrompt({ genre: GENRES[1], difficultyId: id });
    const cfg = DIFFICULTY_RULES[id];
    assert.ok(p.includes(`정확히 ${cfg.suspects}명`));
    assert.ok(p.includes("미술관 도난"));
    assert.ok(p.includes(`최소 ${cfg.chainDepth}단계`));
  }
});

test("caseToken: 되돌리면 같은 사건이고, 변조하면 거부된다", () => {
  const out = validateGeneratedCase(makeRaw("normal"), { genre, difficultyId: "normal" });
  const data = { id: "gen-abc1234567", public: out.public, secret: out.secret };
  const token = sealCase(data);
  assert.deepEqual(openCase(token), data);
  assert.equal(token.includes(out.secret.motive), false, "토큰에 평문이 보이면 안 됨");
  const tampered = token.slice(0, 40) + (token[40] === "A" ? "B" : "A") + token.slice(41);
  assert.throws(() => openCase(tampered), /올바르지 않/);
  assert.throws(() => openCase(""), /올바르지 않/);
  assert.throws(() => openCase(undefined), /올바르지 않/);
});

test("loadCase: gen- 사건은 토큰이 필요하고 id 가 일치해야 한다", () => {
  const out = validateGeneratedCase(makeRaw("easy"), { genre, difficultyId: "easy" });
  const token = sealCase({ id: "gen-aaaaaaaaaa", public: out.public, secret: out.secret });
  const c = loadCase("gen-aaaaaaaaaa", token);
  assert.equal(c.casePublic.title, "테스트 사건");
  assert.ok(c.clueMap.c01);
  assert.throws(() => loadCase("gen-aaaaaaaaaa"), /올바르지 않/);
  assert.throws(() => loadCase("gen-bbbbbbbbbb", token), /올바르지 않/); // 다른 사건 id 로 재사용 불가
  assert.equal(loadCase("mansion-001").casePublic.title, "송림 저택의 마지막 밤"); // 기존 사건은 그대로
});

test("prompt: 난이도별 심문 태도가 붙고 기존 사건(보통)은 바뀌지 않는다", () => {
  const out = validateGeneratedCase(makeRaw("expert"), { genre, difficultyId: "expert" });
  const base = { casePublic: out.public, caseSecret: out.secret, suspectId: "person1", unlocked: ["c01"] };
  assert.match(buildSystemInstruction(base), /심문 난이도: 매우어려움/);
  const old = loadCase("mansion-001");
  const text = buildSystemInstruction({ casePublic: old.casePublic, caseSecret: old.caseSecret, suspectId: "butler", unlocked: ["c01"] });
  assert.equal(text.includes("심문 난이도"), false);
});

// ---- API 핸들러 (가짜 req/res)
async function call(handlerPath, body) {
  const mod = await import(handlerPath);
  let status = 200;
  let payload;
  const res = {
    setHeader() {},
    status(c) { status = c; return res; },
    json(o) { payload = o; return res; },
  };
  await mod.default({ method: "POST", body, query: {} }, res);
  return { status, payload };
}

test("API: 로그인 없이는 거부한다 (생성 사건 포함)", async () => {
  const out = validateGeneratedCase(makeRaw("normal"), { genre, difficultyId: "normal" });
  const id = "gen-cccccccccc";
  const caseToken = sealCase({ id, public: out.public, secret: out.secret });
  for (const name of ["start", "ask", "hint", "investigate", "accuse"]) {
    const r = await call(`../api/${name}.js`, { caseId: id, caseToken });
    assert.equal(r.status, 401, name);
  }
  const g = await call("../api/generate.js", { genre: "random", difficulty: "easy" });
  assert.equal(g.status, 401, "generate"); // Gemini 호출 전에 막힌다
});

test("API generate: 잘못된 장르·난이도는 Gemini 호출 전에 거부한다", async () => {
  const a = await call("../api/generate.js", { genre: "space", difficulty: "easy" });
  assert.equal(a.status, 400);
  const b = await call("../api/generate.js", { genre: "mansion", difficulty: "impossible" });
  assert.equal(b.status, 400);
  const c = await call("../api/generate.js", { genre: "mansion", difficulty: "__proto__" });
  assert.equal(c.status, 400);
});
