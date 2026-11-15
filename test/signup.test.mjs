// 실행: node --experimental-vm-modules --test test/signup.test.mjs
// 외부 계정이나 운영 DB를 사용하지 않는 인증/가입 흐름 회귀 테스트.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateNickname, hasProfile } from '../public/js/profile-validation.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/js');
const settle = async () => { for (let i=0;i<12;i++) await new Promise(resolve => setImmediate(resolve)); };
function element(id) {
  return { id, textContent: '', value: '', disabled: id === 'signup-fields', hidden: false, events: {}, attributes: {},
    classList: { remove() {} }, append() {}, replaceChildren(...children) { this.children = children; },
    addEventListener(type, fn) { this.events[type] = fn; },
    setAttribute(k,v) { this.attributes[k]=v; }, removeAttribute(k) { delete this.attributes[k]; }, focus() {},
    async fire(type) { await this.events[type]?.({preventDefault(){},currentTarget:this}); await settle(); },
  };
}
async function harness(options = {}) {
  const state = { user: { uid: 'user-1', getIdToken: async () => 'token' }, profile: null,
    readError: null, saveError: null, signOutError: null, writes: 0, ...options };
  const els = new Map();
  const el = (id) => { if (!els.has(id)) els.set(id, element(id)); return els.get(id); };
  const document = { getElementById: el, querySelectorAll: () => [el('user-display')],
    querySelector: () => el('main'), createElement: (tag) => element(tag), body: element('body') };
  const location = { destination:null, replace(to) { this.destination=to; }, reload(){} };
  const context = vm.createContext({ console: {error(){}}, document, location, window: {}, alert(){} });
  const auth = { get currentUser() { return state.user; }, async authStateReady() {} };
  const snapshot = () => ({ exists: () => state.profile !== null, data: () => state.profile });
  const sdk = {
    'firebase-app.js': { getApps: () => [], getApp: () => ({}), initializeApp: () => ({}) },
    'firebase-auth.js': { getAuth: () => auth, GoogleAuthProvider: class {},
      signInWithPopup: async () => { state.user={uid:'user-1'}; return {user:state.user}; },
      signOut: async () => { if(state.signOutError) throw state.signOutError; state.user=null; },
    },
    'firebase-firestore.js': {
      getFirestore: () => ({}), doc: (_, collection, uid) => ({ collection, uid }),
      getDocFromServer: async () => { if(state.readError) throw state.readError; return snapshot(); },
      serverTimestamp: () => 'SERVER_TIMESTAMP',
      runTransaction: async (_, cb) => {
        if (state.saveError) throw state.saveError;
        let staged;
        const result = await cb({ get: async () => snapshot(), set: (ref, data) => { staged=data; } });
        if(staged) { state.profile=staged; state.writes++; }
        return result;
      },
    },
  };
  const modules = new Map();
  function load(name) {
    if (modules.has(name)) return modules.get(name);
    const pending = (async () => {
    let mod;
    if (name.startsWith('https:')) {
      const exports = sdk[name.split('/').at(-1)];
      mod = new vm.SyntheticModule(Object.keys(exports), function(){ for(const [k,v] of Object.entries(exports)) this.setExport(k,v); }, {context,identifier:name});
    } else {
      const source = fs.readFileSync(name,'utf8');
      mod = new vm.SourceTextModule(source, {context, identifier:name, importModuleDynamically: async (specifier, parent) => {
        const child = await load(specifier.startsWith('https:') ? specifier : path.resolve(path.dirname(parent.identifier),specifier));
        if (child.status==='linked') await child.evaluate();
        return child;
      }});
    }
    await mod.link((specifier,parent) => load(specifier.startsWith('https:') ? specifier : path.resolve(path.dirname(parent.identifier),specifier)));
    return mod;
    })();
    modules.set(name, pending);
    return pending;
  }
  async function run(filename) { const mod=await load(path.join(root,filename)); await mod.evaluate(); await settle(); return mod.namespace; }
  return {state,el,context,location,run};
}
test('닉네임: 유효 문자, 2~12자, 공백 정리, 한글 정규화', () => {
  assert.equal(validateNickname('  명탐정_7  '),'명탐정_7');
  assert.equal(validateNickname('탐정'),'탐정');
  for(const value of ['', '가', 'a'.repeat(13), '탐정 준', '<script>', '🔍탐정', 'ab\ncd']) assert.throws(()=>validateNickname(value));
  assert.equal(hasProfile(null),false); assert.equal(hasProfile({nickname:'탐정'}),true);
});
test('신규 Google 사용자 → 가입 화면', async () => {
  const h=await harness(); await h.run('index.js'); assert.equal(h.location.destination,'./signup.html');
});
test('기존 회원 → 사건 목록', async () => {
  const h=await harness({profile:{nickname:'기존탐정'}}); await h.run('index.js'); assert.equal(h.location.destination,'./cases.html');
});
test('미로그인 사용자는 Google 버튼으로 인증 후 가입으로 이동', async () => {
  const h=await harness({user:null}); await h.run('index.js'); assert.equal(h.location.destination,null);
  await h.el('btn-login-google').fire('click'); assert.equal(h.location.destination,'./signup.html');
});
test('회원 조회 실패를 신규 가입으로 처리하지 않고 재시도 허용', async () => {
  const h=await harness({readError:{code:'permission-denied'}}); await h.run('index.js');
  assert.equal(h.location.destination,null); assert.match(h.el('login-message').textContent,/관리자/);
  h.state.readError=null; await h.el('btn-login-google').fire('click'); assert.equal(h.location.destination,'./signup.html');
});
test('인증 없는 가입 주소 접근 → 로그인', async () => {
  const h=await harness({user:null}); await h.run('signup.js'); assert.equal(h.location.destination,'./index.html');
});
test('가입 완료: 입력 검증 + Firestore 저장 + 사건 목록 이동', async () => {
  const h=await harness(); await h.run('signup.js'); h.el('nickname').value='명탐정준';
  await h.el('signup-form').fire('submit'); assert.equal(h.state.profile.nickname,'명탐정준');
  assert.equal(h.state.profile.createdAt,'SERVER_TIMESTAMP'); assert.equal(h.state.writes,1);
  assert.equal(h.location.destination,'./cases.html');
});
test('잘못된 닉네임은 저장되지 않음', async () => {
  const h=await harness(); await h.run('signup.js'); h.el('nickname').value='<script>';
  await h.el('signup-form').fire('submit'); assert.equal(h.state.writes,0); assert.equal(h.location.destination,null);
  assert.equal(h.el('nickname').attributes['aria-invalid'],'true');
});
test('저장 실패 후 입력을 보존하고 재시도 가능', async () => {
  const h=await harness({saveError:{code:'unavailable'}}); await h.run('signup.js'); h.el('nickname').value='재시도탐정';
  await h.el('signup-form').fire('submit'); assert.equal(h.location.destination,null); assert.equal(h.el('signup-fields').disabled,false);
  h.state.saveError=null; await h.el('signup-form').fire('submit'); assert.equal(h.state.writes,1);
});
test('다른 탭에서 가입을 마친 프로필을 덮어쓰지 않음', async () => {
  const h=await harness(); await h.run('signup.js'); h.el('nickname').value='두번째탐정';
  h.state.profile={nickname:'첫번째탐정'}; await h.el('signup-form').fire('submit');
  assert.equal(h.state.profile.nickname,'첫번째탐정'); assert.equal(h.state.writes,0);
});
test('가입 도중 계정이 바뀌면 저장하지 않음', async () => {
  const h=await harness(); await h.run('signup.js'); h.el('nickname').value='명탐정';h.state.user={uid:'user-2'};
  await h.el('signup-form').fire('submit');assert.equal(h.state.writes,0);assert.equal(h.location.destination,'./index.html');
});
test('미가입 회원의 게임 접근 → 가입 화면, 초기화 차단', async () => {
  const h=await harness(); await h.run('guard.js'); assert.equal(await h.context.window.authReady,null);
  assert.equal(h.location.destination,'./signup.html');
});
test('미로그인 게임 접근 → 로그인', async () => {
  const h=await harness({user:null}); await h.run('guard.js');assert.equal(h.location.destination,'./index.html');
});
test('조회 실패 때 게임 초기화 차단 및 오류 화면', async () => {
  const h=await harness({readError:{code:'unavailable'}});await h.run('guard.js');
  assert.equal(await h.context.window.authReady,null);assert.equal(h.location.destination,null);assert.ok(h.el('main').children);
});
test('가입 회원은 닉네임 표시 및 실제 로그아웃', async () => {
  const h=await harness({profile:{nickname:'수사관준'}}); await h.run('guard.js');
  assert.equal((await h.context.window.authReady).uid,'user-1');assert.match(h.el('user-display').textContent,/수사관준/);
  await h.el('btn-logout').fire('click');assert.equal(h.state.user,null);assert.equal(h.location.destination,'./index.html');
});
test('계정 변경 버튼은 인증을 종료함', async () => {
  const h=await harness();await h.run('signup.js');await h.el('btn-change-account').fire('click');assert.equal(h.state.user,null);
});
