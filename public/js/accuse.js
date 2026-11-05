import { api } from "./api.js";
import { toast } from "./ui.js";

export function setupAccuse({ openBtn, dialog, form, suspectsEl, submitBtn, getContext }) {
  openBtn.addEventListener("click", () => {
    const { case: c } = getContext();
    suspectsEl.replaceChildren(
      ...c.suspects.map((s) => {
        const label = document.createElement("label");
        label.className = "radio-row";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "suspect";
        input.value = s.id;
        label.append(input, `${s.name} (${s.role})`);
        return label;
      })
    );
    dialog.showModal();
  });

  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const suspectId = fd.get("suspect");
    if (!suspectId) return toast("범인을 선택하세요.");
    if (!confirm("제출하면 사건이 종료됩니다. 계속할까요?")) return;

    const { sessionId, case: c } = getContext();
    submitBtn.disabled = true;
    try {
      const res = await api.accuse({
        sessionId,
        suspectId,
        motive: String(fd.get("motive") || "").trim(),
        method: String(fd.get("method") || "").trim(),
      });
      sessionStorage.setItem("lastResult", JSON.stringify({ ...res, caseTitle: c.title }));
      location.href = "result.html";
    } catch (err) {
      toast(err.message);
      submitBtn.disabled = false;
    }
  });
}
