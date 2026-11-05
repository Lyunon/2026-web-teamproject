import { requireUser } from "./firebase.js";
import { api } from "./api.js";
import { mountHeader, toast } from "./ui.js";

const listEl = document.getElementById("case-list");

const user = await requireUser();
mountHeader(user);

try {
  const cases = await api.listCases();
  if (!cases.length) {
    listEl.textContent = "공개된 사건이 없습니다.";
  } else {
    listEl.replaceChildren(
      ...cases.map((c) => {
        const li = document.createElement("li");
        li.className = "card case-card";

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = c.difficulty;

        const h2 = document.createElement("h2");
        h2.textContent = c.title;

        const p = document.createElement("p");
        p.textContent = c.summary;

        const a = document.createElement("a");
        a.className = "btn btn-primary";
        a.href = `play.html?case=${encodeURIComponent(c.id)}`;
        a.textContent = "수사 시작";

        li.append(badge, h2, p, a);
        return li;
      })
    );
  }
} catch (err) {
  toast(err.message);
}
