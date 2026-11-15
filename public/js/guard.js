import { waitForUser, signOutUser } from "./auth.js";
import { getProfile, hasProfile } from "./profile.js";
import { authErrorMessage } from "./auth-errors.js";
// head의 module 스크립트에서 초기화하여 DOMContentLoaded 핸들러보다 먼저 준비한다.
window.authReady = (async () => {
  try {
    const user = await waitForUser();
    if (!user) { location.replace("./index.html"); return null; }
    const profile = await getProfile(user);
    if (!hasProfile(profile)) { location.replace("./signup.html"); return null; }
    window.playerProfile = profile;
    document.querySelectorAll("[data-player-name], #user-display").forEach((el) => {
      el.textContent = `접속 수사관: ${profile.nickname}`;
    });
    document.body.classList.remove("auth-pending");
    return user;
  } catch (error) {
    console.error("회원 확인 실패", error);
    const panel = document.createElement("section");
    panel.className = "login-card";
    const heading = document.createElement("h1");
    heading.textContent = "회원 정보를 확인하지 못했어요";
    const message = document.createElement("p");
    message.textContent = authErrorMessage(error);
    const retry = document.createElement("button");
    retry.className = "btn btn-primary";
    retry.textContent = "다시 확인하기";
    retry.addEventListener("click", () => location.reload());
    const back = document.createElement("a");
    back.className = "btn";
    back.href = "./index.html";
    back.textContent = "로그인 화면으로";
    panel.append(heading, message, retry, back);
    const main = document.querySelector("main");
    if (main) { main.className = "login-wrapper"; main.replaceChildren(panel); }
    document.body.classList.remove("auth-pending");
    return null;
  }
})();
// module 스크립트는 DOM 파싱 후 실행되므로 여기서 바로 연결한다.
document.getElementById("btn-logout")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try { await signOutUser(); location.replace("./index.html"); }
  catch (error) { alert(authErrorMessage(error)); button.disabled = false; }
});
