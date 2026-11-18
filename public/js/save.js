// 진행 상황 자동 저장 (Firestore: users/{uid}/saves/{caseId}).
// firebase-config.js 가 비어 있으면(목업 모드) 아무것도 하지 않는다. 이 브라우저의 localStorage 저장은 play.js 가 따로 한다.
// play.html 에서 guard.js 바로 다음, play.js 보다 앞에 <script type="module" src="./js/save.js"></script> 로 불러 window.cloudSave 를 만든다.
import { getFirebaseContext, isConfigured } from "./auth.js";

const FIRESTORE_SDK = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"; // auth.js·profile.js 와 같은 버전

const DEBOUNCE_MS = 3000;     // 변경 후 이 시간 동안 추가 변경이 없으면 한 번에 저장
const TIME_ONLY_MS = 60000;   // 경과 시간만 달라졌을 때는 이 간격 이상 지났을 때만 저장
const NET_TIMEOUT_MS = 5000;  // 불러오기·삭제가 이 시간을 넘기면 포기하고 진행
const MAX_LOG = 30;           // 용의자별로 남길 최근 대화 수 (문서 1MiB 제한 대비)

let ctx = null;          // { uid, caseId }
let stopped = false;     // 사건이 끝났거나 초기화된 뒤에는 더 저장하지 않는다
let loadFailed = false;  // 불러오기에 실패하면 기존 저장본을 덮어쓰지 않도록 이번 접속에서는 저장을 끈다
let timer = null;
let latest = null;       // 가장 최근 상태(정리된 것)
let lastKey = "";        // 마지막으로 저장하거나 불러온 내용(경과 시간 제외)
let lastWriteAt = 0;

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));

let dbPromise = null;
// Firestore 연결 { F, db }. 목업 모드면 null. profile.js 와 같은 Firebase 앱을 쓰므로 같은 인스턴스가 된다.
function getDb() {
  if (!isConfigured) return null;
  dbPromise ??= (async () => {
    const [{ app }, F] = await Promise.all([getFirebaseContext(), import(FIRESTORE_SDK)]);
    return { F, db: F.getFirestore(app) };
  })().catch((err) => { dbPromise = null; throw err; });
  return dbPromise;
}

// undefined·함수를 없애고, 대화는 용의자별 최근 MAX_LOG 개만 남긴다.
function clean(state) {
  const s = JSON.parse(JSON.stringify(state));
  for (const k of ["chatLogs", "apiHistory"]) {
    for (const id of Object.keys(s[k] || {})) {
      if (Array.isArray(s[k][id])) s[k][id] = s[k][id].slice(-MAX_LOG);
    }
  }
  return s;
}

const keyOf = (s) => {
  const { elapsedSeconds, ...rest } = s; // 시간은 비교에서 제외
  return JSON.stringify(rest);
};

const docRef = (h) => h.F.doc(h.db, "users", ctx.uid, "saves", ctx.caseId);

// 시간도 진행 상황: 단서를 누르지 않았어도 1분 대기와 감점 시간을 이어간다.
export function hasProgress(s) {
  if (!s) return false;
  const talked = Object.values(s.chatLogs || {}).some((a) => Array.isArray(a) && a.length > 0);
  return Number(s.elapsedSeconds) > 0 || talked || (s.investigated?.length || 0) > 0 || (Number(s.hintCount) || 0) > 0;
}

export function init(uid, caseId) {
  ctx = { uid, caseId };
  stopped = false;
}

// { savedAt, state } 또는 null
export async function load() {
  const p = getDb();
  if (!p || !ctx) return null;
  try {
    const h = await Promise.race([p, timeout(NET_TIMEOUT_MS)]);
    const snap = await Promise.race([h.F.getDoc(docRef(h)), timeout(NET_TIMEOUT_MS)]);
    if (!snap.exists()) return null;
    const d = snap.data();
    if (!d?.state) return null;
    lastKey = keyOf(d.state);
    lastWriteAt = Date.now();
    return { savedAt: Number(d.savedAt) || 0, state: d.state };
  } catch (err) {
    loadFailed = true;
    console.warn("[save] 저장본을 불러오지 못했습니다. 이번 접속에서는 클라우드 저장을 끕니다:", err.message);
    return null;
  }
}

// play.js 의 save() 가 호출한다. 실제 쓰기는 변경이 있을 때만, 3초 묶어서 한다.
export function schedule(state) {
  if (stopped || loadFailed || !ctx || !isConfigured) return;
  latest = clean(state);
  if (!hasProgress(latest)) return; // 아직 아무것도 안 했으면 저장하지 않는다
  const changed = keyOf(latest) !== lastKey;
  if (!changed && Date.now() - lastWriteAt < TIME_ONLY_MS) return;
  clearTimeout(timer);
  timer = setTimeout(flush, DEBOUNCE_MS);
}

// 지금 바로 저장. 창을 닫을 때도 불리지만 그 시점의 쓰기는 완료가 보장되지 않는다.
export async function flush(force = false) {
  clearTimeout(timer);
  timer = null;
  if (stopped || loadFailed || !ctx || !latest) return;
  const data = latest;
  const key = keyOf(data);
  if (!force && key === lastKey && Date.now() - lastWriteAt < TIME_ONLY_MS) return;
  if (!hasProgress(data)) return;
  try {
    const h = await getDb();
    if (stopped) return; // 기다리는 사이 초기화됐으면 쓰지 않는다
    await h.F.setDoc(docRef(h), { version: 1, savedAt: Date.now(), state: data });
    lastKey = key;
    lastWriteAt = Date.now();
  } catch (err) {
    console.warn("[save] 저장하지 못했습니다:", err.message);
  }
}

// 저장본 삭제. stop=true(기본)면 이후 저장도 막는다 (사건 종료, 처음부터 다시 시작 후 새로고침할 때).
// 새로고침 없이 바로 새 게임을 이어갈 때만 stop=false.
export async function clear(stop = true) {
  clearTimeout(timer);
  timer = null;
  latest = null;
  if (stop) stopped = true;
  lastKey = "";
  lastWriteAt = 0;
  const p = getDb();
  if (!p || !ctx) return;
  try {
    const h = await Promise.race([p, timeout(NET_TIMEOUT_MS)]);
    await Promise.race([h.F.deleteDoc(docRef(h)), timeout(NET_TIMEOUT_MS)]);
    loadFailed = false; // 삭제에 성공했으니 새로 저장해도 덮어쓸 기존본이 없다
  } catch (err) {
    console.warn("[save] 저장본을 지우지 못했습니다:", err.message);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush();
});
window.addEventListener("pagehide", () => { flush(); });

window.cloudSave = { init, load, schedule, flush, clear, hasProgress };
