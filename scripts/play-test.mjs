// 터미널에서 사건 1개를 직접 돌려 보는 테스트 스크립트.
// Firestore, 로그인, 프런트 없이 시드 JSON + Gemini만으로 동작한다.
// 실행: node --env-file=.env scripts/play-test.mjs
// 주의: 용의자에게 말을 걸 때마다 Gemini 요청이 1회 소모된다. (무료 티어 RPD 500)

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

import { generateSuspectReply } from "../api/_lib/gemini.js";
import { buildSystemInstruction, buildShownClueMessage } from "../api/_lib/prompt.js";
import {
  getClueMap,
  initialUnlocked,
  unlockByAsk,
  unlockByShow,
  unlockByInvestigate,
  investigateTargets,
  looksLikeConfession,
} from "../api/_lib/rules.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "data", "cases", "mansion-001.json"), "utf8")
);
const casePublic = data.public;
const caseSecret = data.secret;
const clueMap = getClueMap(casePublic, caseSecret);

// ---- 세션 상태 (메모리) ----
const unlocked = initialUnlocked(casePublic);
const histories = {}; // suspectId -> [{ role: "user" | "model", text }]
let current = null;
let hintCount = 0;

// gemini.js의 history 형식이 다르면 이 함수만 고치면 된다.
function toHistory(suspectId) {
  return (histories[suspectId] || []).slice(-12);
}

function suspectName(id) {
  return casePublic.suspects.find((s) => s.id === id)?.name ?? id;
}

function printClue(c) {
  console.log(`  [${c.id}] ${c.title} (${c.location})\n      ${c.text}`);
}

function addUnlocked(ids) {
  for (const id of ids) {
    if (unlocked.includes(id)) continue;
    unlocked.push(id);
    console.log("\n  ★ 새 단서 해금");
    printClue(clueMap[id]);
  }
}

function help() {
  console.log(`
명령어
  /suspects              용의자 목록
  /talk <id>             대화할 용의자 선택 (butler, secretary, son, wife, doctor)
  /clues                 확보한 단서 목록
  /show <단서id>          현재 용의자에게 단서 제시 (예: /show c05)
  /investigate <대상>     현장 조사 (${investigateTargets(caseSecret.unlockRules).join(", ")})
  /hint                  힌트 (횟수가 기록됨)
  /accuse <id>           범인 지목 (게임 종료)
  /help, /quit
그 외 입력은 현재 선택한 용의자에게 하는 질문입니다.
`);
}

async function say(text, shownClue) {
  const message = shownClue ? buildShownClueMessage(shownClue, text) : text;
  const systemInstruction = buildSystemInstruction({
    casePublic,
    caseSecret,
    suspectId: current,
    unlocked,
    shownClueId: shownClue?.id,
  });

  const r = await generateSuspectReply({
    systemInstruction,
    history: toHistory(current),
    message,
  });

  histories[current] ??= [];
  histories[current].push({ role: "user", text: message });
  histories[current].push({ role: "model", text: r.reply });

  console.log(`\n${suspectName(current)} (${r.emotion}): ${r.reply}`);
  if (current === caseSecret.culprit && looksLikeConfession(r.reply)) {
    console.log("\n  ⚠ 범인이 자백한 것처럼 보입니다. 프롬프트를 점검하세요.");
  }
}

const rl = readline.createInterface({ input, output });
console.log(`\n=== ${casePublic.title} ===\n${casePublic.intro}`);
console.log("\n처음 공개된 단서:");
casePublic.clues.forEach(printClue);
help();

while (true) {
  const label = current ? `${suspectName(current)}에게> ` : "> ";
  const line = (await rl.question(`\n${label}`)).trim();
  if (!line) continue;

  try {
    if (line === "/quit") break;
    if (line === "/help") { help(); continue; }

    if (line === "/suspects") {
      casePublic.suspects.forEach((s) =>
        console.log(`  ${s.id.padEnd(10)} ${s.name} (${s.role}) - ${s.publicBio}`)
      );
      continue;
    }

    if (line.startsWith("/talk")) {
      const id = line.split(/\s+/)[1];
      if (!casePublic.suspects.some((s) => s.id === id)) {
        console.log("  없는 용의자입니다. /suspects 로 id를 확인하세요.");
      } else {
        current = id;
        console.log(`  ${suspectName(id)}와(과) 마주 앉았다.`);
      }
      continue;
    }

    if (line === "/clues") {
      unlocked.forEach((id) => printClue(clueMap[id]));
      continue;
    }

    if (line.startsWith("/investigate")) {
      const target = line.split(/\s+/)[1];
      const res = unlockByInvestigate(caseSecret.unlockRules, { target, unlocked });
      if (res.status === "NOTHING") console.log("  조사할 만한 것이 없다.");
      else if (res.status === "ALREADY") console.log("  이미 확인한 곳이다.");
      else if (res.status === "LOCKED") console.log("  아직 열 이유가 없다.");
      else addUnlocked([res.clueId]);
      continue;
    }

    if (line.startsWith("/show")) {
      if (!current) { console.log("  먼저 /talk 로 용의자를 고르세요."); continue; }
      const clueId = line.split(/\s+/)[1];
      const res = unlockByShow(caseSecret.unlockRules, { suspectId: current, clueId, unlocked });
      if (!res.ok) { console.log("  가지고 있지 않은 단서입니다."); continue; }
      addUnlocked(res.newly);
      await say("", clueMap[clueId]);
      continue;
    }

    if (line === "/hint") {
      const hints = caseSecret.hints;
      const hint = hints[Math.min(hintCount, hints.length - 1)];
      hintCount += 1;
      console.log(`  힌트 ${hintCount}회 사용 (-${caseSecret.scoring.hintPenalty}점): ${hint}`);
      continue;
    }

    if (line.startsWith("/accuse")) {
      const id = line.split(/\s+/)[1];
      if (!casePublic.suspects.some((s) => s.id === id)) {
        console.log("  없는 용의자입니다.");
        continue;
      }
      const right = id === caseSecret.culprit;
      const penalty = hintCount * caseSecret.scoring.hintPenalty;
      console.log(right ? "\n  ✔ 정답입니다. 범인은 " + suspectName(id) + "입니다." : "\n  ✘ 틀렸습니다.");
      console.log(`  (이 테스트는 범인 지목만 채점합니다. 범인 점수 ${right ? caseSecret.scoring.culprit : 0}, 힌트 감점 -${penalty})`);
      console.log(`\n${caseSecret.solutionExplain}`);
      break;
    }

    if (line.startsWith("/")) { console.log("  알 수 없는 명령입니다. /help"); continue; }

    // 일반 질문
    if (!current) { console.log("  먼저 /talk <id> 로 용의자를 고르세요."); continue; }
    addUnlocked(unlockByAsk(caseSecret.unlockRules, { suspectId: current, message: line, unlocked }));
    await say(line, null);
  } catch (err) {
    console.log(`\n  오류: ${err?.code || err?.message || err}`);
  }
}

rl.close();