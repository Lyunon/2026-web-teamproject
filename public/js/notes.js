export function mountNotes(textarea, sessionId) {
  const key = `notes:${sessionId}`;
  textarea.value = localStorage.getItem(key) || "";
  let timer;
  textarea.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => localStorage.setItem(key, textarea.value), 300);
  });
}
