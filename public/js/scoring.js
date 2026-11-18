// 서버 채점·결과 화면·랭킹 저장에 공통으로 사용하는 규칙.
export const SCORING_VERSION = 2;
export const MIN_ACCUSE_SECONDS = 60;
export function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}
export function canAccuse(seconds) {
  return validCount(seconds) && seconds >= MIN_ACCUSE_SECONDS;
}
export function calculateScore({ isCorrect, elapsedSeconds, hintCount }) {
  if (typeof isCorrect !== 'boolean' || !validCount(elapsedSeconds) || !validCount(hintCount)) {
    throw new Error('올바른 플레이 시간과 힌트 횟수가 필요합니다.');
  }
  const base = isCorrect ? 1000 : 0;
  const timePenalty = isCorrect ? (elapsedSeconds >= 1080 ? 350 : elapsedSeconds > 600 ? 200 : 0) : 0;
  const hintPenalty = isCorrect ? Math.min(hintCount, Math.floor(Number.MAX_SAFE_INTEGER / 100) - 4) * 100 : 0;
  const penalty = timePenalty + hintPenalty;
  return { base, timePenalty, hintPenalty, penalty, score: Math.max(0, base - penalty), scoringVersion: SCORING_VERSION };
}

// 페이지를 열어 둔 시간만 합산. 복원 대기와 접속하지 않은 시간은 제외.
export function createPlayClock(savedSeconds = 0, now = () => performance.now()) {
  const base = validCount(savedSeconds) ? savedSeconds : 0;
  const startedAt = now();
  return () => base + Math.max(0, Math.floor((now() - startedAt) / 1000));
}
