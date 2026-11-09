// public/js/cases.js - 사건 목록 및 Gemini API 에피소드 생성 목업 이벤트
document.addEventListener('DOMContentLoaded', () => {
  const provider = localStorage.getItem('mock_user_provider');
  const userDisplay = document.getElementById('user-display');
  if (provider && userDisplay) {
    userDisplay.textContent = `접속 수사관: 김형사님 (${provider} 로그인됨)`;
  }

  const genBtn = document.getElementById('btn-generate-episode');
  const episodeList = document.getElementById('episode-list');

  let episodeCount = 4;

  if (genBtn && episodeList) {
    genBtn.addEventListener('click', () => {
      // 추후 Gemini API (/api/session/start 등) 연동 위치
      const epNum = String(episodeCount).padStart(2, '0');
      const card = document.createElement('article');
      card.className = 'episode-card';
      card.innerHTML = `
        <div>
          <div class="episode-meta">
            <span class="episode-tag">EPISODE ${epNum} · Gemini 생성 사건</span>
            <span class="episode-difficulty">난이도 ★★★★☆</span>
          </div>
          <h2>안개 낀 항구 창고의 총성</h2>
          <p class="episode-desc">
            새벽 2시, 봉쇄된 제4부두 보세창고 내부에서 밀수품 거래 중이던 정보원이 쓰러졌습니다. 현장에 있던 용의자 3명의 진술을 대조하세요.
          </p>
        </div>
        <div class="episode-Start-wrap">
          <a href="./play.html?case=case-${epNum}" class="btn btn-primary">수사 시작</a>
        </div>
      `;
      episodeList.prepend(card);
      episodeCount += 1;
    });
  }
});
