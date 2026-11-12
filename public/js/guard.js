// 로그인이 필요한 페이지(cases / play / result)에서 다른 스크립트보다 먼저 불러온다.
//   <script type="module" src="./js/guard.js"></script>
// 다른 스크립트는 `await window.authReady` 로 로그인한 사용자를 받는다.
import { isConfigured, waitForUser, signOutUser } from "./auth.js";

const MOCK_USER = { uid: "dev", displayName: "개발 모드", getIdToken: async () => null };

window.authReady = (async () => {
  if (!isConfigured) return MOCK_USER; // Firebase 설정 전에는 로그인 없이 통과
  const user = await waitForUser();
  if (!user) {
    location.replace("./index.html");
    return new Promise(() => {}); // 이동하는 동안 뒤 스크립트가 진행되지 않게 멈춘다.
  }
  return user;
})();

// 헤더에 id="btn-logout" 버튼이 있으면 로그아웃을 연결한다.
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await signOutUser();
    location.replace("./index.html");
  });
});