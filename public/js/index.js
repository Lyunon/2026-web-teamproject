// public/js/index.js - 소셜 로그인(Google / Naver) 목업 이벤트
document.addEventListener('DOMContentLoaded', () => {
  const googleBtn = document.getElementById('btn-login-google');
  const naverBtn = document.getElementById('btn-login-naver');

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      // 추후 Firebase Google Auth 연동 위치
      localStorage.setItem('mock_user_provider', 'Google');
      window.location.href = './cases.html';
    });
  }

  if (naverBtn) {
    naverBtn.addEventListener('click', () => {
      // 추후 Naver OAuth 커스텀 토큰 연동 위치
      localStorage.setItem('mock_user_provider', 'Naver');
      window.location.href = './cases.html';
    });
  }
});
