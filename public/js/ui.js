import { logout } from "./firebase.js";

export function mountHeader(user) {
  const area = document.getElementById("user-area");
  if (!area) return;
  const name = document.createElement("span");
  name.textContent = user.displayName || "탐정";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-ghost";
  btn.textContent = "로그아웃";
  btn.addEventListener("click", async () => {
    await logout();
    location.href = "index.html";
  });
  area.replaceChildren(name, btn);
}

let box;
export function toast(message, ms = 3000) {
  if (!box) {
    box = document.createElement("div");
    box.className = "toast-box";
    document.body.append(box);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message; // textContent: AI 응답 등이 HTML로 해석되지 않도록
  box.append(t);
  setTimeout(() => t.remove(), ms);
}
