import { signInWithToken } from "./firebase.js";

const msg = document.getElementById("msg");
const token = new URLSearchParams(location.hash.slice(1)).get("token");

// 주소창과 히스토리에서 토큰 제거
history.replaceState(null, "", location.pathname);

if (!token) {
  msg.textContent = "로그인 정보가 없습니다. 처음부터 다시 시도해 주세요.";
} else {
  try {
    await signInWithToken(token);
    location.replace("cases.html");
  } catch (err) {
    msg.textContent = "로그인에 실패했습니다. 다시 시도해 주세요.";
  }
}
