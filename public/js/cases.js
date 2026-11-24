// public/js/cases.js - 사건 목록, Gemini 사건 생성 팝업
// 생성된 사건은 서버가 봉인한 caseToken 과 함께 이 브라우저(localStorage, 계정별)에 저장한다.
// 정답은 토큰 안에 암호화되어 있어 브라우저에서 읽을 수 없다.
import { GENRES, RANDOM_GENRE, DIFFICULTIES, genreById, difficultyById } from './genres.js';

const MAX_SAVED = 8;           // 보관할 생성 사건 수
const REQUEST_TIMEOUT_MS = 75000;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await window.authReady;
  if (!user) return;

  const SAVE_KEY = `gen_cases_${user.uid}`; // play.js 도 같은 키로 읽는다
  const $ = (id) => document.getElementById(id);
  const episodeList = $('episode-list');
  const genBtn = $('btn-generate-episode');
  const modal = $('generate-modal');
  const form = $('generate-form');
  const statusBox = $('gen-status');
  const resultBox = $('gen-result');
  const stepForm = $('gen-step-form');
  const submitBtn = $('btn-gen-submit');
  const cancelBtn = $('btn-gen-cancel');
  const playLink = $('btn-gen-play');
  let busy = false;

  function mk(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text; // Gemini 가 만든 글은 항상 textContent 로만 넣는다
    return el;
  }

  // ---------- 저장 ----------
  function readSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
      return Array.isArray(list) ? list.filter((c) => c && typeof c.caseId === 'string' && c.caseToken) : [];
    } catch { return []; }
  }
  function writeSaved(list) {
    // 저장 공간이 부족하면 오래된 것부터 버리며 다시 시도한다.
    let items = list.slice(0, MAX_SAVED);
    while (items.length) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(items)); return true; }
      catch { items = items.slice(0, -1); }
    }
    return false;
  }

  // ---------- 카드 ----------
  function renderCard(c) {
    const genre = genreById(c.genre);
    const diff = difficultyById(c.difficultyId);
    const card = mk('article', 'episode-card');
    card.dataset.caseId = c.caseId;

    const top = document.createElement('div');
    const meta = mk('div', 'episode-meta');
    meta.append(
      mk('span', 'episode-tag', `${genre ? genre.icon + ' ' + genre.label : '생성 사건'} · Gemini 생성`),
      mk('span', 'episode-difficulty', `난이도: ${diff ? diff.label + ' ' + diff.stars : c.difficulty || ''}`),
    );
    top.append(meta, mk('h2', null, c.title), mk('p', 'episode-desc', c.intro));

    const wrap = mk('div', 'episode-Start-wrap');
    const play = mk('a', 'btn btn-primary', '수사 시작');
    play.href = `./play.html?case=${encodeURIComponent(c.caseId)}`;
    wrap.appendChild(play);

    const remove = mk('button', 'episode-remove', '목록에서 지우기');
    remove.type = 'button';
    remove.addEventListener('click', () => {
      if (!confirm('이 사건을 목록에서 지울까요? 진행 중이던 저장본도 이어할 수 없게 됩니다.')) return;
      writeSaved(readSaved().filter((x) => x.caseId !== c.caseId));
      try { localStorage.removeItem(`case_state_${user.uid}_${c.caseId}`); } catch { /* 무시 */ }
      card.remove();
    });

    card.append(top, wrap, remove);
    return card;
  }

  function renderSaved() {
    episodeList.querySelectorAll('[data-case-id^="gen-"]').forEach((el) => el.remove());
    readSaved().reverse().forEach((c) => episodeList.prepend(renderCard(c))); // 최신이 맨 위
  }
  renderSaved();

  // ---------- 팝업 ----------
  function optionCard(name, value, { icon, label, sub, stars }, checked) {
    const wrap = mk('label', 'option-card');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = checked;
    const title = mk('strong', null, icon ? `${icon} ${label}` : label);
    wrap.append(input, title);
    if (stars) wrap.appendChild(mk('span', 'option-stars', stars));
    wrap.appendChild(mk('span', 'option-sub', sub));
    return wrap;
  }

  function buildOptions() {
    const g = $('genre-options');
    g.replaceChildren(
      ...[...GENRES, RANDOM_GENRE].map((x, i) =>
        optionCard('genre', x.id, { icon: x.icon, label: x.label, sub: x.desc }, i === 0)),
    );
    const d = $('difficulty-options');
    d.replaceChildren(
      ...DIFFICULTIES.map((x) =>
        optionCard('difficulty', x.id, { label: x.label, sub: x.desc, stars: x.stars }, x.id === 'normal')),
    );
  }
  buildOptions();

  function setStatus(text, isError = false) {
    statusBox.hidden = !text;
    statusBox.textContent = text || '';
    statusBox.classList.toggle('is-error', isError);
  }

  const lockOptions = (locked) => stepForm.querySelectorAll('fieldset').forEach((f) => { f.disabled = locked; });

  function resetModal() {
    stepForm.hidden = false;
    lockOptions(false);
    submitBtn.textContent = '사건 생성하기';
    resultBox.hidden = true;
    playLink.hidden = true;
    submitBtn.hidden = false;
    submitBtn.disabled = false;
    cancelBtn.textContent = '취소';
    setStatus('');
  }

  function openModal() {
    resetModal();
    modal.classList.add('open');
    modal.querySelector('input[name="genre"]:checked')?.focus();
  }
  function closeModal() {
    if (busy) return; // 생성 중에는 닫지 않는다 (요청이 끝난 뒤 결과를 보여 줘야 한다)
    modal.classList.remove('open');
    genBtn.focus();
  }

  genBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // ---------- 생성 ----------
  async function requestCase(genre, difficulty) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    let res;
    try {
      res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, difficulty }),
        signal: ctrl.signal,
      });
    } catch (err) {
      throw new Error(err?.name === 'AbortError'
        ? '사건 생성이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.'
        : '서버에 연결할 수 없습니다.');
    } finally {
      clearTimeout(timer);
    }
    let json;
    try { json = await res.json(); } catch { throw new Error('서버 응답을 읽을 수 없습니다.'); }
    if (!json.ok) throw new Error(json.error || '사건을 만들지 못했습니다.');
    return json.data;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const genre = form.elements.genre.value;
    const difficulty = form.elements.difficulty.value;
    const diff = difficultyById(difficulty);

    busy = true;
    lockOptions(true);
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    const started = Date.now();
    const tick = () => setStatus(
      `🕵️ Gemini가 사건을 설계하고 있습니다… ${Math.floor((Date.now() - started) / 1000)}초` +
      (diff && diff.id === 'expert' ? ' (매우어려움은 최대 40초쯤 걸릴 수 있습니다)' : ' (보통 10~30초)'),
    );
    tick();
    const timer = setInterval(tick, 1000);

    try {
      const data = await requestCase(genre, difficulty);
      const saved = [...readSaved().filter((c) => c.caseId !== data.caseId), data];
      if (!writeSaved(saved.slice(-MAX_SAVED))) {
        throw new Error('이 브라우저에 사건을 저장하지 못했습니다. 저장 공간을 확인해 주세요.');
      }
      renderSaved();

      const g = genreById(data.genre);
      const d = difficultyById(data.difficultyId);
      $('gen-result-meta').textContent =
        `${g ? g.icon + ' ' + g.label : '생성 사건'} · ${d ? d.label + ' ' + d.stars : data.difficulty} · 용의자 ${data.suspectCount}명`;
      $('gen-result-title').textContent = data.title;
      $('gen-result-intro').textContent = data.intro;
      playLink.href = `./play.html?case=${encodeURIComponent(data.caseId)}`;

      stepForm.hidden = true;
      resultBox.hidden = false;
      submitBtn.hidden = true;
      playLink.hidden = false;
      cancelBtn.textContent = '목록으로';
      setStatus('');
    } catch (err) {
      lockOptions(false);
      submitBtn.disabled = false;
      submitBtn.textContent = '다시 생성하기';
      setStatus(`⚠️ ${err.message}`, true);
    } finally {
      clearInterval(timer);
      busy = false;
      cancelBtn.disabled = false;
    }
  });
});
