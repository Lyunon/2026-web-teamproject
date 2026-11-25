// 공개되는 JavaScript 키. Admin 키나 Client Secret을 넣지 않는다.
export const KAKAO_JAVASCRIPT_KEY = '754e045f7ea75ff9ed9805202d515600';
export const GAME_URL = 'https://2026-web-teamproject.vercel.app/';
export const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.5/kakao.min.js';
export const SDK_INTEGRITY = 'sha384-v6JKY3z4FUkWq21oZDHZe74YvuPk/WUrVLrDHTBojHXClOSa3iXy7sCXPY1jkFbj';

function integer(value) { return Number.isSafeInteger(value) && value >= 0; }
function cleanText(value, length) {
  if (typeof value !== 'string') throw new Error('공유할 정보가 올바르지 않습니다.');
  const text = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (!text) throw new Error('공유할 정보가 비어 있습니다.');
  return [...text].slice(0, length).join('');
}
// URL을 직접 열었을 때의 샘플 결과나 다른 계정의 기록을 공유하지 않는다.
export function canShareResult(stored, uid, displayed) {
  return Boolean(stored && uid && stored.playerUid === uid
    && typeof stored.caseTitle === 'string' && stored.caseTitle.trim()
    && typeof stored.isCorrect === 'boolean'
    && integer(stored.elapsedSeconds) && integer(stored.hintCount)
    && stored.isCorrect === displayed.isCorrect
    && stored.elapsedSeconds === displayed.elapsedSeconds
    && stored.hintCount === displayed.hintCount
    && stored.isMethodCorrect === displayed.isMethodCorrect
    && stored.isMotiveCorrect === displayed.isMotiveCorrect);
}
export function createSharePayload({ nickname, caseTitle, isCorrect, finalScore, elapsedSeconds, hintCount }) {
  if (typeof isCorrect !== 'boolean' || ![finalScore, elapsedSeconds, hintCount].every(integer)) {
    throw new Error('게임 결과를 확인할 수 없어 공유하지 못했습니다.');
  }
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return {
    objectType: 'text',
    text: [
      '🕵️ F5 추리 수사본부 · 수사 결과',
      `${cleanText(nickname, 12)} 탐정의 도전`,
      `사건: ${cleanText(caseTitle, 60)}`,
      `결과: ${isCorrect ? '사건 해결 성공!' : '사건 해결 실패 · 다시 도전!'}`,
      `최종 점수: ${finalScore.toLocaleString('ko-KR')}점`,
      `소요 시간: ${minutes}분 ${seconds}초 · 힌트: ${hintCount}회`,
      '나보다 높은 점수에 도전해 보세요!',
    ].join('\n'),
    link: { webUrl: GAME_URL, mobileWebUrl: GAME_URL },
    buttonTitle: '나도 도전하기',
  };
}
