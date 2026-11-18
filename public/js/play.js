// detective-visual-scene-v5/public/js/play.js
// 에피소드 JSON(scene.theme + scene.hotspots)에 따라 사건 현장 배경 일러스트와 온클릭 증거 오브젝트가 동적으로 변경되는 엔진

// 1. 배경 테마별 방 일러스트 SVG 템플릿 (저택 서재 / 미술관 전시실 / 특급열차 객실)
const SCENE_THEME_BACKGROUNDS = {
  mansion_study: `
    <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="mWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#141a26" /><stop offset="100%" stop-color="#1d2536" />
        </linearGradient>
        <linearGradient id="mFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#231915" /><stop offset="100%" stop-color="#120c0a" />
        </linearGradient>
        <radialGradient id="mGlow" cx="52%" cy="42%" r="48%">
          <stop offset="0%" stop-color="rgba(240, 188, 130, 0.22)" /><stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1280" height="450" fill="url(#mWall)" />
      <polygon points="0,0 190,70 190,430 0,530" fill="#161d2b" stroke="#2a3346" stroke-width="2" />
      <polygon points="1280,0 1060,70 1060,430 1280,530" fill="#151c29" stroke="#2a3346" stroke-width="2" />
      <rect x="190" y="320" width="870" height="110" fill="#261b18" stroke="#3b2a24" stroke-width="2" />
      <polygon points="0,530 190,430 1060,430 1280,530 1280,680 0,680" fill="url(#mFloor)" />
      <polygon points="210,470 980,470 1120,655 110,655" fill="#3b161d" stroke="#8c583a" stroke-width="3" />
      <!-- 배경 책장 & 서재 책상 -->
      <rect x="640" y="85" width="170" height="235" fill="#231714" stroke="#3d2923" stroke-width="3" />
      <polygon points="480,380 850,380 900,435 440,435" fill="#422a20" stroke="#634133" stroke-width="2.5" />
      <rect x="445" y="435" width="450" height="145" fill="#2d1b14" stroke="#4f3328" stroke-width="2" />
      <rect x="0" y="0" width="1280" height="680" fill="url(#mGlow)" pointer-events="none" />
    </svg>
  `,
  art_gallery: `
    <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b" /><stop offset="100%" stop-color="#090d16" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1280" height="440" fill="url(#gWall)" />
      <polygon points="0,0 200,80 200,440 0,540" fill="#131c31" stroke="#334155" stroke-width="2" />
      <polygon points="1280,0 1080,80 1080,440 1280,540" fill="#131c31" stroke="#334155" stroke-width="2" />
      <!-- 대리석 바닥 타일 -->
      <polygon points="0,540 200,440 1080,440 1280,540 1280,680 0,680" fill="url(#gFloor)" stroke="#475569" stroke-width="2" />
      <!-- 미술관 벽면 액자들 -->
      <rect x="270" y="130" width="140" height="180" fill="#172554" stroke="#e0a96d" stroke-width="4" />
      <rect x="870" y="130" width="140" height="180" fill="#31102f" stroke="#e0a96d" stroke-width="4" />
      <!-- 천장 스포트라이트 빔 -->
      <polygon points="640,0 490,560 790,560" fill="rgba(56, 189, 248, 0.10)" />
      <!-- 붉은 보안 레이저 라인 연출 -->
      <line x1="200" y1="390" x2="1080" y2="390" stroke="rgba(239, 68, 68, 0.45)" stroke-width="2" stroke-dasharray="8,6" />
      <line x1="200" y1="240" x2="1080" y2="490" stroke="rgba(239, 68, 68, 0.35)" stroke-width="1.5" stroke-dasharray="6,6" />
    </svg>
  `,
  luxury_train: `
    <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="tWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f1614" /><stop offset="100%" stop-color="#33221d" />
        </linearGradient>
      </defs>
      <!-- 열차 원목 객실 벽면 -->
      <rect x="0" y="0" width="1280" height="460" fill="url(#tWall)" />
      <!-- 열차 천장 아치 몰딩 -->
      <path d="M0,70 Q640,10 1280,70" fill="none" stroke="#c89654" stroke-width="4" />
      <rect x="0" y="340" width="1280" height="120" fill="#241713" stroke="#784f37" stroke-width="2" />
      <!-- 열차 카펫 바닥 -->
      <polygon points="0,460 1280,460 1280,680 0,680" fill="#1b263b" stroke="#c89654" stroke-width="3" />
      <!-- 좌측 침대칸 소파 구조물 -->
      <rect x="90" y="350" width="360" height="150" rx="14" fill="#4a1525" stroke="#8c3b4f" stroke-width="3" />
    </svg>
  `
};

// 2. 재사용 가능한 오브젝트 아이콘 SVG 프리셋 라이브러리 (Gemini가 iconType만 지정하면 자동 렌더링)
const OBJECT_SVG_LIBRARY = {
  door: `<svg width="90" height="170" viewBox="0 0 92 185"><polygon points="8,15 84,5 84,165 8,180" fill="#2b1b15" stroke="#e0a96d" stroke-width="2.5"/><polygon points="14,20 74,12 74,160 14,172" fill="#3d261c"/><polygon points="74,12 80,10 80,162 74,160" fill="#f0bc82" opacity="0.75"/><circle cx="63" cy="95" r="5.5" fill="#f0bc82"/></svg>`,
  window: `<svg width="130" height="155" viewBox="0 0 135 175"><rect x="6" y="6" width="123" height="163" rx="8" fill="#0d1726" stroke="#60a5fa" stroke-width="3.5"/><line x1="67" y1="6" x2="67" y2="169" stroke="#364459" stroke-width="4"/><line x1="6" y1="88" x2="129" y2="88" stroke="#364459" stroke-width="4"/><line x1="35" y1="30" x2="22" y2="70" stroke="#93c5fd" stroke-width="2.5"/><line x1="95" y1="95" x2="82" y2="135" stroke="#93c5fd" stroke-width="2.5"/></svg>`,
  medicine_cabinet: `<svg width="112" height="130" viewBox="0 0 115 135"><rect x="8" y="8" width="99" height="118" rx="6" fill="#2f2019" stroke="#e0a96d" stroke-width="2.5"/><rect x="16" y="16" width="83" height="102" fill="#192836"/><line x1="16" y1="68" x2="99" y2="68" stroke="#526880" stroke-width="2"/><rect x="52" y="24" width="11" height="25" fill="#e05a5a"/><rect x="44" y="32" width="27" height="9" fill="#e05a5a"/><rect x="30" y="80" width="22" height="32" rx="4" fill="#d97b29" stroke="#fff" stroke-width="1.5"/><rect x="32" y="88" width="18" height="14" fill="#fff"/></svg>`,
  armchair: `<svg width="140" height="150" viewBox="0 0 150 165"><rect x="32" y="14" width="86" height="95" rx="18" fill="#4f221d" stroke="#e0a96d" stroke-width="2.5"/><rect x="14" y="62" width="26" height="62" rx="10" fill="#3d1915"/><rect x="110" y="62" width="26" height="62" rx="10" fill="#3d1915"/><rect x="30" y="88" width="90" height="36" rx="8" fill="#5e2923"/><polygon points="75,55 95,90 55,90" fill="#f5c542" stroke="#12151c" stroke-width="2"/><text x="75" y="84" text-anchor="middle" fill="#12151c" font-size="16" font-weight="900">1</text></svg>`,
  tray: `<svg width="112" height="80" viewBox="0 0 115 82"><ellipse cx="57" cy="60" rx="50" ry="15" fill="#8b95a5" stroke="#fff" stroke-width="2"/><path d="M32,22 C26,42 52,42 46,22 Z" fill="rgba(224,169,109,0.4)" stroke="#fff" stroke-width="2"/><line x1="39" y1="38" x2="39" y2="55" stroke="#fff" stroke-width="2"/><rect x="62" y="44" width="28" height="18" rx="3" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/></svg>`,
  document: `<svg width="115" height="84" viewBox="0 0 120 86"><rect x="20" y="14" width="66" height="56" rx="3" fill="#f8fafc" stroke="#e0a96d" stroke-width="2.5" transform="rotate(6 53 42)"/><line x1="30" y1="28" x2="72" y2="32" stroke="#334155" stroke-width="2.5"/><line x1="29" y1="38" x2="68" y2="42" stroke="#64748b" stroke-width="2"/><line x1="78" y1="22" x2="98" y2="64" stroke="#e0a96d" stroke-width="5" stroke-linecap="round"/></svg>`,
  drawer: `<svg width="138" height="74" viewBox="0 0 145 78"><rect x="8" y="10" width="129" height="56" rx="5" fill="#362118" stroke="#e0a96d" stroke-width="2.5"/><rect x="16" y="17" width="113" height="42" fill="#291811"/><circle cx="72" cy="32" r="6" fill="#e0a96d"/><path d="M56,42 Q72,54 88,42" fill="none" stroke="#e0a96d" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  cctv: `<svg width="155" height="115" viewBox="0 0 165 125"><rect x="8" y="8" width="149" height="98" rx="7" fill="#1e2533" stroke="#e0a96d" stroke-width="2.5"/><rect x="15" y="15" width="66" height="40" fill="#0d2124"/><rect x="84" y="15" width="66" height="40" fill="#0d2124"/><rect x="15" y="58" width="66" height="40" fill="#0d2124"/><rect x="84" y="58" width="66" height="40" fill="#0d2124"/><text x="20" y="32" fill="#3ecf8e" font-size="9" font-family="monospace">CAM 01</text><text x="89" y="32" fill="#3ecf8e" font-size="9" font-family="monospace">CAM 02</text><text x="20" y="75" fill="#e05a5a" font-size="9" font-family="monospace">CAM 03</text><text x="89" y="75" fill="#3ecf8e" font-size="9" font-family="monospace">CAM 04</text></svg>`,
  bag: `<svg width="138" height="115" viewBox="0 0 145 120"><path d="M52,30 C52,12 93,12 93,30" fill="none" stroke="#4a2518" stroke-width="6"/><rect x="18" y="28" width="109" height="76" rx="14" fill="#592c1c" stroke="#e0a96d" stroke-width="2.5"/><rect x="65" y="46" width="15" height="18" rx="3" fill="#f0bc82"/><circle cx="72" cy="80" r="12" fill="#2b140c"/><rect x="69" y="73" width="6" height="14" fill="#e05a5a"/><rect x="65" y="77" width="14" height="6" fill="#e05a5a"/></svg>`,
  glass_dome: `<svg width="135" height="165" viewBox="0 0 135 165"><path d="M25,95 L25,52 C25,14 110,14 110,52 L110,95 Z" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="3"/><rect x="18" y="95" width="99" height="58" rx="4" fill="#1e293b" stroke="#e0a96d" stroke-width="2.5"/><polygon points="67,55 82,72 67,86 52,72" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2"/></svg>`,
  vent: `<svg width="110" height="80" viewBox="0 0 110 80"><rect x="8" y="8" width="94" height="64" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="3"/><line x1="20" y1="24" x2="90" y2="24" stroke="#475569" stroke-width="4"/><line x1="20" y1="40" x2="90" y2="40" stroke="#475569" stroke-width="4"/><line x1="20" y1="56" x2="90" y2="56" stroke="#475569" stroke-width="4"/></svg>`
};

// 3. 멀티 에피소드 데이터베이스 (mansion-001 + gallery-002 + train-003)
const EPISODES_DB = {
  'mansion-001': {
    id: 'mansion-001',
    public: {
      title: '송림 저택의 마지막 밤',
      roomTitle: '송림 저택 2층 서재 & 보안 모니터실',
      sceneTheme: 'mansion_study',
      intro: '폭우로 길이 끊긴 송림 저택에서 강태산 회장이 숨진 채 발견되었다. 주치의는 심장마비라고 하지만, 회장은 어제까지 건강했고 이번 주에 유언장을 고치려 했다는 소문이 있다. 날이 밝아 도로가 열리기 전까지, 저택 안의 다섯 명 중 누군가의 거짓말을 찾아내야 한다.',
      suspects: [
        { id: 'butler', name: '박영찬', role: '집사', publicBio: '31년째 이 집을 지킨 집사. 말수가 적고 회장의 일과를 모두 알고 있다.' },
        { id: 'secretary', name: '한소영', role: '비서', publicBio: '5년째 회장을 보좌한 비서. 시신의 첫 발견자.' },
        { id: 'son', name: '강지훈', role: '장남', publicBio: '그룹 부사장. 아버지와 사이가 좋지 않았다는 소문이 있다.' },
        { id: 'wife', name: '윤세라', role: '회장의 부인', publicBio: '6년 전 재혼한 부인. 결혼 전에는 간호사였다.' },
        { id: 'doctor', name: '오진석', role: '주치의', publicBio: '20년 지기 주치의이자 재단병원 원장. 사망 직후 가장 먼저 달려왔다.' }
      ],
      clues: [
        { id: 'c01', title: '서재의 현장', location: '서재', role: '현장 기본', text: '회장이 안락의자에 기대어 숨져 있다. 외상은 없고 책상 위는 정돈되어 있다. 창문은 안에서 잠겨 있다.' },
        { id: 'c02', title: '취침 전 쟁반', location: '서재 책상', role: '현장 기본', text: '쟁반 위에 브랜디 잔과 약 포장지 한 장이 있다. 잔은 비어 있고 약은 이미 복용한 흔적이 있다.' },
        { id: 'c03', title: '고립된 저택', location: '저택 전체', role: '현장 기본', text: '18시에 폭우로 진입로가 통제되어 외부인은 들어올 수 없다. 저택 안에는 용의자 5명과 회장뿐이다.' }
      ],
      hotspots: [
        { mode: 'investigate', target: 'inner_door', clueId: 'c14', iconType: 'door', label: '🚪 서재의 안쪽 문 (c14)', x: 4.5, y: 24 },
        { mode: 'clue', clueId: 'c03', iconType: 'window', label: '🌧️ 폭우로 고립된 창밖 (c03)', x: 18, y: 9 },
        { mode: 'investigate', target: 'medicine_cabinet', clueId: 'c04', iconType: 'medicine_cabinet', label: '💊 서재 약장 (c04)', x: 35.5, y: 11 },
        { mode: 'clue', clueId: 'c01', iconType: 'armchair', label: '🪑 안락의자 현장 (c01)', x: 19.5, y: 44 },
        { mode: 'clue', clueId: 'c02', iconType: 'tray', label: '🍷 취침 전 쟁반 (c02)', x: 38.5, y: 43 },
        { mode: 'investigate', target: 'study_desk', clueId: 'c07', iconType: 'document', label: '📄 서재 책상 위 유언장 (c07)', x: 53.5, y: 42 },
        { mode: 'investigate', target: 'desk_drawer', clueId: 'c10', iconType: 'drawer', label: '🗄️ 서재 책상 서랍 (c10)', x: 55.5, y: 64 },
        { mode: 'investigate', target: 'cctv', clueId: 'c06', iconType: 'cctv', label: '📹 보안실 복도 CCTV (c06)', x: 75.5, y: 10 },
        { mode: 'investigate', target: 'doctor_bag', clueId: 'c13', iconType: 'bag', label: '🧰 오진석의 의료 가방 (c13)', x: 77, y: 56 }
      ]
    },
  },

  'gallery-002': {
    id: 'gallery-002',
    public: {
      title: '사라진 푸른 다이아몬드',
      roomTitle: '국립미술관 제1보석전시실 (야간 특별 보안 구역)',
      sceneTheme: 'art_gallery',
      intro: '자선 경매 개막 10분 전, 철통 보안을 자랑하던 중앙 유리 돔 진열대 안의 [푸른 다이아몬드]가 감쪽같이 사라졌다. 외부 침입 흔적은 없으며 전시실 출입 권한을 가진 내부 관계자 3명을 조사해야 한다.',
      suspects: [
        { id: 'curator', name: '정유진', role: '수석 큐레이터', publicBio: '전시 기획 총괄. 보석 진열대 마스터키와 보안 해제 코드를 관리한다.' },
        { id: 'guard', name: '마동석', role: '보안팀장', publicBio: '전시실 레이저 센서와 CCTV 관제실을 담당하는 보안 책임자.' },
        { id: 'appraiser', name: '최현우', role: '보석 감정사', publicBio: '경매 직전 보석의 최종 진위 감정을 위해 전시실에 단독 출입했다.' }
      ],
      clues: [
        { id: 'g01', title: '빈 유리 돔 진열대', location: '전시실 중앙', role: '현장 기본', text: '유리 돔은 깨지지 않고 정식 마스터 코드로 열렸다가 닫힌 상태다.' }
      ],
      hotspots: [
        { mode: 'investigate', target: 'glass_dome', clueId: 'g02', iconType: 'glass_dome', label: '💎 중앙 유리 돔 진열대 (g02)', x: 44, y: 36 },
        { mode: 'investigate', target: 'vent_grille', clueId: 'g03', iconType: 'vent', label: '🌀 벽면 환풍구 그릴 (g03)', x: 14, y: 20 },
        { mode: 'investigate', target: 'laser_cctv', clueId: 'g04', iconType: 'cctv', label: '📹 레이저 보안 관제 모니터 (g04)', x: 76, y: 14 },
        { mode: 'investigate', target: 'curator_drawer', clueId: 'g06', iconType: 'drawer', label: '🗄️ 큐레이터 잠긴 보관함 (g06)', x: 18, y: 60 },
        { mode: 'investigate', target: 'appraiser_bag', clueId: 'g07', iconType: 'bag', label: '🧰 감정사의 감정 가방 (g07)', x: 76, y: 58 }
      ]
    },
    secret: {
      culprit: 'appraiser',
      clues: {
        g02: { id: 'g02', title: '진열대 미세 백색 가루', location: '중앙 진열대', role: '핵심', text: '보석 받침대 위에 보석 감정용 루페 세척제 성분의 특수 가루가 묻어 있다.' },
        g03: { id: 'g03', title: '환풍구 내부 먼지', location: '전시실 벽면', role: '유도', text: '환풍구 나사는 풀려 있으나 내부 먼지가 그대로여서 사람이 통과한 적은 없다.' },
        g04: { id: 'g04', title: '보안 센서 3분 공백 로그', location: '관제 모니터', role: '핵심', text: '19:40~19:43 사이 정기 점검 명목으로 레이저 센서가 3분간 수동 해제되었다.' },
        g05: { id: 'g05', title: '감정 시간 연장 요청서', location: '큐레이터 진술', role: '핵심', text: "최현우 감정사가 '재감정이 필요하다'며 19:40에 보안 해제를 요청한 기록이다." },
        g06: { id: 'g06', title: '가짜 모조품 거래 계약서', location: '큐레이터 보관함', role: '핵심(동기)', text: '최현우 감정사가 해외 밀수 조직에 진품 다이아몬드를 넘기기로 한 비밀 각서다.' },
        g07: { id: 'g07', title: '이중 바닥 속 푸른 다이아몬드', location: '감정사의 가방', role: '결정적 증거', text: '감정 장비 가방의 이중 바닥 속에서 사라진 진품 푸른 다이아몬드가 발견되었다!' }
      },
      unlockRules: [
        { clueId: 'g02', type: 'investigate', target: 'glass_dome' },
        { clueId: 'g03', type: 'investigate', target: 'vent_grille' },
        { clueId: 'g04', type: 'investigate', target: 'laser_cctv' },
        { clueId: 'g05', type: 'ask', suspect: 'curator', keywords: ['코드', '시간', '해제', '감정', '19:40'] },
        { clueId: 'g06', type: 'investigate', target: 'curator_drawer', requires: ['g05'] },
        { clueId: 'g07', type: 'investigate', target: 'appraiser_bag', requires: ['g02', 'g04'] }
      ],
      hints: [
        '진열대(g02)와 보안 모니터(g04)를 먼저 클릭해 단서를 확보하세요.',
        '큐레이터 정유진에게 "코드"나 "해제"를 질문하면 g05를 얻어 잠긴 보관함(g06)을 열 수 있습니다.',
        'g02와 g04를 모두 모으면 감정사의 가방(g07)을 수색할 수 있습니다.'
      ],
      solutionExplain: '범인은 보석 감정사 최현우다. 재감정을 핑계로 19:40에 3분간 보안 센서를 해제하게 한 뒤 진품 다이아몬드를 감정 가방 이중 바닥에 숨겼다.'
    }
  },

  'train-003': {
    id: 'train-003',
    public: {
      title: '설원 특급열차 3호실의 비밀',
      roomTitle: '설원 횡단 특급열차 VIP 3호 침대 객실',
      sceneTheme: 'luxury_train',
      intro: '폭설 속을 달리는 특급열차 VIP 3호실에서 외교 특사가 의식을 잃고 쓰러진 채 발견되었고 극비 외교 문서가 사라졌다. 종착역 도착 전까지 열차 내 용의자 3명을 조사해 범인을 찾아야 한다.',
      suspects: [
        { id: 'attendant', name: '김도윤', role: '열차 승무원', publicBio: 'VIP 객실 전담 승무원. 와인 서비스와 객실 마스터키를 관리한다.' },
        { id: 'diplomat_aide', name: '서지안', role: '특사 수행비서', publicBio: '외교 특사를 수행하며 암호 서류가방의 보조 키를 소지하고 있다.' },
        { id: 'journalist', name: '한태오', role: '특종 기자', publicBio: '우연히 옆 객실(4호실)에 탑승한 탐사보도 전문 기자.' }
      ],
      clues: [
        { id: 't01', title: '열차 창밖의 폭설', location: '객실 창문', role: '현장 기본', text: '시속 150km로 설원을 달리는 중이라 열차 밖으로의 탈출은 불가능하다.' }
      ],
      hotspots: [
        { mode: 'clue', clueId: 't01', iconType: 'window', label: '❄️ 설원 열차 객실 창문 (t01)', x: 44, y: 12 },
        { mode: 'investigate', target: 'wine_trolley', clueId: 't02', iconType: 'tray', label: '🍷 객실 와인 서비스 쟁반 (t02)', x: 22, y: 48 },
        { mode: 'investigate', target: 'intercom_cctv', clueId: 't03', iconType: 'cctv', label: '📹 객실 통로 인터폰/CCTV (t03)', x: 76, y: 14 },
        { mode: 'investigate', target: 'compartment_door', clueId: 't04', iconType: 'door', label: '🚪 옆 객실 연결 통로문 (t04)', x: 6, y: 24 },
        { mode: 'investigate', target: 'aide_briefcase', clueId: 't06', iconType: 'bag', label: '🧰 수행비서의 암호 가방 (t06)', x: 74, y: 58 }
      ]
    },
    secret: {
      culprit: 'diplomat_aide',
      clues: {
        t02: { id: 't02', title: '수면제가 든 뱅쇼 잔', location: '와인 쟁반', role: '핵심', text: '특사가 마신 따뜻한 뱅쇼 잔 바닥에서 강력한 수면 유도제 성분이 검출되었다.' },
        t03: { id: 't03', title: '객실 복도 출입 기록', location: '통로 모니터', role: '핵심', text: '22:15 승무원 퇴실 이후 복도 문으로 들어온 사람은 아무도 없다.' },
        t04: { id: 't04', title: '내부 연결문 열쇠 흔적', location: '연결 통로문', role: '핵심', text: '수행비서가 머무는 보조실과 연결된 내부 문이 보조 키로 열린 흔적이 있다.' },
        t05: { id: 't05', title: '승무원의 와인 전달 진술', location: '승무원 진술', role: '핵심', text: "승무원은 '뱅쇼를 직접 전달하려 했으나 서지안 비서가 문 앞에서 대신 받아 들어갔다'고 증언했다." },
        t06: { id: 't06', title: '비서 가방 속 극비 외교 문서', location: '수행비서의 가방', role: '결정적 증거', text: '서지안 비서의 가방 안감 속에서 사라졌던 극비 외교 문서 원본과 남은 수면제 캡슐이 발견되었다!' }
      },
      unlockRules: [
        { clueId: 't02', type: 'investigate', target: 'wine_trolley' },
        { clueId: 't03', type: 'investigate', target: 'intercom_cctv' },
        { clueId: 't04', type: 'investigate', target: 'compartment_door' },
        { clueId: 't05', type: 'ask', suspect: 'attendant', keywords: ['와인', '뱅쇼', '쟁반', '전달', '비서'] },
        { clueId: 't06', type: 'investigate', target: 'aide_briefcase', requires: ['t02', 't04'] }
      ],
      hints: [
        '와인 쟁반(t02)과 옆 객실 연결 통로문(t04)을 클릭해 조사하세요.',
        't02와 t04를 확보하면 수행비서의 암호 가방(t06) 잠금이 해제됩니다.',
        '승무원 김도윤에게 "와인"이나 "쟁반"을 물어보세요.'
      ],
      solutionExplain: '범인은 수행비서 서지안이다. 승무원이 가져온 뱅쇼를 대신 받아 수면제를 탄 뒤, 복도 CCTV를 피해 보조실 내부 연결문(t04)으로 침입해 극비 문서를 훔쳤다.'
    }
  }
};

// public/js/play.js 의 `document.addEventListener('DOMContentLoaded', ...` 부터 파일 끝까지를 이 코드로 교체한다.
// (위쪽 SCENE_THEME_BACKGROUNDS, OBJECT_SVG_LIBRARY, EPISODES_DB 는 그대로 두되, EPISODES_DB 에서 secret 을 지운다.)
// 서버 API: /api/start, /api/investigate, /api/ask, /api/hint, /api/accuse
document.addEventListener('DOMContentLoaded', async () => {
  const authUser = await window.authReady; // guard.js 가 로그인·가입을 먼저 확인한다
  if (!authUser) return;
  const { canAccuse, createPlayClock, validCount } = await import('./scoring.js');
  const uid = authUser.uid;
  const CASE_ID = 'mansion-001';
  const STORAGE_KEY = `case_state_${uid}_${CASE_ID}`; // 계정마다 저장을 나눈다

  // 현장 배치(배경, 오브젝트 위치)만 쓴다. 정답·해금 규칙은 서버에만 있다.
  const view = EPISODES_DB[CASE_ID].public;

  const $ = (id) => document.getElementById(id);
  const screens = {
    notebook: { el: $('screen-notebook'), label: '사건 수첩' },
    scene: { el: $('screen-scene'), label: '사건 현장 탐색' },
    interrogate: { el: $('screen-interrogate'), label: '용의자 심문실' },
  };

  // ---------- 상태 (개발 모드: 브라우저가 보관, 요청마다 서버로 보낸다) ----------
  let startData = null;
  let suspects = [];
  let allCluesMap = {};
  let unlockedClueIds = new Set();
  let investigatedTargets = new Set();
  let currentSuspectId = '';
  let selectedClueIdForChat = '';
  let chatLogs = {};     // 화면 표시용 { suspectId: [{role:'user'|'model'|'system'|'error', ...}] }
  let apiHistory = {};   // 서버에 되돌려 보내는 대화 기록 { suspectId: [{role, text}] }
  let hintCount = 0;
  let hintsShown = [];
  let elapsedSeconds = 0;
  let investigating = false;
  let asking = false;

  // ---------- 작은 도우미 ----------
  function mk(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  const toast = (msg) => { $('scene-stage-toast').textContent = msg; };
  const cleanLabel = (label) => String(label || '').replace(/\s*\(c\d+\)\s*/gi, ' ').trim();

  async function api(path, body) {
    let res;
    try {
      res = await fetch(`/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    let json;
    try { json = await res.json(); } catch { throw new Error('서버 응답을 읽을 수 없습니다.'); }
    if (!json.ok) throw new Error(json.error || '요청을 처리하지 못했습니다.');
    return json.data;
  }

  // 서버가 주는 단서 필드 이름이 달라도 화면이 깨지지 않도록 맞춰 준다.
  function normClue(c) {
    return {
      id: c.id,
      title: c.title || '',
      location: c.location || '',
      role: c.role || '',
      text: c.text ?? c.publicText ?? c.body ?? '',
    };
  }
  function addClues(list) {
    const added = [];
    for (const raw of list || []) {
      const c = normClue(raw);
      const isNew = !unlockedClueIds.has(c.id);
      allCluesMap[c.id] = c;
      unlockedClueIds.add(c.id);
      if (isNew) added.push(c);
    }
    return added;
  }

  // ---------- 저장 / 복원 ----------
    // 이 브라우저(localStorage)에는 즉시, Firestore 에는 save.js 가 모아서 저장한다.
  let ready = false; // 저장본을 불러오기 전에는 저장하지 않는다 (빈 상태로 덮어쓰기 방지)
  function snapshot() {
    return {
      clues: Array.from(unlockedClueIds).map((id) => allCluesMap[id]).filter(Boolean),
      unlocked: Array.from(unlockedClueIds),
      investigated: Array.from(investigatedTargets),
      chatLogs, apiHistory, hintCount, hintsShown, elapsedSeconds,
    };
  }
  function save() {
    if (!ready) return;
    const s = snapshot();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
    } catch { /* 저장 공간이 없으면 건너뜀 */ }
    window.cloudSave?.schedule(s);
  }
  function applySave(s) {
    try {
      const saved = new Map((s.clues || []).map((c) => [c.id, c]));
      (s.unlocked || []).forEach((id) => {
        if (saved.has(id)) { allCluesMap[id] = normClue(saved.get(id)); unlockedClueIds.add(id); }
      });
      investigatedTargets = new Set(s.investigated || []);
      for (const sp of suspects) {
        if (Array.isArray(s.chatLogs?.[sp.id])) chatLogs[sp.id] = s.chatLogs[sp.id];
        if (Array.isArray(s.apiHistory?.[sp.id])) apiHistory[sp.id] = s.apiHistory[sp.id];
      }
      hintCount = validCount(s.hintCount) ? s.hintCount : 0;
      hintsShown = Array.isArray(s.hintsShown) ? s.hintsShown : [];
      elapsedSeconds = validCount(s.elapsedSeconds) ? s.elapsedSeconds : 0;
    } catch { /* 저장본이 깨졌으면 무시 */ }
  }
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }
  // 이 브라우저와 클라우드 중 더 최근 저장본을 고르고, 이어할지 묻는다.
  async function restoreLatest() {
    const local = readLocal();
    window.cloudSave?.init(uid, CASE_ID);
    const cloud = await window.cloudSave?.load(); // { savedAt, state } 또는 null
    let pick = local;
    let at = Number(local?.savedAt) || 0;
    if (cloud && cloud.savedAt > at) { pick = cloud.state; at = cloud.savedAt; }
    const has = window.cloudSave ? window.cloudSave.hasProgress(pick) : Boolean(pick);
    if (has) {
      const when = at ? new Date(at).toLocaleString('ko-KR') : '알 수 없음';
      if (confirm(`저장된 진행 상황이 있습니다. (마지막 저장: ${when})\n이어서 할까요? [취소]를 누르면 처음부터 시작합니다.`)) {
        applySave(pick);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        await window.cloudSave?.clear(false); // 새 게임은 계속 저장한다
      }
    }
    ready = true;
  }


  // ---------- 타이머 ----------
  const timerDisplay = $('timer-display');
  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  let clock = null;
  let timerInterval = null;
  let finished = false;
  const accuseButton = $('btn-open-accuse');
  function updateTimer() {
    if (clock && !finished) elapsedSeconds = clock();
    if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);
    const enabled = ready && canAccuse(elapsedSeconds) && !finished;
    if (accuseButton) {
      accuseButton.disabled = !enabled;
      accuseButton.textContent = enabled ? '🚨 범인 지목하기' :
        `🔒 범인 지목까지 ${formatTime(Math.max(0, 60 - elapsedSeconds))}`;
    }
  }
  function persistTime() {
    if (!ready || finished) return;
    updateTimer();
    save();
    void window.cloudSave?.flush(true);
  }
  window.addEventListener('pagehide', persistTime);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistTime();
  });
  updateTimer();

  // ---------- 화면 전환 ----------
  function switchScreen(key) {
    if (!screens[key]) return;
    Object.keys(screens).forEach((k) => screens[k].el.classList.toggle('active', k === key));
    $('current-screen-badge').textContent = `현재 화면: ${screens[key].label}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.getAttribute('data-goto')));
  });

  // ---------- 목록 항목 ----------
  function selectableItem({ icon, strong, sub, selected, onClick }) {
    const li = document.createElement('li');
    const btn = mk('button', `selectable-item${selected ? ' selected' : ''}`);
    btn.type = 'button';
    const left = document.createElement('span');
    left.append(`${icon} `, mk('strong', null, strong));
    btn.append(left, mk('span', 'item-sub', sub));
    btn.addEventListener('click', onClick);
    li.appendChild(btn);
    return li;
  }

  // ---------- 현장 오브젝트 ----------
  function renderHotspots() {
    const container = $('dynamic-scene-hotspots');
    container.innerHTML = '';
    view.hotspots.forEach((hs) => {
      const btn = mk('button', 'scene-hotspot');
      btn.type = 'button';
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      const done = hs.mode === 'clue' || investigatedTargets.has(hs.target);
      btn.classList.add(done ? 'state-done' : 'state-ready');

      const visual = mk('div', 'hotspot-visual');
      visual.appendChild(mk('span', 'hotspot-pulse', done ? '✔' : '🔎'));
      const svgHolder = document.createElement('div');
      svgHolder.innerHTML = OBJECT_SVG_LIBRARY[hs.iconType] || OBJECT_SVG_LIBRARY.document; // 우리가 만든 정적 SVG
      visual.appendChild(svgHolder);
      btn.append(visual, mk('span', 'hotspot-label', cleanLabel(hs.label)));

      btn.addEventListener('click', () => onHotspot(hs));
      container.appendChild(btn);
    });
  }

  async function onHotspot(hs) {
    if (hs.mode === 'clue') {
      const clue = allCluesMap[hs.clueId];
      if (clue) openClueCloseupModal(clue, false, hs.iconType);
      return;
    }
    if (investigating) return;
    investigating = true;
    try {
      const r = await api('investigate', {
        caseId: CASE_ID,
        target: hs.target,
        unlocked: Array.from(unlockedClueIds),
      });
      if (r.status === 'FOUND') {
        investigatedTargets.add(hs.target);
        const added = addClues(r.newClues);
        syncAllViews();
        save();
        const clue = added[0] || allCluesMap[r.newClues?.[0]?.id];
        if (clue) {
          toast(`✨ 현장에서 [${clue.id}] "${clue.title}" 단서를 발견해 사건 수첩에 기록했습니다!`);
          openClueCloseupModal(clue, true, hs.iconType);
        }
      } else if (r.status === 'ALREADY') {
        investigatedTargets.add(hs.target);
        syncAllViews();
        save();
        const clue = hs.clueId ? allCluesMap[hs.clueId] : null;
        if (clue) openClueCloseupModal(clue, false, hs.iconType);
        else toast(r.message);
      } else if (r.status === 'LOCKED') {
        openLockedSpotModal(hs, r.message);
      } else {
        toast(r.message || '조사할 만한 것이 없다.');
      }
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    } finally {
      investigating = false;
    }
  }

  function syncAllViews() {
    renderHotspots();
    renderNotebookClues();
    renderInterrogateClues();
    renderSceneInventoryDock();
    updateSceneHudCounters();
  }

  function updateSceneHudCounters() {
    const spots = view.hotspots.filter((hs) => hs.mode === 'investigate');
    const doneCount = spots.filter((hs) => investigatedTargets.has(hs.target)).length;
    $('scene-progress-text').textContent = `${doneCount} / ${spots.length} 핵심 구역 조사 완료`;
    $('scene-total-clue-badge').textContent = `${unlockedClueIds.size}건`;
  }

  function renderSceneInventoryDock() {
    const slots = $('scene-inventory-slots');
    slots.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      const chip = mk('button', 'inv-chip');
      chip.type = 'button';
      chip.appendChild(mk('span', null, `📌 [${c.id}] ${c.title}`));
      chip.addEventListener('click', () => openClueCloseupModal(c, false, 'document'));
      slots.appendChild(chip);
    });
  }

  // ---------- 모달 ----------
  const closeupModal = $('evidence-closeup-modal');

  function openClueCloseupModal(clue, isNewlyFound, iconType = 'document') {
    $('closeup-svg-holder').innerHTML = OBJECT_SVG_LIBRARY[iconType] || OBJECT_SVG_LIBRARY.document;
    const pill = $('closeup-status-pill');
    pill.textContent = isNewlyFound ? '🎉 신규 단서 획득!' : '✔ 확보된 단서 감식';
    pill.style.color = 'var(--success)';
    $('closeup-role-badge').textContent = `${clue.role || '핵심'} 단서`;
    $('closeup-id-label').textContent = `EVIDENCE #${clue.id}`;
    $('closeup-title').textContent = `[${clue.id}] ${clue.title}`;
    $('closeup-location').textContent = `📍 발견 위치: ${clue.location}`;
    $('closeup-desc').textContent = clue.text;
    $('closeup-tip').textContent = '💡 이 단서를 사건 수첩에서 대조하거나 용의자 심문실에서 제시해 보세요!';

    const actions = $('closeup-actions');
    actions.innerHTML = '';
    const goBtn = mk('button', 'btn', '💬 이 단서 들고 심문하러 가기');
    goBtn.type = 'button';
    const okBtn = mk('button', 'btn btn-primary', '📥 사건 수첩에 보관 확인');
    okBtn.type = 'button';
    okBtn.addEventListener('click', () => closeupModal.classList.remove('open'));
    goBtn.addEventListener('click', () => {
      closeupModal.classList.remove('open');
      selectedClueIdForChat = clue.id;
      renderInterrogateClues();
      $('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 [${clue.id}] ${clue.title}`;
      switchScreen('interrogate');
    });
    actions.append(goBtn, okBtn);
    closeupModal.classList.add('open');
  }

  // 서버가 LOCKED 를 돌려준 경우. 어떤 단서가 필요한지는 알려주지 않는다.
  function openLockedSpotModal(hs, message) {
    $('closeup-svg-holder').innerHTML = `
      <svg viewBox="0 0 160 160">
        <rect x="38" y="68" width="84" height="68" rx="10" fill="#3b1d1d" stroke="#e05a5a" stroke-width="3.5"/>
        <path d="M54,68 L54,46 C54,28 106,28 106,46 L106,68" fill="none" stroke="#e05a5a" stroke-width="8" stroke-linecap="round"/>
      </svg>`;
    const pill = $('closeup-status-pill');
    pill.textContent = '🔒 아직 조사할 수 없음';
    pill.style.color = 'var(--danger)';
    $('closeup-role-badge').textContent = '조건부 잠금 오브젝트';
    $('closeup-id-label').textContent = 'LOCKED';
    $('closeup-title').textContent = `🔒 ${cleanLabel(hs.label)}`;
    $('closeup-location').textContent = '';
    $('closeup-desc').textContent = message || '아직 열 이유가 없다.';
    $('closeup-tip').textContent = '💡 용의자 심문이나 다른 현장 조사로 새 단서를 얻은 뒤 다시 시도해 보세요.';
    const actions = $('closeup-actions');
    actions.innerHTML = '';
    const closeBtn = mk('button', 'btn', '닫기');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', () => closeupModal.classList.remove('open'));
    actions.appendChild(closeBtn);
    closeupModal.classList.add('open');
  }

  // ---------- 사건 수첩 ----------
  function showDetailInNotebook(badge, title, meta, body) {
    $('detail-badge').textContent = badge;
    $('detail-title').textContent = title;
    $('detail-meta').textContent = meta;
    $('detail-body').textContent = body;
  }
  function clearNotebookSelection() {
    document.querySelectorAll('#screen-notebook .selectable-item').forEach((el) => el.classList.remove('selected'));
  }

  function renderNotebookSuspects() {
    const list = $('notebook-suspect-list');
    list.innerHTML = '';
    suspects.forEach((s, idx) => {
      list.appendChild(selectableItem({
        icon: '👤', strong: s.name, sub: s.role, selected: idx === 0,
        onClick: (e) => {
          clearNotebookSelection();
          e.currentTarget.classList.add('selected');
          showDetailInNotebook('용의자 프로필', `${s.name} (${s.role})`, `ID: ${s.id}`, s.publicBio || '');
        },
      }));
    });
  }

  function renderNotebookClues() {
    const list = $('notebook-clue-list');
    list.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      list.appendChild(selectableItem({
        icon: '📌', strong: `[${c.id}] ${c.title}`, sub: c.location,
        onClick: (e) => {
          clearNotebookSelection();
          e.currentTarget.classList.add('selected');
          showDetailInNotebook(`확보 단서 · ${c.role || '일반'}`, `[${c.id}] ${c.title}`, `발견 위치: ${c.location}`, c.text);
        },
      }));
    });
    $('notebook-clue-count').textContent = `${unlockedClueIds.size}건`;
  }

  // ---------- 심문실 ----------
  function renderInterrogateSuspects() {
    const list = $('interrogate-suspect-list');
    list.innerHTML = '';
    suspects.forEach((s) => {
      list.appendChild(selectableItem({
        icon: '👤', strong: s.name, sub: s.role, selected: s.id === currentSuspectId,
        onClick: () => {
          currentSuspectId = s.id;
          renderInterrogateSuspects();
          $('chat-target-name').textContent = `${s.name} (${s.role})`;
          renderChatLog(s.id);
        },
      }));
    });
  }

  function renderInterrogateClues() {
    const list = $('interrogate-clue-list');
    list.innerHTML = '';
    const none = document.createElement('li');
    const noneBtn = mk('button', `selectable-item${selectedClueIdForChat === '' ? ' selected' : ''}`);
    noneBtn.type = 'button';
    noneBtn.appendChild(mk('span', null, '💬 단서 제시 안 함 (일반 질문)'));
    noneBtn.addEventListener('click', () => {
      selectedClueIdForChat = '';
      renderInterrogateClues();
      $('selected-clue-indicator').textContent = '현재 선택된 제시 단서: 없음 (일반 질문)';
    });
    none.appendChild(noneBtn);
    list.appendChild(none);

    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      list.appendChild(selectableItem({
        icon: '📌', strong: `[${c.id}] ${c.title}`, sub: c.location, selected: selectedClueIdForChat === cid,
        onClick: () => {
          selectedClueIdForChat = cid;
          renderInterrogateClues();
          $('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 [${c.id}] ${c.title}`;
        },
      }));
    });
  }

  function suspectLabel(id) {
    const s = suspects.find((x) => x.id === id);
    return s ? `${s.name} (${s.role})` : id;
  }

  function renderChatLog(suspectId) {
    const box = $('chat-messages');
    const name = suspectLabel(suspectId);
    const sp = suspects.find((x) => x.id === suspectId);
    box.innerHTML = '';

    const greeting = mk('div', 'msg suspect');
    greeting.append(mk('strong', null, `[${name}]`), document.createElement('br'),
      document.createTextNode(`${sp?.publicBio || ''} 무엇이 궁금하신가요?`));
    box.appendChild(greeting);

    for (const item of chatLogs[suspectId] || []) {
      let node;
      if (item.role === 'user') {
        node = mk('div', 'msg detective', item.text);
      } else if (item.role === 'system') {
        node = mk('div', 'msg system-unlock');
        node.append('🎉 신규 단서 해금: ', mk('strong', null, `[${item.id}] ${item.title}`), ` — "${item.text}"`);
      } else if (item.role === 'error') {
        node = mk('div', 'msg system-unlock', `⚠️ ${item.text}`);
      } else {
        node = mk('div', 'msg suspect');
        node.append(mk('strong', null, `[${name}]`), document.createElement('br'), mk('span', null, item.text));
      }
      box.appendChild(node);
    }
    box.scrollTop = box.scrollHeight;
  }

  $('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (asking) return;
    const input = $('chat-input');
    const text = input.value.trim();
    const clueId = selectedClueIdForChat;
    if (!text && !clueId) return;

    const suspectId = currentSuspectId;
    const clue = clueId ? allCluesMap[clueId] : null;
    const shown = clue ? `[단서 제시: [${clue.id}] ${clue.title}] ${text}`.trim() : text;

    chatLogs[suspectId] = chatLogs[suspectId] || [];
    apiHistory[suspectId] = apiHistory[suspectId] || [];
    chatLogs[suspectId].push({ role: 'user', text: shown });
    renderChatLog(suspectId);

    const typing = mk('div', 'msg suspect', '…');
    $('chat-messages').appendChild(typing);
    $('chat-messages').scrollTop = $('chat-messages').scrollHeight;

    asking = true;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const r = await api('ask', {
        caseId: CASE_ID,
        suspectId,
        message: text,
        showClueId: clueId || undefined,
        unlocked: Array.from(unlockedClueIds),
        history: apiHistory[suspectId],
      });
      chatLogs[suspectId].push({ role: 'model', text: r.reply, emotion: r.emotion });
      apiHistory[suspectId].push({ role: 'user', text: r.historyUser }, { role: 'model', text: r.historyModel });
      apiHistory[suspectId] = apiHistory[suspectId].slice(-20);
      for (const c of addClues(r.newClues)) {
        chatLogs[suspectId].push({ role: 'system', id: c.id, title: c.title, text: c.text });
      }
      input.value = '';
      syncAllViews();
    } catch (err) {
      chatLogs[suspectId].push({ role: 'error', text: err.message });
    } finally {
      asking = false;
      if (submitBtn) submitBtn.disabled = false;
      save();
      if (currentSuspectId === suspectId) renderChatLog(suspectId);
    }
  });

  // ---------- 힌트 ----------
  const hintModal = $('hint-modal');
  function showHint() {
    $('hint-count-display').textContent = hintCount;
    $('modal-hint-count').textContent = hintCount;
    $('hint-modal-text').textContent = `힌트 ${hintsShown.length}: ${hintsShown[hintsShown.length - 1]}`;
    hintModal.classList.add('open');
  }
  $('btn-use-hint')?.addEventListener('click', async () => {
    const total = Number(startData.hintTotal) || 3;
    if (hintCount >= total && hintsShown.length) { showHint(); return; } // 더 쓰면 감점만 늘어나므로 호출하지 않는다.
    try {
      const r = await api('hint', { caseId: CASE_ID, hintCount });
      hintCount = r.hintCount;
      hintsShown.push(r.hint);
      save();
      showHint();
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    }
  });
  $('btn-close-hint')?.addEventListener('click', () => hintModal.classList.remove('open'));

  // ---------- 범인 지목 ----------
  const accuseModal = $('accuse-modal');
  function renderAccuseSuspects() {
    const box = $('accuse-suspect-choices');
    box.innerHTML = '';
    suspects.forEach((s) => {
      const label = mk('label', 'suspect-choice-item');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'accused_suspect';
      radio.value = s.id;
      radio.required = true; // 미리 선택해 두지 않는다.
      const info = document.createElement('div');
      info.appendChild(mk('strong', null, `${s.name} (${s.role})`));
      const bio = mk('div', null, s.publicBio || '');
      bio.style.cssText = 'font-size: 0.8rem; color: var(--text-muted);';
      info.appendChild(bio);
      label.append(radio, info);
      box.appendChild(label);
    });
  }
  accuseButton?.addEventListener('click', () => {
    updateTimer();
    if (ready && canAccuse(elapsedSeconds) && !finished) accuseModal.classList.add('open');
  });
  $('btn-cancel-accuse')?.addEventListener('click', () => accuseModal.classList.remove('open'));

  let accusing = false;
  $('accuse-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateTimer();
    if (accusing || !ready || !canAccuse(elapsedSeconds) || finished) return;
    const checked = document.querySelector('input[name="accused_suspect"]:checked');
    if (!checked) return;
    accusing = true;
    try {
      const submittedSeconds = elapsedSeconds;
      const submittedHints = hintCount;
      const r = await api('accuse', { caseId: CASE_ID, suspectId: checked.value, hintCount: submittedHints, elapsedSeconds: submittedSeconds });
      elapsedSeconds = submittedSeconds;
      hintCount = submittedHints;
      finished = true;
      clearInterval(timerInterval);
      const result = {
        playerUid: uid,
        caseId: CASE_ID,
        caseTitle: startData.title,
        accusedSuspect: suspectLabel(checked.value),
        isCorrect: r.correct,
        base: r.base,
        penalty: r.penalty,
        score: r.score,
        timePenalty: r.timePenalty,
        hintPenalty: r.hintPenalty,
        scoringVersion: r.scoringVersion,
        elapsedSeconds,
        hintCount,
        solutionExplain: r.solutionExplain,
        isMethodCorrect: r.correct, // 이 서버는 범인만 채점한다. result.js 가 기대하는 필드라 같은 값으로 채운다.
        isMotiveCorrect: r.correct,
      };
      localStorage.setItem('last_case_result', JSON.stringify(result));
      localStorage.removeItem(STORAGE_KEY);
      await window.cloudSave?.clear(); // 사건이 끝났으니 클라우드 저장본도 지운다
      const params = new URLSearchParams({
        suspect: result.accusedSuspect,
        correct: r.correct ? '1' : '0',
        time: String(elapsedSeconds),
        hints: String(hintCount),
        method: r.correct ? '1' : '0',
        motive: r.correct ? '1' : '0',
      });
      window.location.href = `./result.html?${params.toString()}`;
    } catch (err) {
      accusing = false;
      alert(err.message);
    }
  });

  // ---------- 처음부터 다시 ----------
  $('btn-test-reset-scene')?.addEventListener('click', async () => {
    if (!confirm('진행 상황을 지우고 처음부터 다시 시작할까요?')) return;
    ready = false;
    clearInterval(timerInterval);
    localStorage.removeItem(STORAGE_KEY);
    await window.cloudSave?.clear();
    window.location.reload();
  });

  // ---------- 시작 ----------
  try {
    startData = await api('start', { caseId: CASE_ID });
  } catch (err) {
    clearInterval(timerInterval);
    toast(`⚠️ 사건을 불러오지 못했습니다: ${err.message}`);
    return;
  }

  suspects = startData.suspects || [];
  addClues(startData.clues);
  suspects.forEach((s) => { chatLogs[s.id] = []; apiHistory[s.id] = []; });
  await restoreLatest();
  clock = createPlayClock(elapsedSeconds);
  updateTimer();
  let lastSavedSecond = elapsedSeconds;
  timerInterval = setInterval(() => {
    updateTimer();
    if (elapsedSeconds - lastSavedSecond >= 5) {
      save();
      lastSavedSecond = elapsedSeconds;
    }
  }, 1000);
  currentSuspectId = suspects[0]?.id || '';

  $('case-header-title').textContent = `📁 ${startData.title}`;
  $('notebook-heading').textContent = `📓 사건 수첩 — ${startData.title}`;
  $('case-intro-text').textContent = startData.intro;
  $('scene-room-heading').textContent = `🔍 사건 현장 — ${view.roomTitle}`;
  $('notebook-suspect-count').textContent = `${suspects.length}명`;
  $('dynamic-scene-bg').innerHTML = SCENE_THEME_BACKGROUNDS[view.sceneTheme] || SCENE_THEME_BACKGROUNDS.mansion_study;
  $('hint-count-display').textContent = hintCount;
  if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);

  renderNotebookSuspects();
  syncAllViews();
  renderInterrogateSuspects();
  renderChatLog(currentSuspectId);
  renderAccuseSuspects();
  if (suspects[0]) {
    showDetailInNotebook('용의자 프로필', `${suspects[0].name} (${suspects[0].role})`, `ID: ${suspects[0].id}`, suspects[0].publicBio || '');
    $('chat-target-name').textContent = `${suspects[0].name} (${suspects[0].role})`;
  }
  toast(`✨ [${startData.title}] 현장이 로드되었습니다! 화면 속 물건을 클릭해 단서를 수집하세요.`);
});
