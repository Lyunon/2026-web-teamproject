// public/js/result.js - 범인 지목 결과 판정, 타이머/힌트 기반 점수 계산, DB 랭킹 렌더링

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const storedRaw = localStorage.getItem('last_case_result');
  const stored = storedRaw ? JSON.parse(storedRaw) : null;

  const accusedSuspect = params.get('suspect') || (stored && stored.accusedSuspect) || '이조카';
  const isCorrectParam = params.get('correct');
  const isCorrect = isCorrectParam !== null
    ? isCorrectParam === '1'
    : (stored ? stored.isCorrect : accusedSuspect === '이조카');

  const elapsedSeconds = Number(params.get('time') ?? (stored ? stored.elapsedSeconds : 75));
  const hintCount = Number(params.get('hints') ?? (stored ? stored.hintCount : 0));
  const userProvider = localStorage.getItem('mock_user_provider') || 'Google';

  function formatTime(sec) {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // 1. 정답 여부에 따른 상단 판정 배너 출력
  const bannerEl = document.getElementById('result-banner');
  const verdictTitleEl = document.getElementById('verdict-title');
  const verdictSubEl = document.getElementById('verdict-subtitle');
  const scoreStatusBadge = document.getElementById('score-status-badge');

  // 2. 점수 계산 공식 (정답일 때만 점수 부여, 빨리 해결할수록 스피드 보너스 높음, 힌트당 -150점)
  let baseScore = 0;
  let timeBonus = 0;
  let hintPenalty = 0;
  let finalScore = 0;

  if (isCorrect) {
    bannerEl.className = 'result-banner success';
    verdictTitleEl.textContent = '🎉 범인을 찾았습니다!';
    verdictSubEl.innerHTML = `
      지목한 용의자 <strong>[${accusedSuspect}]</strong>는 진범이 맞습니다!<br />
      온실 정원에 있었다던 알리바이와 달리 발코니 창틀에 남은 붉은 배양토, 그리고 상속인 변경 유언장 초안이 결정적 증거가 되었습니다.
    `;
    scoreStatusBadge.textContent = '수사 성공 (정답)';

    baseScore = 1000;
    // 300초(5분) 이내 해결 시 남은 초 × 2점 보너스 (최대 +600점)
    timeBonus = Math.max(0, (300 - elapsedSeconds) * 2);
    hintPenalty = hintCount * 150;
    finalScore = Math.max(100, baseScore + timeBonus - hintPenalty);
  } else {
    bannerEl.className = 'result-banner fail';
    verdictTitleEl.textContent = '❌ 사건을 해결하지 못했습니다.';
    verdictSubEl.innerHTML = `
      지목한 용의자 <strong>[${accusedSuspect}]</strong>는 진범이 아니었습니다.<br />
      결정적 단서를 다시 확인하고 진범의 알리바이 모순을 찾아 재도전해 보세요.
    `;
    scoreStatusBadge.textContent = '수사 실패 (오답)';

    baseScore = 0;
    timeBonus = 0;
    hintPenalty = 0;
    finalScore = 0;
  }

  // 3. 점수 산출 UI 업데이트
  document.getElementById('base-score-val').textContent = `+${baseScore.toLocaleString()}점`;
  document.getElementById('elapsed-time-label').textContent = formatTime(elapsedSeconds);
  document.getElementById('time-bonus-val').textContent = `+${timeBonus.toLocaleString()}점 (스피드 보너스)`;
  document.getElementById('hint-used-label').textContent = `${hintCount}회`;
  document.getElementById('hint-penalty-val').textContent = `-${hintPenalty.toLocaleString()}점`;
  document.getElementById('final-score-val').textContent = `${finalScore.toLocaleString()}점`;

  // 4. 데이터베이스(Firestore 연동 예정) 랭킹 목록 렌더링
  const defaultRankings = [
    { name: '셜록홈즈 (Google)', timeSec: 48, hints: 0, score: 1504, isMe: false },
    { name: '명탐정코난 (Naver)', timeSec: 85, hints: 0, score: 1430, isMe: false },
    { name: '포와로 (Google)', timeSec: 110, hints: 1, score: 1230, isMe: false },
    { name: '김전일 (Naver)', timeSec: 160, hints: 2, score: 980, isMe: false }
  ];

  if (isCorrect) {
    defaultRankings.push({
      name: `김형사님 (${userProvider}) [나]`,
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
});
