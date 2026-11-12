// 로그인 화면. 기존 목업 index.js 를 대체한다.
// index.html 의 script 태그는 type="module" 이어야 한다.
import { isConfigured, waitForUser, signInWithGoogle } from "./auth.js";

const $ = (id) => document.getElementById(id);
const googleBtn = $("btn-login-google");
const naverBtn = $("btn-login-naver");

function say(msg) {
  const el = $("login-message");
  if (el) el.textContent = msg;
  else alert(msg);
}

const ERRORS = {
  "auth/popup-closed-by-user": "로그인 창이 닫혔습니다.",
  "auth/cancelled-popup-request": "로그인 창이 이미 열려 있습니다.",
  "auth/popup-blocked": "브라우저가 팝업을 막았습니다. 팝업을 허용해 주세요.",
  "auth/unauthorized-domain": "승인되지 않은 도메인입니다. localhost 주소로 접속했는지, Firebase 승인된 도메인에 등록했는지 확인하세요.",
  "auth/operation-not-allowed": "Firebase 콘솔에서 Google 로그인을 사용 설정해야 합니다.",
};

// 이미 로그인된 상태면 바로 사건 목록으로 보낸다.
if (isConfigured) {
  const user = await waitForUser();
  if (user) location.replace("./cases.html");
}

googleBtn?.addEventListener("click", async () => {
  if (!isConfigured) { location.href = "./cases.html"; return; } // 목업 모드
  googleBtn.disabled = true;
  try {
    await signInWithGoogle();
    location.href = "./cases.html";
  } catch (err) {
    console.error(err);
    say(ERRORS[err.code] || "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    googleBtn.disabled = false;
  }
});

naverBtn?.addEventListener("click", () => {
  say("네이버 로그인은 준비 중입니다.");
});