// public/js/play.js - 사건 수첩(3단), 사건 현장, 용의자 심문(2단) + 타이머/힌트/범인지목 모달 연동

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

  // =========================================================
  // 1. 실시간 사건 해결 타이머 (사건 시작 즉시 작동)
  // =========================================================
  const timerDisplay = document.getElementById('timer-display');
  let elapsedSeconds = 0;

  function formatTime(sec) {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  const timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(elapsedSeconds);
    }
  }, 1000);

  // =========================================================
  // 2. 힌트 사용 버튼 및 카운트 (점수 반영용)
  // =========================================================
  let hintCount = 0;
  const hintMessages = [
    '힌트 1: 사건 현장의 [발코니 창문]을 조사해 보세요. 온실 정원 흙자국이 남아 있습니다.',
    '힌트 2: 서재 책상 위 유언장 초안에서 상속인이 변경되려던 정황을 확인하세요.',
    '힌트 3: 온실 정원에 있었다고 주장한 [이조카]에게 창틀의 젖은 흙자국과 유언장 초안을 제시해 보세요.'
  ];

  const btnUseHint = document.getElementById('btn-use-hint');
  const hintCountDisplay = document.getElementById('hint-count-display');
  const hintModal = document.getElementById('hint-modal');
  const hintModalText = document.getElementById('hint-modal-text');
  const modalHintCount = document.getElementById('modal-hint-count');
  const btnCloseHint = document.getElementById('btn-close-hint');

  if (btnUseHint) {
    btnUseHint.addEventListener('click', () => {
      // 추후 /api/hint 엔드포인트 연동 위치
      const msg = hintMessages[Math.min(hintCount, hintMessages.length - 1)];
      hintCount += 1;
      hintCountDisplay.textContent = hintCount;
      modalHintCount.textContent = hintCount;
      hintModalText.textContent = msg;
      hintModal.classList.add('open');
    });
  }

  if (btnCloseHint) {
    btnCloseHint.addEventListener('click', () => {
      hintModal.classList.remove('open');
    });
  }

  // =========================================================
  // 3. 범인 지목하기 모달 및 결과 페이지(result.html) 이동
  // =========================================================
  const accuseModal = document.getElementById('accuse-modal');
  const btnOpenAccuse = document.getElementById('btn-open-accuse');
  const btnCancelAccuse = document.getElementById('btn-cancel-accuse');
  const accuseForm = document.getElementById('accuse-form');

  if (btnOpenAccuse) {
    btnOpenAccuse.addEventListener('click', () => {
      accuseModal.classList.add('open');
    });
  }

  if (btnCancelAccuse) {
    btnCancelAccuse.addEventListener('click', () => {
      accuseModal.classList.remove('open');
    });
  }

  if (accuseForm) {
    accuseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearInterval(timerInterval);

      const selectedRadio = accuseForm.querySelector('input[name="accused_suspect"]:checked');
      const accusedSuspect = selectedRadio ? selectedRadio.value : '김비서';
      const trueCulprit = '이조카';
      const isCorrect = accusedSuspect === trueCulprit;

      // 결과 페이지에서 읽을 수 있도록 localStorage 및 URL 파라미터로 전달
      const resultData = {
        caseTitle: '사건 #01 : 자정의 서재 밀실 사건',
        accusedSuspect,
        trueCulprit,
        isCorrect,
        elapsedSeconds,
        hintCount,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('last_case_result', JSON.stringify(resultData));

      const params = new URLSearchParams({
        suspect: accusedSuspect,
        correct: isCorrect ? '1' : '0',
        time: String(elapsedSeconds),
        hints: String(hintCount)
      });
      window.location.href = `./result.html?${params.toString()}`;
    });
  }

  // =========================================================
  // 4. 3개 화면 전환 함수 (사건 수첩 / 사건 현장 / 용의자 심문)
  // =========================================================
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

  // =========================================================
  // 5. [사건 수첩] 왼쪽(용의자/단서) 클릭 -> 가운데(상세 설명) 출력
  // =========================================================
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

  // =========================================================
  // 6. [사건 현장] 단서 수집 -> 사건 수첩 및 심문 단서 목록에 동시 추가
  // =========================================================
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

  // =========================================================
  // 7. [용의자 심문] 좌상 용의자 선택 + 좌하 제시할 단서 + 우측 대화창
  // =========================================================
  const chatTargetName = document.getElementById('chat-target-name');
  const chatMessages = document.getElementById('chat-messages');
  const selectedClueIndicator = document.getElementById('selected-clue-indicator');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

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
