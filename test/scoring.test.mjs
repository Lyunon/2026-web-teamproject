import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore, canAccuse, createPlayClock } from '../public/js/scoring.js';
import { createSharePayload } from '../public/js/kakao-share-data.js';
import accuse from '../api/accuse.js';
import { loadCase } from '../api/_lib/caseStore.js';
const points = (time, hints=0, correct=true) => calculateScore({isCorrect:correct,elapsedSeconds:time,hintCount:hints});
for (const [seconds, expected] of [[60,1000],[599,1000],[600,1000],[601,800],[1079,800],[1080,650],[1081,650]]) {
  test(`시간 경계 ${seconds}초 → ${expected}점`, () => assert.equal(points(seconds).score,expected));
}
test('힌트 회당 100점, 실패/과도한 감점의 최저 0점', () => {
  assert.equal(points(60,1).score,900);
  assert.equal(points(601,2).score,600);
  assert.equal(points(1080,3).score,350);
  assert.equal(points(1080,20).score,0);
  assert.equal(points(60,0,false).score,0);
});
test('지목 경계 59초 거절, 60초 허용 및 잘못된 시간 거절', () => {
  assert.equal(canAccuse(59),false);assert.equal(canAccuse(60),true);
  for(const n of [-1,NaN,Infinity,60.5,'60',undefined]) assert.equal(canAccuse(n),false);
});
test('40초 저장 후 이어서 20초: 오프라인 시간 제외, 60초에서 해금', () => {
  let now=900000;
  const clock=createPlayClock(40,()=>now);
  assert.equal(clock(),40);
  now+=19000;assert.equal(clock(),59);assert.equal(canAccuse(clock()),false);
  now+=1000;assert.equal(clock(),60);assert.equal(canAccuse(clock()),true);
  const saved=JSON.parse(JSON.stringify({elapsedSeconds:clock(),hintCount:2}));
  now+=3600000;
  const resumed=createPlayClock(saved.elapsedSeconds,()=>now);
  assert.equal(resumed(),60);assert.equal(points(resumed(),saved.hintCount).score,800);
});
test('탭 타이머 호출이 늦어져도 실제 경과 시간으로 시간 감점', () => {
  let now=0;const clock=createPlayClock(590,()=>now);
  now=11000;assert.equal(clock(),601);assert.equal(points(clock()).score,800);
});
test('새 게임은 저장된 시간과 별개로 0초부터 시작',()=>{
  const clock=createPlayClock(0,()=>1000);assert.equal(clock(),0);assert.equal(canAccuse(clock()),false);
});
const {casePublic,caseSecret}=loadCase('mansion-001');
async function request(body) {
  let status,payload;
  const res={setHeader(){},status(n){status=n;return this;},json(p){payload=p;}};
  await accuse({method:'POST',body:{caseId:'mansion-001',suspectId:caseSecret.culprit,hintCount:0,...body}},res);
  return {status,...payload};
}
test('API는 1분 미만/시간 누락 요청을 거절하고 정답을 노출하지 않음',async()=>{
  for(const seconds of [undefined,0,59,-1,'60']) {
    const r=await request({elapsedSeconds:seconds});assert.equal(r.status,400);assert.equal(r.data,undefined);
  }
});
test('API·결과 공통 계산·카카오 공유 점수 일치 (18분, 힌트 2회)',async()=>{
  const r=await request({elapsedSeconds:1080,hintCount:2});
  assert.equal(r.status,200);assert.equal(r.data.score,450);
  assert.equal(r.data.base,1000);assert.equal(r.data.timePenalty,350);assert.equal(r.data.hintPenalty,200);
  assert.equal(r.data.scoringVersion,2);
  const calculated=points(1080,2);assert.equal(r.data.score,calculated.score);
  const share=createSharePayload({nickname:'탐정',caseTitle:'사건',isCorrect:true,finalScore:calculated.score,elapsedSeconds:1080,hintCount:2});
  assert.match(share.text,/450점/);
});
test('API 오답 0점',async()=>{
  const wrong=casePublic.suspects.find(s=>s.id!==caseSecret.culprit).id;
  const r=await request({suspectId:wrong,elapsedSeconds:60,hintCount:1});
  assert.equal(r.data.correct,false);assert.equal(r.data.score,0);
});
