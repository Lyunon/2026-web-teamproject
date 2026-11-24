// 사건 생성 팝업(브라우저)과 사건 생성 서버(api/generate.js)가 함께 쓰는 장르·난이도 정의.
// DOM이나 Node 전용 API를 쓰지 않는 순수 데이터만 둔다.

// sceneTheme 은 play.js 의 SCENE_THEME_BACKGROUNDS 키와 같아야 한다.
export const GENRES = [
  { id: 'mansion', icon: '🏚️', label: '저택 살인', sceneTheme: 'mansion_study',
    desc: '폭우로 고립된 저택, 가족과 고용인 사이에 숨은 거짓말' },
  { id: 'gallery', icon: '🖼️', label: '미술관 도난', sceneTheme: 'art_gallery',
    desc: '철통 보안 속에서 사라진 보석, 내부 관계자의 소행' },
  { id: 'train', icon: '🚆', label: '열차 밀실', sceneTheme: 'luxury_train',
    desc: '눈 속을 달리는 특급열차 안에서 벌어진 사건' },
];
export const RANDOM_GENRE = { id: 'random', icon: '🎲', label: '랜덤', desc: '장르를 Gemini 생성 시점에 무작위로 고릅니다' };

export const DIFFICULTIES = [
  { id: 'easy', label: '쉬움', stars: '★☆☆☆', desc: '용의자 3명 · 진술 모순 1개 · 단서 연결이 짧음' },
  { id: 'normal', label: '보통', stars: '★★☆☆', desc: '용의자 4명 · 모순 2개 · 가짜 단서가 섞임' },
  { id: 'hard', label: '어려움', stars: '★★★☆', desc: '용의자 5명 · 모순 3개 · 무고한 사람도 거짓말을 함' },
  { id: 'expert', label: '매우어려움', stars: '★★★★', desc: '용의자 6명 · 모순 4개 · 단서가 5단계로 이어지고 첫 단서가 적음' },
];

export const genreById = (id) => GENRES.find((g) => g.id === id) || null;
export const difficultyById = (id) => DIFFICULTIES.find((d) => d.id === id) || null;
