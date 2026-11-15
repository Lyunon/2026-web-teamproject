import { isConfigured, waitForUser, signInWithGoogle } from "./auth.js";
import { getProfile, hasProfile } from "./profile.js";
import { authErrorMessage } from "./auth-errors.js";
const button = document.getElementById("btn-login-google");
const message = document.getElementById("login-message");
async function continueAs(user) {
  const profile = await getProfile(user);
  location.replace(hasProfile(profile) ? "./cases.html" : "./signup.html");
}
button.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "구글 계정을 확인하고 있어요…";
  try {
    const user = await waitForUser();
    const signedIn = user || (await signInWithGoogle()).user;
    await continueAs(signedIn);
  } catch (error) {
    console.error("로그인/회원 조회 실패", error);
    message.textContent = authErrorMessage(error);
  } finally { button.disabled = false; }
});
async function init() {
  if (!isConfigured) {
    message.textContent = "로그인 서비스를 준비하고 있어요. 잠시 후 다시 방문해 주세요.";
    return;
  }
  try {
    const user = await waitForUser();
    if (user) await continueAs(user);
    else message.textContent = "";
  } catch (error) {
    console.error("회원 조회 실패", error);
    message.textContent = authErrorMessage(error);
  } finally { button.disabled = false; }
}
init();
