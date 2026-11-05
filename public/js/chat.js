// 채팅 UI. 모든 텍스트는 textContent로만 넣습니다. (AI 응답 XSS 방지)
export function createChat({ logEl, formEl, inputEl, sendEl, onSend }) {
  let typingEl = null;

  const scrollDown = () => { logEl.scrollTop = logEl.scrollHeight; };

  function bubble(m, name) {
    const el = document.createElement("div");
    el.className = `bubble ${m.role === "user" ? "bubble-user" : "bubble-model"}`;
    if (m.role !== "user" && name) {
      const n = document.createElement("strong");
      n.className = "bubble-name";
      n.textContent = name;
      if (m.emotion) {
        const e = document.createElement("span");
        e.className = "bubble-emotion";
        e.textContent = `(${m.emotion})`;
        n.append(e);
      }
      el.append(n);
    }
    const p = document.createElement("p");
    p.textContent = m.text;
    el.append(p);
    return el;
  }

  function render(messages, name, emptyText = "아직 대화가 없습니다. 질문을 던져 보세요.") {
    if (!messages.length) {
      const empty = document.createElement("p");
      empty.className = "chat-empty";
      empty.textContent = emptyText;
      logEl.replaceChildren(empty);
      return;
    }
    logEl.replaceChildren(...messages.map((m) => bubble(m, name)));
    scrollDown();
  }

  function append(m, name) {
    logEl.querySelector(".chat-empty")?.remove();
    logEl.append(bubble(m, name));
    scrollDown();
  }

  function setBusy(busy) {
    inputEl.disabled = busy;
    sendEl.disabled = busy;
    if (busy) {
      typingEl = document.createElement("div");
      typingEl.className = "typing";
      typingEl.textContent = "답변 중";
      logEl.append(typingEl);
      scrollDown();
    } else {
      typingEl?.remove();
      typingEl = null;
      inputEl.focus();
    }
  }

  function setEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendEl.disabled = !enabled;
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text || inputEl.disabled) return;
    inputEl.value = "";
    await onSend(text);
  });

  return { render, append, setBusy, setEnabled };
}
