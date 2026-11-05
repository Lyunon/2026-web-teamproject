export function renderClues(listEl, clues, newIds = []) {
  if (!clues.length) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "아직 단서가 없습니다.";
    listEl.replaceChildren(li);
    return;
  }
  listEl.replaceChildren(
    ...clues.map((c) => {
      const isNew = newIds.includes(c.id);
      const li = document.createElement("li");
      li.className = "clue" + (isNew ? " is-new" : "");
      const d = document.createElement("details");
      d.open = isNew;
      const s = document.createElement("summary");
      s.textContent = c.title;
      const loc = document.createElement("span");
      loc.className = "clue-loc";
      loc.textContent = c.location;
      const p = document.createElement("p");
      p.textContent = c.text;
      d.append(s, loc, p);
      li.append(d);
      return li;
    })
  );
}
