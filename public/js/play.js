import { requireUser } from "./firebase.js";
import { api } from "./api.js";
import { getState, setState } from "./state.js";
import { mountHeader, toast } from "./ui.js";
import { createChat } from "./chat.js";
import { renderClues } from "./clues.js";
import { mountNotes } from "./notes.js";
import { setupAccuse } from "./accuse.js";

const $ = (id) => document.getElementById(id);

const user = await requireUser();
mountHeader(user);

const caseId = new URLSearchParams(location.search).get("case");
if (!caseId) location.replace("cases.html");

// ---------- 세션 시작 (진행 중이면 이어서) ----------
let data;
try {
  data = await api.startSession({ caseId });
} catch (err) {
  toast(err.message);
  throw err;
}
setState({
  sessionId: data.sessionId,
  case: data.case,
  clues: data.clues,
  hintCount: data.hintCount,
  messages: data.messages || {},
  suspectId: null,
});

const st = getState();
const suspectById = (id) => st.case.suspects.find((s) => s.id === id);

// ---------- 좌측: 개요 / 단서 / 노트 ----------
$("case-title").textContent = st.case.title;
$("case-intro").textContent = st.case.intro;
renderClues($("clue-list"), st.clues);
mountNotes($("notes"), st.sessionId);

function addClues(newClues = []) {
  if (!newClues.length) return;
  setState({ clues: [...getState().clues, ...newClues] });
  renderClues($("clue-list"), getState().clues, newClues.map((c) => c.id));
  toast(`새 단서: ${newClues.map((c) => c.title).join(", ")}`);
}

// ---------- 중앙: 채팅 ----------
const chat = createChat({
  logEl: $("chat-log"),
  formEl: $("chat-form"),
  inputEl: $("chat-input"),
  sendEl: $("chat-send"),
  onSend,
});
chat.render([], "", "오른쪽에서 심문할 용의자를 선택하세요.");

async function onSend(text) {
  const sid = getState().suspectId;
  if (!sid) return toast("먼저 용의자를 선택하세요.");
  const list = (getState().messages[sid] ||= []);

  const userMsg = { role: "user", text };
  list.push(userMsg);
  chat.append(userMsg);
  chat.setBusy(true);

  try {
    const r = await api.interrogate({ sessionId: getState().sessionId, suspectId: sid, message: text });
    const reply = { role: "model", text: r.reply, emotion: r.emotion };
    list.push(reply);
    // 응답을 기다리는 동안 다른 용의자로 바꿨다면 화면에는 붙이지 않음
    if (getState().suspectId === sid) chat.append(reply, suspectById(sid).name);
    addClues(r.newlyUnlockedClues);
  } catch (err) {
    toast(err.message);
  } finally {
    chat.setBusy(false);
    if (!getState().suspectId) chat.setEnabled(false);
  }
}

// ---------- 우측: 용의자 ----------
function selectSuspect(id) {
  setState({ suspectId: id });
  const s = suspectById(id);
  $("chat-title").textContent = s.name;
  $("chat-role").textContent = s.role;
  chat.render(getState().messages[id] || [], s.name);
  chat.setEnabled(true);
  $("chat-input").focus();
  document.querySelectorAll(".suspect-btn").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.id === id))
  );
}

$("suspect-list").replaceChildren(
  ...st.case.suspects.map((s) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "suspect-btn";
    b.dataset.id = s.id;
    b.setAttribute("aria-pressed", "false");
    b.textContent = s.name;
    const small = document.createElement("small");
    small.textContent = s.role;
    b.append(small);
    b.addEventListener("click", () => selectSuspect(s.id));
    li.append(b);
    return li;
  })
);

// ---------- 우측: 현장 조사 ----------
function addLog(listEl, text) {
  const li = document.createElement("li");
  li.textContent = text;
  listEl.prepend(li);
}

$("location-list").replaceChildren(
  ...st.case.locations.map((loc) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-ghost";
    b.textContent = loc;
    b.addEventListener("click", async () => {
      b.disabled = true;
      try {
        const r = await api.investigate({ sessionId: getState().sessionId, location: loc });
        addLog($("investigate-log"), `[${loc}] ${r.description}`);
        addClues(r.newlyUnlockedClues);
      } catch (err) {
        toast(err.message);
      } finally {
        b.disabled = false;
      }
    });
    return b;
  })
);

// ---------- 우측: 힌트 ----------
const renderHintCount = () => { $("hint-count").textContent = `(사용 ${getState().hintCount}회)`; };
renderHintCount();

$("btn-hint").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const r = await api.hint({ sessionId: getState().sessionId });
    setState({ hintCount: r.hintCount });
    renderHintCount();
    addLog($("hint-log"), r.hint);
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
  }
});

// ---------- 범인 지목 ----------
setupAccuse({
  openBtn: $("btn-accuse"),
  dialog: $("accuse-dialog"),
  form: $("accuse-form"),
  suspectsEl: $("accuse-suspects"),
  submitBtn: $("accuse-submit"),
  getContext: () => ({ sessionId: getState().sessionId, case: getState().case }),
});
