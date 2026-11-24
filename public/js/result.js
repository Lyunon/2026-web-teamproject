// 공통 점수 규칙으로 결과 화면과 카카오 공유 점수를 통일한다. 랭킹은 /api/ranking 에서 읽는다.
// 공개 파일이므로 정답·해설을 여기에 적지 않는다. 해설은 서버 응답(last_case_result)으로만 받는다.

document.addEventListener('DOMContentLoaded', async () => {
  const player = await window.authReady;
  if (!player) return;
  const params = new URLSearchParams(window.location.search);
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('last_case_result') || 'null'); }
  catch { /* 손상된 저장 정보로 결과 페이지 전체가 중단되지 않도록 한다. */ }

  // 결과가 없을 때 기본값이 정답처럼 보이지 않도록 한다.
  const accusedSuspect = params.get('suspect') || (stored && stored.accusedSuspect) || '알 수 없음';
  const isCorrect = params.get('correct') !== null ? params.get('correct') === '1' : Boolean(stored && stored.isCorrect);
  const isMethodCorrect = params.get('method') !== null ? params.get('method') === '1' : Boolean(stored && stored.isMethodCorrect);
  const isMotiveCorrect = params.get('motive') !== null ? params.get('motive') === '1' : Boolean(stored && stored.isMotiveCorrect);
  const elapsedSeconds = Number(params.get('time') ?? (stored ? stored.elapsedSeconds : 0));
  const hintCount = Number(params.get('hints') ?? (stored ? stored.hintCount : 0));
  const nickname = window.playerProfile.nickname;
  const solutionExplain = (stored && stored.solutionExplain) || '';

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  const strong = (t) => Object.assign(document.createElement('strong'), { textContent: t });
  const br = () => document.createElement('br');

  const bannerEl = document.getElementById('result-banner');
  const verdictTitleEl = document.getElementById('verdict-title');
  const verdictSubEl = document.getElementById('verdict-subtitle');
  const scoreStatusBadge = document.getElementById('score-status-badge');

  const { calculateScore } = await import('./scoring.js');
  const { base: baseScore, timePenalty, hintPenalty, score: finalScore } =
    calculateScore({ isCorrect, elapsedSeconds, hintCount });

  // URL 값이 들어가므로 innerHTML 대신 텍스트 노드로 넣는다.
  if (isCorrect) {
    bannerEl.className = 'result-banner success';
    verdictTitleEl.textContent = '🎉 범인을 찾았습니다!';
    verdictSubEl.replaceChildren(
      '지목한 용의자 ', strong(`[${accusedSuspect}]`), '는 진범이 맞습니다!', br(), br(),
      strong('[사건 진상 해설]'), br(), solutionExplain,
    );
    scoreStatusBadge.textContent =
      stored?.ranked === true ? '수사 성공 · 랭킹 등록' :
      stored?.ranked === false ? '수사 성공 (랭킹은 첫 지목만 반영)' : '수사 성공 (정답)';
  } else {
    bannerEl.className = 'result-banner fail';
    verdictTitleEl.textContent = '❌ 사건을 해결하지 못했습니다.';
    verdictSubEl.replaceChildren(
      '지목한 용의자 ', strong(`[${accusedSuspect}]`), '는 진범이 아니었습니다.', br(),
      '누가 가장 쉽게 약에 손댈 수 있었는지, 집사의 약 일지(c05)와 약병 라벨(c11)을 다시 확인해 보세요!',
    );
    scoreStatusBadge.textContent = '수사 실패 (오답)';
  }

  document.getElementById('base-score-val').textContent = `+${baseScore.toLocaleString()}점 (사건 해결)`;
  document.getElementById('elapsed-time-label').textContent = formatTime(elapsedSeconds);
  document.getElementById('time-penalty-val').textContent = `-${timePenalty.toLocaleString()}점`;
  document.getElementById('hint-used-label').textContent = `${hintCount}회`;
  document.getElementById('hint-penalty-val').textContent = `-${hintPenalty.toLocaleString()}점`;
  document.getElementById('final-score-val').textContent = `${finalScore.toLocaleString()}점`;

  // ---------- 랭킹 (서버) ----------
  const tbody = document.getElementById('ranking-tbody');
  const caseId = (stored && stored.caseId) || 'mansion-001';
  function messageRow(text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.style.textAlign = 'center';
    td.textContent = text;
    tr.appendChild(td);
    tbody.replaceChildren(tr);
  }
  function rankRow(r) {
    const tr = document.createElement('tr');
    if (r.isMe) tr.className = 'my-record';
    [`${r.rank}위`, r.isMe ? `${r.nickname} [나]` : r.nickname, formatTime(r.elapsedSeconds), `${r.hintCount}회`]
      .forEach((t) => { const td = document.createElement('td'); td.textContent = t; tr.appendChild(td); });
    const td = document.createElement('td');
    td.appendChild(strong(`${Number(r.score).toLocaleString()}점`));
    tr.appendChild(td);
    return tr;
  }
  async function loadRanking() {
    if (caseId.startsWith('gen-')) return messageRow('Gemini가 만든 사건은 랭킹에 등록되지 않습니다.');
    messageRow('랭킹을 불러오는 중…');
    try {
      const token = await player.getIdToken();
      const res = await fetch(`/api/ranking?caseId=${encodeURIComponent(caseId)}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      const { top, me } = json.data;
      if (!top.length) return messageRow('아직 등록된 기록이 없습니다. 첫 번째 해결자가 되어 보세요!');
      tbody.replaceChildren(...top.map(rankRow));
      if (me && !top.some((r) => r.isMe)) tbody.append(rankRow(me));
    } catch (err) {
      console.warn('[result] 랭킹을 불러오지 못했습니다:', err.message);
      messageRow('랭킹을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');
    }
  }
  if (tbody) loadRanking(); // 공유 준비를 기다리게 하지 않는다

  // 화면에 표시한 최종 점수를 그대로 공유한다. 정답은 전달하지 않는다.
  try {
    const { canShareResult } = await import('./kakao-share-data.js');
    const displayed = { isCorrect, isMethodCorrect, isMotiveCorrect, elapsedSeconds, hintCount };
    if (canShareResult(stored, player.uid, displayed)) {
      const { mountKakaoShare } = await import('./kakao-share.js');
      mountKakaoShare({ nickname, caseTitle: stored.caseTitle, isCorrect, finalScore, elapsedSeconds, hintCount });
    } else {
      document.getElementById('share-message').textContent = '이 계정으로 게임을 한 번 완료하면 결과를 공유할 수 있어요.';
    }
  } catch {
    document.getElementById('share-message').textContent = '공유 기능을 준비하지 못했어요. 페이지를 새로고침해 주세요.';
  }
});
