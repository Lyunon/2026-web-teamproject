import { watchAuth, loginGoogle, loginNaver } from "./firebase.js";

const msg = document.getElementById("msg");
const buttons = [document.getElementById("btn-google"), document.getElementById("btn-naver")];

// 이미 로그인되어 있으면 바로 사건 목록으로
watchAuth((user) => { if (user) location.replace("cases.html"); });

async function handle(login) {
  msg.textContent = "";
  buttons.forEach((b) => (b.disabled = true));
  try {
    await login();
    location.href = "cases.html";
  } catch (err) {
    msg.textContent = friendly(err);
    buttons.forEach((b) => (b.disabled = false));
  }
}

function friendly(err) {
  switch (err.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "로그인 창이 닫혔습니다. 다시 시도해 주세요.";
    case "auth/popup-blocked":
      return "팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.";
    case "auth/unauthorized-domain":
      return "승인되지 않은 도메인입니다. Firebase 승인된 도메인을 확인하세요.";
    default:
      return err.message || "로그인에 실패했습니다.";
  }
}

document.getElementById("btn-google").addEventListener("click", () => handle(loginGoogle));
document.getElementById("btn-naver").addEventListener("click", () => handle(loginNaver));
