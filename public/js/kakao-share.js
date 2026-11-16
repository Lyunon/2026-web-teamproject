import { KAKAO_JAVASCRIPT_KEY, SDK_URL, SDK_INTEGRITY, createSharePayload } from './kakao-share-data.js';

let sdkPromise;
export function loadKakaoSDK() {
  if (typeof window.Kakao?.init === 'function' && typeof window.Kakao?.isInitialized === 'function') return Promise.resolve(window.Kakao);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.integrity = SDK_INTEGRITY;
    script.crossOrigin = 'anonymous';
    script.async = true;
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('카카오톡 공유 기능을 불러오지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.')); };
    const timer = setTimeout(fail, 10000);
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (typeof window.Kakao?.init === 'function' && typeof window.Kakao?.isInitialized === 'function') resolve(window.Kakao);
      else fail();
    };
    document.head.append(script);
  }).catch(error => { sdkPromise = null; throw error; });
  return sdkPromise;
}

export function mountKakaoShare(result) {
  const button = document.getElementById('btn-kakao-share');
  const message = document.getElementById('share-message');
  const preview = document.getElementById('share-preview');
  if (!button || !message || !preview) return;
  let payload;
  try { payload = createSharePayload(result); }
  catch (error) { message.textContent = error.message; return; }
  preview.textContent = payload.text;
  preview.hidden = false;
  let sdk = null;
  async function prepare() {
    button.disabled = true;
    message.textContent = '카카오톡 공유를 준비하고 있어요…';
    try {
      sdk = await loadKakaoSDK();
      if (!sdk.isInitialized()) sdk.init(KAKAO_JAVASCRIPT_KEY);
      if (typeof sdk.Share?.sendDefault !== 'function') throw new Error('카카오톡 공유 초기화에 실패했어요. 페이지를 새로고침해 주세요.');
      button.textContent = '카카오톡으로 결과 공유';
      message.textContent = '닉네임과 플레이 기록이 공유됩니다. 범인과 해설은 포함하지 않아요.';
    } catch (error) {
      sdk = null;
      button.textContent = '공유 다시 준비하기';
      message.textContent = error.message;
    } finally { button.disabled = false; }
  }
  button.addEventListener('click', () => {
    if (!sdk) { void prepare(); return; }
    button.disabled = true;
    const fail = () => { message.textContent = '공유를 열지 못했어요. 팝업 허용과 인터넷 연결을 확인한 뒤 다시 시도해 주세요.'; };
    try {
      // 클릭 이벤트 안에서 동기 호출: SDK 로드나 서버 요청을 여기서 기다리지 않는다.
      const request = sdk.Share.sendDefault(payload);
      message.textContent = '카카오톡 공유 화면에서 받을 친구나 대화방을 선택해 주세요.';
      if (request?.catch) request.catch(fail);
    } catch { fail(); }
    // SDK 호출은 실제 메시지 전송 성공 확인이 아니다.
    setTimeout(() => { button.disabled = false; }, 1500);
  });
  void prepare();
}
