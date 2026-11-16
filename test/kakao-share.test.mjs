import test from 'node:test';
import assert from 'node:assert/strict';
import { createSharePayload, canShareResult, GAME_URL } from '../public/js/kakao-share-data.js';
const result = { nickname:'이원준1', caseTitle:'송림 저택의 마지막 밤', isCorrect:true, finalScore:1250, elapsedSeconds:200, hintCount:1 };
const stored = { ...result, playerUid:'user-1', isMethodCorrect:true, isMotiveCorrect:true };
test('닉네임/점수/기록을 표시하고 모바일과 PC 모두 운영 사이트로 연결', () => {
  const p = createSharePayload(result);
  assert.equal(p.objectType,'text'); assert.match(p.text,/이원준1/); assert.match(p.text,/1,250점/);
  assert.match(p.text,/3분 20초/); assert.match(p.text,/힌트: 1회/);
  assert.equal(p.link.webUrl,GAME_URL); assert.equal(p.link.mobileWebUrl,GAME_URL);
  assert.equal(p.buttonTitle,'나도 도전하기');
});
test('범인, 해설, UID, 이메일, 임시 랭킹을 메시지에 포함하지 않음', () => {
  const json=JSON.stringify(createSharePayload({...result, accusedSuspect:'비밀범인',solutionExplain:'비밀해설',uid:'private-uid',email:'private@example.com',rank:1}));
  for (const secret of ['비밀범인','비밀해설','private-uid','private@example.com','순위']) assert.ok(!json.includes(secret));
});
test('실패 결과와 0점도 정확하게 공유', () => {
  const p=createSharePayload({...result,isCorrect:false,finalScore:0});assert.match(p.text,/해결 실패/);assert.match(p.text,/0점/);
});
test('잘못된 숫자와 빈 제목은 공유 거절', () => {
  for(const value of [NaN, Infinity, -1, 0.5, '100']) assert.throws(()=>createSharePayload({...result,finalScore:value}));
  assert.throws(()=>createSharePayload({...result,caseTitle:''}));
});
test('긴 제목과 줄바꿈을 정리하여 텍스트 템플릿 길이 유지', () => {
  const p=createSharePayload({...result,caseTitle:'가'.repeat(300)+'\n정답'});assert.ok(p.text.length<300);assert.ok(!p.text.includes('정답'));
});
test('실제 기록이 없거나 다른 사용자 기록일 때 공유 금지', () => {
  assert.equal(canShareResult(null,'user-1',stored),false);
  assert.equal(canShareResult(stored,'user-2',stored),false);
  assert.equal(canShareResult({...stored,playerUid:undefined},'user-1',stored),false);
  assert.equal(canShareResult(stored,'user-1',stored),true);
});
test('URL에서 바꾼 결과와 원래 저장 기록이 다르면 공유 금지', () => {
  for (const field of ['isCorrect','isMethodCorrect','isMotiveCorrect','elapsedSeconds','hintCount']) {
    const changed={...stored,[field]:typeof stored[field]==='boolean' ? !stored[field] : stored[field]+1};
    assert.equal(canShareResult(stored,'user-1',changed),false);
  }
});
const tick = async () => { for(let n=0;n<6;n++) await new Promise(r=>setImmediate(r)); };
async function uiHarness(sdk) {
  const nodes={};
  const element=()=>({textContent:'',hidden:true,disabled:true,events:{},addEventListener(type,fn){this.events[type]=fn;},remove(){this.removed=true;}});
  const scripts=[];
  globalThis.window={Kakao:sdk};
  globalThis.document={getElementById(id){return nodes[id]??=element();},createElement:element,head:{append(script){scripts.push(script);}}};
  const mod=await import(`../public/js/kakao-share.js?test=${Math.random()}`);
  return {mod,nodes,scripts};
}
test('미리 SDK를 준비하고 클릭 안에서 sendDefault 호출; 전송 성공이라고 오인하지 않음', async () => {
  let initialized=false;let sent;
  const h=await uiHarness({init(){initialized=true;},isInitialized:()=>initialized,Share:{sendDefault(p){sent=p;}}});
  h.mod.mountKakaoShare(result);await tick();assert.equal(initialized,true);
  const button=h.nodes['btn-kakao-share'];assert.equal(button.disabled,false);
  button.events.click();assert.equal(sent.text,createSharePayload(result).text);
  assert.match(h.nodes['share-message'].textContent,/선택/);assert.ok(!h.nodes['share-message'].textContent.includes('전송 완료'));
});
test('SDK 네트워크 실패 뒤 버튼으로 로드를 재시도', async () => {
  const h=await uiHarness(undefined);h.mod.mountKakaoShare(result);await tick();
  assert.equal(h.scripts.length,1);h.scripts[0].onerror();await tick();
  assert.equal(h.nodes['btn-kakao-share'].disabled,false);assert.match(h.nodes['btn-kakao-share'].textContent,/다시/);
  h.nodes['btn-kakao-share'].events.click();await tick();assert.equal(h.scripts.length,2);
  window.Kakao={init(){},isInitialized:()=>false,Share:{sendDefault(){}}};h.scripts[1].onload();await tick();
  assert.equal(h.nodes['btn-kakao-share'].textContent,'카카오톡으로 결과 공유');
});
test('SDK 공유 호출 오류를 사용자에게 표시', async () => {
  const h=await uiHarness({init(){},isInitialized:()=>true,Share:{sendDefault(){throw new Error('blocked');}}});
  h.mod.mountKakaoShare(result);await tick();h.nodes['btn-kakao-share'].events.click();
  assert.match(h.nodes['share-message'].textContent,/팝업/);
});
