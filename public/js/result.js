// public/js/result.js - mansion-001.json 기준 결과 판정, 점수(범인 50 + 수법 25 + 동기 25 + 스피드 보너스 - 힌트 감점), DB 랭킹

document.addEventListener('DOMContentLoaded', async () => {
  const player = await window.authReady;
  if (!player) return;
  const params = new URLSearchParams(window.location.search);
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem('last_case_result') || 'null'); }
  catch { /* 손상된 저장 정보로 결과 페이지 전체가 중단되지 않도록 한다. */ }

  const accusedSuspect = params.get('suspect') || (stored && stored.accusedSuspect) || '오진석 (주치의)';
  const isCorrect = params.get('correct') !== null ? params.get('correct') === '1' : (stored ? stored.isCorrect : true);
  const isMethodCorrect = params.get('method') !== null ? params.get('method') === '1' : (stored ? stored.isMethodCorrect : true);
  const isMotiveCorrect = params.get('motive') !== null ? params.get('motive') === '1' : (stored ? stored.isMotiveCorrect : true);
  const elapsedSeconds = Number(params.get('time') ?? (stored ? stored.elapsedSeconds : 95));
  const hintCount = Number(params.get('hints') ?? (stored ? stored.hintCount : 0));
  const nickname = window.playerProfile.nickname;

  const solutionExplain = (stored && stored.solutionExplain) ||
    '범인은 주치의 오진석이다. 회장이 병원 청구 비리를 신고하겠다고 통보하자(16:30), 집사가 자리를 비운 17:05~17:12에 서재 약장의 심장약 병을 겉모양이 같은 병으로 바꿔 놓았다. 회장은 평소처럼 23:05경 그 약을 복용하고 숨졌다. 오진석은 23:20에 약병을 회수하러 왔다가 한소영의 기척에 물러났고, 자연사를 주장해 부검을 막으려 했다. 유언장은 서명되지 않았고 오진석은 상속인이 아니므로 유산 갈등은 오답 유도였다.';

  function formatTime(sec) {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  const bannerEl = document.getElementById('result-banner');
  const verdictTitleEl = document.getElementById('verdict-title');
  const verdictSubEl = document.getElementById('verdict-subtitle');
  const scoreStatusBadge = document.getElementById('score-status-badge');

  let baseScore = 0;
  let timeBonus = 0;
  let hintPenalty = 0;
  let finalScore = 0;

  if (isCorrect) {
    bannerEl.className = 'result-banner success';
    verdictTitleEl.textContent = '🎉 범인을 찾았습니다!';
    verdictSubEl.innerHTML = `
      지목한 용의자 <strong>[${accusedSuspect}]</strong>는 진범이 맞습니다!<br /><br />
      <strong>[사건 진상 해설]</strong><br />${solutionExplain}
    `;
    scoreStatusBadge.textContent = '수사 성공 (정답)';

    // mansion-001.json scoring: culprit 50 + method 25 + motive 25 (10배수 환산 또는 100점 만점 + 시간 보너스)
    const culpritPts = 500;
    const methodPts = isMethodCorrect ? 250 : 0;
    const motivePts = isMotiveCorrect ? 250 : 0;
    baseScore = culpritPts + methodPts + motivePts;
    timeBonus = Math.max(0, (300 - elapsedSeconds) * 2);
    hintPenalty = hintCount * 50; // hintPenalty: 5 (10배수 50점)
    finalScore = Math.max(100, baseScore + timeBonus - hintPenalty);
  } else {
    bannerEl.className = 'result-banner fail';
    verdictTitleEl.textContent = '❌ 사건을 해결하지 못했습니다.';
    verdictSubEl.innerHTML = `
      지목한 용의자 <strong>[${accusedSuspect}]</strong>는 진범이 아니었습니다.<br />
      누가 가장 쉽게 약에 손댈 수 있었는지, 집사의 약 일지(c05)와 약병 라벨(c11)을 다시 확인해 보세요!
    `;
    scoreStatusBadge.textContent = '수사 실패 (오답)';
  }

  document.getElementById('base-score-val').textContent = `+${baseScore.toLocaleString()}점 (범인·수법·동기)`;
  document.getElementById('elapsed-time-label').textContent = formatTime(elapsedSeconds);
  document.getElementById('time-bonus-val').textContent = `+${timeBonus.toLocaleString()}점 (스피드 보너스)`;
  document.getElementById('hint-used-label').textContent = `${hintCount}회`;
  document.getElementById('hint-penalty-val').textContent = `-${hintPenalty.toLocaleString()}점`;
  document.getElementById('final-score-val').textContent = `${finalScore.toLocaleString()}점`;

  const defaultRankings = [
    { name: '셜록홈즈', timeSec: 52, hints: 0, score: 1496, isMe: false },
    { name: '명탐정코난', timeSec: 88, hints: 0, score: 1424, isMe: false },
    { name: '포와로', timeSec: 115, hints: 1, score: 1320, isMe: false },
    { name: '김전일', timeSec: 170, hints: 2, score: 1160, isMe: false }
  ];

  if (isCorrect) {
    defaultRankings.push({
      name: `${nickname} [나]`,
      timeSec: elapsedSeconds,
      hints: hintCount,
      score: finalScore,
      isMe: true
    });
  }

  defaultRankings.sort((a, b) => b.score - a.score);

  const tbody = document.getElementById('ranking-tbody');
  tbody.innerHTML = defaultRankings
    .map((row, idx) => `
      <tr class="${row.isMe ? 'my-record' : ''}">
        <td>${idx + 1}위</td>
        <td>${row.name}</td>
        <td>${formatTime(row.timeSec)}</td>
        <td>${row.hints}회</td>
        <td><strong>${row.score.toLocaleString()}점</strong></td>
      </tr>
    `)
    .join('');
  // 화면에 표시한 최종 점수를 그대로 공유한다. 예시 랭킹과 정답은 전달하지 않는다.
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
