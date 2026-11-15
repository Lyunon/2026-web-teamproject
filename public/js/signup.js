import { waitForUser, signOutUser } from "./auth.js";
import { getProfile, createProfile, hasProfile } from "./profile.js";
import { validateNickname } from "./profile-validation.js";
import { authErrorMessage } from "./auth-errors.js";
const form = document.getElementById("signup-form");
const fields = document.getElementById("signup-fields");
const input = document.getElementById("nickname");
const message = document.getElementById("signup-message");
const retry = document.getElementById("btn-signup-retry");
const switchAccount = document.getElementById("btn-change-account");
let user;
async function init() {
  fields.disabled = true;
  retry.hidden = true;
  message.textContent = "계정을 확인하고 있어요…";
  try {
    user = await waitForUser();
    if (!user) { location.replace("./index.html"); return; }
    if (hasProfile(await getProfile(user))) { location.replace("./cases.html"); return; }
    message.textContent = "";
    fields.disabled = false;
    input.focus();
  } catch (error) {
    console.error("가입 화면 준비 실패", error);
    message.textContent = authErrorMessage(error);
    retry.hidden = false;
  }
}
input.addEventListener("input", () => input.removeAttribute("aria-invalid"));
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user || fields.disabled) return;
  let nickname;
  try { nickname = validateNickname(input.value); }
  catch (error) {
    message.textContent = error.message;
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  fields.disabled = true;
  switchAccount.disabled = true;
  message.textContent = "수사관 정보를 등록하고 있어요…";
  try {
    const currentUser = await waitForUser();
    if (!currentUser || currentUser.uid !== user.uid) { location.replace("./index.html"); return; }
    const profile = await createProfile(currentUser, nickname);
    if (!hasProfile(profile)) throw new Error("기존 회원 데이터 확인이 필요합니다.");
    location.replace("./cases.html");
  } catch (error) {
    console.error("회원가입 실패", error);
    message.textContent = authErrorMessage(error);
    fields.disabled = false;
    switchAccount.disabled = false;
  }
});
retry.addEventListener("click", init);
switchAccount.addEventListener("click", async () => {
  switchAccount.disabled = true;
  try { await signOutUser(); location.replace("./index.html"); }
  catch (error) { message.textContent = authErrorMessage(error); switchAccount.disabled = false; }
});
init();
