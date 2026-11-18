# 점수 규칙 v2 및 랭킹 연동

- 정답 기본 1000점. 오답 0점. 최종 점수 하한 0점.
- 누적 시간 600초 이하 감점 0, 601~1079초 감점 200, 1080초부터 감점 350.
- 힌트 회당 100점 차감. 수법·동기 및 스피드 가산점 없음.
- 공통 계산 모듈: public/js/scoring.js. API와 결과 화면이 함께 사용.
- 범인 지목은 누적 60초부터 허용. 버튼·제출 핸들러·API에 검사.

## 이어하기
기존 users/{uid}/saves/{caseId}와 localStorage의 elapsedSeconds, hintCount를 그대로 복원한다.
사건 로딩·복원 대기 시간과 페이지를 닫아 둔 시간은 제외한다. 열린 페이지의 백그라운드 시간은 포함한다.
페이지를 떠날 때 최신 시간을 로컬에 즉시 저장하고 클라우드 쓰기를 요청한다.
브라우저 강제 종료/네트워크 단절 시 클라우드 쓰기는 보장되지 않아 다른 기기에서는 마지막 저장 시점부터 복원될 수 있다.
새 게임은 0초부터 시작한다. 기존 진행 저장본도 호환되며 완료 시 새 규칙으로 채점된다.

## 건호씨 랭킹 개발 연결점
POST /api/accuse 요청: caseId, suspectId, hintCount, elapsedSeconds(정수 초).
응답 data: correct, base, timePenalty, hintPenalty, penalty(총 차감), score, elapsedSeconds, hintCount, scoringVersion: 2.
last_case_result에 playerUid, caseId 및 위 점수 필드가 저장된다. 성공 여부 이름은 isCorrect다.
결과 화면과 카카오 공유는 공통 calculateScore 결과를 사용한다. 랭킹도 이 규칙의 score로 저장해야 한다.
기존 버전 점수는 scoringVersion으로 구분하거나 기록 시간/힌트로 재계산해야 새 점수와 공정하게 비교할 수 있다.
이 변경은 랭킹 저장/조회나 Firestore 보안 규칙을 추가하지 않는다. 현재 예시 랭킹만 새 점수에 맞춘다.
현재 API는 인증된 서버 플레이 세션이 없고 시간이 클라이언트 제공값이다. 60초 검사는 정상 UI의 조기 지목을 막지만 조작 요청을 완전히 방지하지는 않는다. 랭킹의 위변조 방지는 서버 세션·시간·힌트 검증이 추가로 필요하다.

## 검증
node --experimental-vm-modules --test test/scoring.test.mjs test/kakao-share.test.mjs test/signup.test.mjs
수동 확인: 새 게임 59초까지 잠금/60초 해제; 40초에 나갔다 이어서 20초 후 해제; 60초 이상 저장은 즉시 해제; 처음부터 다시는 잠금 복원; 결과와 공유 점수 일치.
