// public/js/play.js - 사건 수첩(3단), 사건 현장, 용의자 심문(2단) 인터랙션

document.addEventListener('DOMContentLoaded', () => {
  const screens = {
    notebook: { el: document.getElementById('screen-notebook'), label: '사건 수첩' },
    scene: { el: document.getElementById('screen-scene'), label: '사건 현장' },
    interrogate: { el: document.getElementById('screen-interrogate'), label: '용의자 심문실' }
  };

  const badgeEl = document.getElementById('current-screen-badge');
  const collectedClues = new Set(['깨진 회중시계', '안에서 잠긴 서재 문고리']);
  let currentSuspect = '김비서';
  let currentSuspectRole = '수행비서';
  let selectedClueForChat = '';

  // 1. 3개 화면 전환 함수 (사건 수첩 / 사건 현장 / 용의자 심문)
  function switchScreen(targetKey) {
    if (!screens[targetKey]) return;

    Object.keys(screens).forEach((key) => {
      screens[key].el.classList.toggle('active', key === targetKey);
    });

    if (badgeEl) {
      badgeEl.textContent = `현재 화면: ${screens[targetKey].label}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-goto');
      switchScreen(target);
    });
  });

  // 2. [사건 수첩] 왼쪽(용의자/단서) 클릭 -> 가운데(상세 설명) 출력
  const detailBadge = document.getElementById('detail-badge');
  const detailTitle = document.getElementById('detail-title');
  const detailMeta = document.getElementById('detail-meta');
  const detailBody = document.getElementById('detail-body');

  function bindNotebookItemClick(buttonEl) {
    buttonEl.addEventListener('click', () => {
      document.querySelectorAll('#screen-notebook .selectable-item').forEach((item) => {
        item.classList.remove('selected');
      });
      buttonEl.classList.add('selected');

      detailBadge.textContent = buttonEl.getAttribute('data-type') || '상세 정보';
      detailTitle.textContent = buttonEl.getAttribute('data-title') || '';
      detailMeta.textContent = buttonEl.getAttribute('data-meta') || '';
      detailBody.textContent = buttonEl.getAttribute('data-desc') || '';
    });
  }

  document.querySelectorAll('#screen-notebook .selectable-item').forEach(bindNotebookItemClick);

  // 3. [사건 현장] 단서 수집 -> 사건 수첩 및 심문 단서 목록에 동시 추가
  const notebookClueList = document.getElementById('notebook-clue-list');
  const notebookClueCount = document.getElementById('notebook-clue-count');
  const interrogateClueList = document.getElementById('interrogate-clue-list');
  const sceneResultBox = document.getElementById('scene-inspection-result');

  document.querySelectorAll('.spot-card').forEach((spotBtn) => {
    spotBtn.addEventListener('click', () => {
      const title = spotBtn.getAttribute('data-clue-title');
      const sub = spotBtn.getAttribute('data-clue-sub');
      const meta = spotBtn.getAttribute('data-clue-meta');
      const desc = spotBtn.getAttribute('data-clue-desc');

      spotBtn.classList.add('investigated');
      const isNew = !collectedClues.has(title);

      if (isNew) {
        collectedClues.add(title);

        // (A) 사건 수첩 왼쪽 단서 목록에 추가
        const liNotebook = document.createElement('li');
        const btnNotebook = document.createElement('button');
        btnNotebook.type = 'button';
        btnNotebook.className = 'selectable-item';
        btnNotebook.setAttribute('data-type', '확보 단서');
        btnNotebook.setAttribute('data-title', title);
        btnNotebook.setAttribute('data-meta', meta);
        btnNotebook.setAttribute('data-desc', desc);
        btnNotebook.innerHTML = `
          <span>📌 <strong>${title}</strong></span>
          <span class="item-sub">${sub}</span>
        `;
        bindNotebookItemClick(btnNotebook);
        liNotebook.appendChild(btnNotebook);
        notebookClueList.appendChild(liNotebook);

        notebookClueCount.textContent = `${collectedClues.size}건`;

        // (B) 용의자 심문 화면 왼쪽 아래 '제시할 단서 목록'에 추가
        const liInterrogate = document.createElement('li');
        const btnInterrogate = document.createElement('button');
        btnInterrogate.type = 'button';
        btnInterrogate.className = 'selectable-item';
        btnInterrogate.setAttribute('data-present-clue', title);
        btnInterrogate.innerHTML = `
          <span>📌 ${title}</span>
          <span class="item-sub">${sub}</span>
        `;
        bindInterrogateClueClick(btnInterrogate);
        liInterrogate.appendChild(btnInterrogate);
        interrogateClueList.appendChild(liInterrogate);
      }

      sceneResultBox.innerHTML = `
        <p style="color: var(--accent); font-weight: 700; font-size: 1.05rem; margin-bottom: 8px;">
          [단서 ${isNew ? '신규 확보' : '재확인'}] ${title}
        </p>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">${meta}</p>
        <p>${desc}</p>
        <p style="margin-top: 16px; font-size: 0.85rem; color: var(--accent);">
          ✔ 사건 수첩의 단서 목록과 심문실의 제시할 단서 목록에 반영되었습니다.
        </p>
      `;
    });
  });

  // 4. [용의자 심문] 왼쪽 위 용의자 선택 & 왼쪽 아래 제시할 단서 선택 & 오른쪽 대화창
  const chatTargetName = document.getElementById('chat-target-name');
  const chatMessages = document.getElementById('chat-messages');
  const selectedClueIndicator = document.getElementById('selected-clue-indicator');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  // 용의자 선택 이벤트
  document.querySelectorAll('#interrogate-suspect-list .selectable-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#interrogate-suspect-list .selectable-item').forEach((item) => {
        item.classList.remove('selected');
      });
      btn.classList.add('selected');

      currentSuspect = btn.getAttribute('data-suspect-name');
      currentSuspectRole = btn.getAttribute('data-suspect-role');
      chatTargetName.textContent = `${currentSuspect} (${currentSuspectRole})`;

      chatMessages.innerHTML = `
        <div class="msg suspect">
          <strong>[${currentSuspect}]</strong><br />
          형사님, 저를 부르셨습니까? 무엇이든 물어보십시오.
        </div>
      `;
    });
  });

  // 제시할 단서 선택 이벤트
  function bindInterrogateClueClick(btn) {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#interrogate-clue-list .selectable-item').forEach((item) => {
        item.classList.remove('selected');
      });
      btn.classList.add('selected');

      selectedClueForChat = btn.getAttribute('data-present-clue') || '';
      selectedClueIndicator.textContent = selectedClueForChat
        ? `현재 선택된 제시 단서: 📌 ${selectedClueForChat}`
        : '현재 선택된 제시 단서: 없음 (일반 질문)';
    });
  }

  document.querySelectorAll('#interrogate-clue-list .selectable-item').forEach(bindInterrogateClueClick);

  // 질문 전송 이벤트 (추후 Gemini API /api/interrogate 연동 위치)
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const clueTag = selectedClueForChat ? `[단서 제시: ${selectedClueForChat}] ` : '';

    const myMsg = document.createElement('div');
    myMsg.className = 'msg detective';
    myMsg.textContent = `${clueTag}${text}`;
    chatMessages.appendChild(myMsg);

    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'msg suspect';
      reply.innerHTML = `
        <strong>[${currentSuspect}]</strong><br />
        ${selectedClueForChat ? `"${selectedClueForChat}"에 대해 물으시는 겁니까? ` : ''}그 부분에 대해서는 제 알리바이와 무관합니다. (추후 Gemini API 실시간 응답 연동)
      `;
      chatMessages.appendChild(reply);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 300);
  });
});
