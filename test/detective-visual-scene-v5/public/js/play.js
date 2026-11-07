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
    secret: {
      culprit: 'doctor',
      clues: {
        c04: { id: 'c04', title: '약장의 새 약병', location: '서재 약장', role: '핵심', text: '서재 약장에 새 약병이 있다. 병 모양은 평소 약과 같지만 라벨이 이상하게 반듯하다.' },
        c05: { id: 'c05', title: '집사의 약 일지', location: '집사 진술', role: '핵심', text: "일지에 '17:10 오 박사님이 약병을 새 것으로 교체', '16:30~17:10 회장님과 오 박사님 면담, 문 닫힘'이라고 적혀 있다." },
        c06: { id: 'c06', title: '복도 CCTV 기록', location: '보안실', role: '핵심', text: '21:55 지훈, 22:50 집사(쟁반), 23:20 오진석(서재 복도), 23:38 소영이 서재 방향으로 지나갔다.' },
        c07: { id: 'c07', title: '유언장 초안', location: '서재 책상', role: '유도', text: '변호사가 작성한 미서명 초안. 기부 비중이 커지고 부인과 장남의 몫이 줄어든다. 서명이 없어 효력이 없다.' },
        c08: { id: 'c08', title: '지훈의 빚 독촉 문자', location: '지훈 진술', role: '유도', text: "사채업자의 독촉 문자 '금요일까지 4억 입금'." },
        c09: { id: 'c09', title: '비서의 경비 장부', location: '소영 진술', role: '유도', text: '지난 1년간 약 1,200만 원이 개인 용도로 처리된 흔적이 있다.' },
        c10: { id: 'c10', title: '회장의 수첩', location: '서재 책상 서랍', role: '핵심(동기)', text: "'오 원장 건 — 청구 부풀리기 확인됨. 이사회 전에 직접 통보. 거부하면 신고.' 16:30 날짜 메모." },
        c11: { id: 'c11', title: '약병 라벨의 이상', location: '윤세라 지적', role: '핵심', text: '약국 인쇄 라벨이 아니라 일반 프린터로 출력한 것이다. 약국 로고와 조제 번호가 없다.' },
        c12: { id: 'c12', title: '약국 확인', location: '한소영 통화', role: '핵심', text: '소영이 약국에 전화해 확인했다. 이번 달에는 교체 처방이 나간 적이 없다.' },
        c13: { id: 'c13', title: '의료 가방 속 병', location: '오진석의 가방', role: '결정적 증거', text: '오진석의 가방에 약국 라벨이 붙은 원래 약병과 빈 라벨 용지가 있다.' },
        c14: { id: 'c14', title: '서재의 안쪽 문', location: '서재', role: '유도', text: '안방과 서재를 잇는 안쪽 문이 있다. CCTV에 잡히지 않는 통로이며 최근 열린 흔적이 있다.' }
      },
      unlockRules: [
        { clueId: 'c04', type: 'investigate', target: 'medicine_cabinet' },
        { clueId: 'c05', type: 'ask', suspect: 'butler', keywords: ['약', '일지', '복용', '쟁반'] },
        { clueId: 'c06', type: 'investigate', target: 'cctv' },
        { clueId: 'c07', type: 'investigate', target: 'study_desk' },
        { clueId: 'c08', type: 'ask', suspect: 'son', keywords: ['빚', '돈', '도박', '문자'] },
        { clueId: 'c09', type: 'ask', suspect: 'secretary', keywords: ['장부', '횡령', '경비', '돈'] },
        { clueId: 'c10', type: 'investigate', target: 'desk_drawer', requires: ['c05'] },
        { clueId: 'c11', type: 'show', suspect: 'wife', clue: 'c04' },
        { clueId: 'c12', type: 'show', suspect: 'secretary', clue: 'c11' },
        { clueId: 'c13', type: 'investigate', target: 'doctor_bag', requires: ['c11', 'c12'] },
        { clueId: 'c14', type: 'investigate', target: 'inner_door' }
      ],
      hints: [
        '누가 가장 의심스러운지가 아니라, 누가 가장 쉽게 약에 손댈 수 있었는지 생각해 보세요.',
        '집사의 일지에는 17시 무렵 약과 관련된 기록이 있습니다.',
        '약병의 라벨을 아는 사람에게 약병을 보여 주세요. 그리고 그 사실을 확인해 줄 사람을 찾으세요.'
      ],
      solutionExplain: '범인은 주치의 오진석이다. 회장이 병원 청구 비리를 신고하겠다고 통보하자(16:30), 집사가 자리를 비운 17:05~17:12에 서재 약장의 심장약 병을 바꿔치기했다.'
    }
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

document.addEventListener('DOMContentLoaded', () => {
  const screens = {
    notebook: { el: document.getElementById('screen-notebook'), label: '사건 수첩' },
    scene: { el: document.getElementById('screen-scene'), label: '사건 현장 탐색' },
    interrogate: { el: document.getElementById('screen-interrogate'), label: '용의자 심문실' }
  };

  // URL 파라미터(?case=...) 또는 기본값(mansion-001)
  const urlParams = new URLSearchParams(window.location.search);
  let currentEpisodeId = urlParams.get('case') && EPISODES_DB[urlParams.get('case')]
    ? urlParams.get('case')
    : 'mansion-001';

  let currentEpisode = EPISODES_DB[currentEpisodeId];
  let allCluesMap = {};
  let unlockedClueIds = new Set();
  let investigatedTargets = new Set();
  let currentSuspectId = '';
  let selectedClueIdForChat = '';
  let suspectChatHistories = {};
  let hintCount = 0;

  // 타이머
  const timerDisplay = document.getElementById('timer-display');
  let elapsedSeconds = 0;
  function formatTime(sec) {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }
  const timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);
  }, 1000);

  // 화면 전환
  function switchScreen(targetKey) {
    if (!screens[targetKey]) return;
    Object.keys(screens).forEach((key) => {
      screens[key].el.classList.toggle('active', key === targetKey);
    });
    document.getElementById('current-screen-badge').textContent = `현재 화면: ${screens[targetKey].label}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.getAttribute('data-goto')));
  });

  // =========================================================
  // 핵심: 에피소드 로드 및 동적 사건 현장(배경 + 오브젝트) 생성기
  // =========================================================
  function loadEpisode(episodeId) {
    currentEpisodeId = episodeId;
    currentEpisode = EPISODES_DB[episodeId];

    // 단서 맵 재구축
    allCluesMap = {};
    unlockedClueIds = new Set();
    investigatedTargets = new Set();

    currentEpisode.public.clues.forEach((c) => {
      allCluesMap[c.id] = c;
      unlockedClueIds.add(c.id);
    });
    Object.values(currentEpisode.secret.clues).forEach((c) => {
      allCluesMap[c.id] = c;
    });

    suspectChatHistories = {};
    currentEpisode.public.suspects.forEach((s) => {
      suspectChatHistories[s.id] = [];
    });
    currentSuspectId = currentEpisode.public.suspects[0].id;
    selectedClueIdForChat = '';

    // 상단 타이틀 및 소개글 업데이트
    document.getElementById('case-header-title').textContent = `📁 사건 [${currentEpisode.id}] : ${currentEpisode.public.title}`;
    document.getElementById('notebook-heading').textContent = `📓 사건 수첩 — ${currentEpisode.public.title}`;
    document.getElementById('case-intro-text').textContent = currentEpisode.public.intro;
    document.getElementById('scene-room-heading').textContent = `🔍 사건 현장 — ${currentEpisode.public.roomTitle}`;
    document.getElementById('notebook-suspect-count').textContent = `${currentEpisode.public.suspects.length}명`;

    // 1. 배경 일러스트 테마 교체
    const bgHolder = document.getElementById('dynamic-scene-bg');
    bgHolder.innerHTML = SCENE_THEME_BACKGROUNDS[currentEpisode.public.sceneTheme] || SCENE_THEME_BACKGROUNDS.mansion_study;

    // 2. 현장 온클릭 오브젝트(Hotspots) 동적 생성 및 배치
    renderDynamicHotspots();

    // 3. 수첩 / 심문 / 인벤토리 동기화
    renderNotebookSuspects();
    syncAllViews();
    renderInterrogateSuspects();
    renderSuspectChatLog(currentSuspectId);
    renderAccuseSuspects();

    const firstSuspect = currentEpisode.public.suspects[0];
    showDetailInNotebook('용의자 프로필', `${firstSuspect.name} (${firstSuspect.role})`, `ID: ${firstSuspect.id}`, firstSuspect.publicBio);
    document.getElementById('chat-target-name').textContent = `${firstSuspect.name} (${firstSuspect.role})`;
    document.getElementById('scene-stage-toast').textContent = `✨ [${currentEpisode.public.title}] 현장이 로드되었습니다! 화면 속 물건을 클릭해 단서를 수집하세요.`;
  }

  function checkRequirementsMet(requiresArr) {
    if (!requiresArr || requiresArr.length === 0) return true;
    return requiresArr.every((reqId) => unlockedClueIds.has(reqId));
  }

  function renderDynamicHotspots() {
    const container = document.getElementById('dynamic-scene-hotspots');
    container.innerHTML = '';

    const investigateRules = currentEpisode.secret.unlockRules.filter((r) => r.type === 'investigate');

    currentEpisode.public.hotspots.forEach((h) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scene-hotspot';
      btn.style.left = `${h.x}%`;
      btn.style.top = `${h.y}%`;

      const rule = h.mode === 'investigate'
        ? investigateRules.find((r) => r.target === h.target)
        : null;

      const isDone = h.mode === 'clue' || investigatedTargets.has(h.target) || unlockedClueIds.has(h.clueId);
      const isUnlocked = rule ? checkRequirementsMet(rule.requires) : true;

      let stateClass = 'state-ready';
      let badgeChar = '🔎';
      if (isDone) {
        stateClass = 'state-done';
        badgeChar = '✔';
      } else if (!isUnlocked) {
        stateClass = 'state-locked';
        badgeChar = '🔒';
      }
      btn.classList.add(stateClass);

      const svgGraphic = OBJECT_SVG_LIBRARY[h.iconType] || OBJECT_SVG_LIBRARY.document;
      btn.innerHTML = `
        <div class="hotspot-visual">
          <span class="hotspot-pulse">${badgeChar}</span>
          ${svgGraphic}
        </div>
        <span class="hotspot-label">${h.label}</span>
      `;

      btn.addEventListener('click', () => {
        if (h.mode === 'clue') {
          const clue = allCluesMap[h.clueId];
          if (clue) openClueCloseupModal(clue, false, h.iconType);
          return;
        }
        if (!rule) return;

        if (!checkRequirementsMet(rule.requires)) {
          openLockedSpotModal(rule, h);
          return;
        }

        investigatedTargets.add(rule.target);
        const isNew = unlockClue(rule.clueId);
        const clue = allCluesMap[rule.clueId];
        if (clue) {
          document.getElementById('scene-stage-toast').textContent = `✨ 현장에서 [${clue.id}] "${clue.title}" 단서를 발견해 사건 수첩에 기록했습니다!`;
          openClueCloseupModal(clue, isNew, h.iconType);
        }
      });

      container.appendChild(btn);
    });
  }

  function unlockClue(clueId) {
    const clue = allCluesMap[clueId];
    if (!clue) return false;
    const isNew = !unlockedClueIds.has(clueId);
    unlockedClueIds.add(clueId);
    syncAllViews();
    return isNew;
  }

  function syncAllViews() {
    renderDynamicHotspots();
    renderNotebookClues();
    renderInterrogateClues();
    renderSceneInventoryDock();
    updateSceneHudCounters();
  }

  function updateSceneHudCounters() {
    const investigateRules = currentEpisode.secret.unlockRules.filter((r) => r.type === 'investigate');
    const doneCount = investigateRules.filter((r) => investigatedTargets.has(r.target) || unlockedClueIds.has(r.clueId)).length;
    const totalClueCount = Object.keys(allCluesMap).length;
    document.getElementById('scene-progress-text').textContent = `${doneCount} / ${investigateRules.length} 핵심 구역 조사 완료`;
    document.getElementById('scene-total-clue-badge').textContent = `${unlockedClueIds.size} / ${totalClueCount}건`;
  }

  function renderSceneInventoryDock() {
    const slotsEl = document.getElementById('scene-inventory-slots');
    slotsEl.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'inv-chip';
      chip.innerHTML = `<span>📌 [${c.id}] ${c.title}</span>`;
      chip.addEventListener('click', () => openClueCloseupModal(c, false, 'document'));
      slotsEl.appendChild(chip);
    });
  }

  // 클로즈업 모달
  const closeupModal = document.getElementById('evidence-closeup-modal');

  function openClueCloseupModal(clue, isNewlyFound, iconType = 'document') {
    document.getElementById('closeup-svg-holder').innerHTML = OBJECT_SVG_LIBRARY[iconType] || OBJECT_SVG_LIBRARY.document;
    const pill = document.getElementById('closeup-status-pill');
    pill.textContent = isNewlyFound ? '🎉 신규 단서 획득!' : '✔ 확보된 단서 감식';
    pill.style.color = 'var(--success)';

    document.getElementById('closeup-role-badge').textContent = `${clue.role || '핵심'} 단서`;
    document.getElementById('closeup-id-label').textContent = `EVIDENCE #${clue.id}`;
    document.getElementById('closeup-title').textContent = `[${clue.id}] ${clue.title}`;
    document.getElementById('closeup-location').textContent = `📍 발견 위치: ${clue.location}`;
    document.getElementById('closeup-desc').textContent = clue.text;
    document.getElementById('closeup-tip').textContent = '💡 이 단서를 사건 수첩에서 대조하거나 용의자 심문실에서 제시(show)해 보세요!';

    const actions = document.getElementById('closeup-actions');
    actions.innerHTML = `
      <button type="button" class="btn" id="btn-modal-goto-interrogate">💬 이 단서 들고 심문하러 가기</button>
      <button type="button" class="btn btn-primary" id="btn-modal-confirm-collect">📥 사건 수첩에 보관 확인</button>
    `;
    document.getElementById('btn-modal-confirm-collect').addEventListener('click', () => closeupModal.classList.remove('open'));
    document.getElementById('btn-modal-goto-interrogate').addEventListener('click', () => {
      closeupModal.classList.remove('open');
      selectedClueIdForChat = clue.id;
      renderInterrogateClues();
      document.getElementById('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 [${clue.id}] ${clue.title}`;
      switchScreen('interrogate');
    });

    closeupModal.classList.add('open');
  }

  function openLockedSpotModal(rule, hotspotMeta) {
    const targetClue = allCluesMap[rule.clueId];
    const missingNames = (rule.requires || [])
      .filter((rid) => !unlockedClueIds.has(rid))
      .map((rid) => `[${rid}] ${allCluesMap[rid]?.title || rid}`)
      .join(', ');

    document.getElementById('closeup-svg-holder').innerHTML = `
      <svg viewBox="0 0 160 160">
        <rect x="38" y="68" width="84" height="68" rx="10" fill="#3b1d1d" stroke="#e05a5a" stroke-width="3.5"/>
        <path d="M54,68 L54,46 C54,28 106,28 106,46 L106,68" fill="none" stroke="#e05a5a" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `;
    const pill = document.getElementById('closeup-status-pill');
    pill.textContent = '🔒 수색 조건 미충족 (잠김)';
    pill.style.color = 'var(--danger)';

    document.getElementById('closeup-role-badge').textContent = '조건부 잠금 오브젝트';
    document.getElementById('closeup-id-label').textContent = `TARGET: ${rule.target}`;
    document.getElementById('closeup-title').textContent = `🔒 ${hotspotMeta.label}`;
    document.getElementById('closeup-location').textContent = `📍 위치: ${targetClue?.location || ''}`;
    document.getElementById('closeup-desc').innerHTML = `이 오브젝트를 조사하려면 먼저 다음 선행 단서를 확보해야 합니다:<br /><strong style="color: var(--accent);">${missingNames}</strong>`;
    document.getElementById('closeup-tip').innerHTML = `💡 용의자 심문을 통해 선행 단서를 얻거나, 아래 <strong>[테스트용 즉시 해금]</strong> 버튼을 눌러 바로 확인하세요!`;

    const actions = document.getElementById('closeup-actions');
    actions.innerHTML = `
      <button type="button" class="btn" id="btn-locked-close">닫기</button>
      <button type="button" class="btn btn-primary" id="btn-locked-force-unlock">🔓 테스트용: 조건 즉시 해금하고 열기</button>
    `;
    document.getElementById('btn-locked-close').addEventListener('click', () => closeupModal.classList.remove('open'));
    document.getElementById('btn-locked-force-unlock').addEventListener('click', () => {
      (rule.requires || []).forEach((reqId) => unlockedClueIds.add(reqId));
      investigatedTargets.add(rule.target);
      unlockClue(rule.clueId);
      openClueCloseupModal(targetClue, true, hotspotMeta.iconType);
    });

    closeupModal.classList.add('open');
  }

  // 하단 테스트 버튼
  document.getElementById('btn-test-unlock-all-req')?.addEventListener('click', () => {
    currentEpisode.secret.unlockRules.forEach((r) => {
      (r.requires || []).forEach((reqId) => unlockedClueIds.add(reqId));
    });
    syncAllViews();
    document.getElementById('scene-stage-toast').textContent = '🔓 현재 에피소드의 모든 잠금 오브젝트 선행 조건이 해금되었습니다! 잠겼던 물건을 클릭해 보세요!';
  });

  document.getElementById('btn-test-reset-scene')?.addEventListener('click', () => {
    loadEpisode(currentEpisodeId);
  });

  // 상단 에피소드 전환 드롭다운 이벤트
  const epSwitcher = document.getElementById('episode-switcher');
  if (epSwitcher) {
    epSwitcher.value = currentEpisodeId;
    epSwitcher.addEventListener('change', (e) => {
      loadEpisode(e.target.value);
    });
  }

  // 사건 수첩 렌더링
  function showDetailInNotebook(badge, title, meta, body) {
    document.getElementById('detail-badge').textContent = badge;
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-meta').textContent = meta;
    document.getElementById('detail-body').textContent = body;
  }

  function renderNotebookSuspects() {
    const listEl = document.getElementById('notebook-suspect-list');
    listEl.innerHTML = '';
    currentEpisode.public.suspects.forEach((s, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `selectable-item ${idx === 0 ? 'selected' : ''}`;
      btn.innerHTML = `<span>👤 <strong>${s.name}</strong></span><span class="item-sub">${s.role}</span>`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('#screen-notebook .selectable-item').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');
        showDetailInNotebook('용의자 프로필', `${s.name} (${s.role})`, `ID: ${s.id}`, s.publicBio);
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function renderNotebookClues() {
    const listEl = document.getElementById('notebook-clue-list');
    listEl.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'selectable-item';
      btn.innerHTML = `<span>📌 <strong>[${c.id}] ${c.title}</strong></span><span class="item-sub">${c.location}</span>`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('#screen-notebook .selectable-item').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');
        showDetailInNotebook(`확보 단서 · ${c.role || '일반'}`, `[${c.id}] ${c.title}`, `발견 위치: ${c.location}`, c.text);
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
    document.getElementById('notebook-clue-count').textContent = `${unlockedClueIds.size} / ${Object.keys(allCluesMap).length}건`;
  }

  // 심문 화면 렌더링
  function renderInterrogateSuspects() {
    const listEl = document.getElementById('interrogate-suspect-list');
    listEl.innerHTML = '';
    currentEpisode.public.suspects.forEach((s) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `selectable-item ${s.id === currentSuspectId ? 'selected' : ''}`;
      btn.innerHTML = `<span>👤 <strong>${s.name}</strong></span><span class="item-sub">${s.role}</span>`;
      btn.addEventListener('click', () => {
        currentSuspectId = s.id;
        renderInterrogateSuspects();
        document.getElementById('chat-target-name').textContent = `${s.name} (${s.role})`;
        renderSuspectChatLog(s.id);
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function renderInterrogateClues() {
    const listEl = document.getElementById('interrogate-clue-list');
    listEl.innerHTML = '';
    const liNone = document.createElement('li');
    const btnNone = document.createElement('button');
    btnNone.type = 'button';
    btnNone.className = `selectable-item ${selectedClueIdForChat === '' ? 'selected' : ''}`;
    btnNone.innerHTML = `<span>💬 단서 제시 안 함 (일반 질문 ask)</span>`;
    btnNone.addEventListener('click', () => {
      selectedClueIdForChat = '';
      renderInterrogateClues();
      document.getElementById('selected-clue-indicator').textContent = '현재 선택된 제시 단서: 없음 (일반 질문 ask)';
    });
    liNone.appendChild(btnNone);
    listEl.appendChild(liNone);

    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `selectable-item ${selectedClueIdForChat === cid ? 'selected' : ''}`;
      btn.innerHTML = `<span>📌 <strong>[${c.id}] ${c.title}</strong></span><span class="item-sub">${c.location}</span>`;
      btn.addEventListener('click', () => {
        selectedClueIdForChat = cid;
        renderInterrogateClues();
        document.getElementById('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 [${c.id}] ${c.title}`;
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function renderSuspectChatLog(suspectId) {
    const chatMessages = document.getElementById('chat-messages');
    const suspectObj = currentEpisode.public.suspects.find((s) => s.id === suspectId);
    const displayName = suspectObj ? `${suspectObj.name} (${suspectObj.role})` : suspectId;
    chatMessages.innerHTML = '';

    const greetingDiv = document.createElement('div');
    greetingDiv.className = 'msg suspect';
    greetingDiv.innerHTML = `<strong>[${displayName}]</strong><br />${suspectObj?.publicBio || ''} 무엇이 궁금하신가요?`;
    chatMessages.appendChild(greetingDiv);

    for (const item of suspectChatHistories[suspectId] || []) {
      const msgDiv = document.createElement('div');
      if (item.role === 'user') {
        msgDiv.className = 'msg detective';
        msgDiv.textContent = item.displayText || item.text;
      } else if (item.role === 'system') {
        msgDiv.className = 'msg system-unlock';
        msgDiv.innerHTML = item.text;
      } else {
        msgDiv.className = 'msg suspect';
        msgDiv.innerHTML = `<strong>[${displayName}]</strong><br /><span>${item.text}</span>`;
      }
      chatMessages.appendChild(msgDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputEl = document.getElementById('chat-input');
    const text = inputEl.value.trim();
    if (!text) return;

    const suspectObj = currentEpisode.public.suspects.find((s) => s.id === currentSuspectId);
    const displayName = suspectObj ? `${suspectObj.name} (${suspectObj.role})` : currentSuspectId;
    const clueObj = selectedClueIdForChat ? allCluesMap[selectedClueIdForChat] : null;
    const displayUserText = clueObj ? `[단서 제시: [${clueObj.id}] ${clueObj.title}] ${text}` : text;

    const newlyUnlocked = [];
    for (const rule of currentEpisode.secret.unlockRules) {
      if (rule.type === 'show' && rule.suspect === currentSuspectId && rule.clue === selectedClueIdForChat) {
        if (unlockClue(rule.clueId)) newlyUnlocked.push(allCluesMap[rule.clueId]);
      }
      if (rule.type === 'ask' && rule.suspect === currentSuspectId && Array.isArray(rule.keywords)) {
        if (rule.keywords.some((kw) => text.includes(kw))) {
          if (unlockClue(rule.clueId)) newlyUnlocked.push(allCluesMap[rule.clueId]);
        }
      }
    }

    const replyText = newlyUnlocked.length > 0
      ? `그 부분을 물으시다니... 사실대로 말씀드리겠습니다. (${newlyUnlocked.map((u) => `[${u.id}] ${u.title}`).join(', ')} 단서가 확보되었습니다!)`
      : `제 알리바이에 대해서는 이미 말씀드린 대로입니다. 단서를 제시하거나 핵심 키워드로 질문해 보세요.`;

    suspectChatHistories[currentSuspectId].push({ role: 'user', text: displayUserText, displayText: displayUserText });
    suspectChatHistories[currentSuspectId].push({ role: 'model', text: replyText });

    for (const u of newlyUnlocked) {
      suspectChatHistories[currentSuspectId].push({
        role: 'system',
        text: `🎉 신규 단서 해금: <strong>[${u.id}] ${u.title}</strong> — "${u.text}"`
      });
    }

    inputEl.value = '';
    renderSuspectChatLog(currentSuspectId);
  });

  // 힌트 & 범인 지목
  const hintModal = document.getElementById('hint-modal');
  document.getElementById('btn-use-hint')?.addEventListener('click', () => {
    const hints = currentEpisode.secret.hints;
    const msg = hints[Math.min(hintCount, hints.length - 1)];
    if (hintCount < hints.length) hintCount += 1;
    document.getElementById('hint-count-display').textContent = hintCount;
    document.getElementById('modal-hint-count').textContent = hintCount;
    document.getElementById('hint-modal-text').textContent = `힌트 ${hintCount}: ${msg}`;
    hintModal.classList.add('open');
  });
  document.getElementById('btn-close-hint')?.addEventListener('click', () => hintModal.classList.remove('open'));

  const accuseModal = document.getElementById('accuse-modal');
  function renderAccuseSuspects() {
    const box = document.getElementById('accuse-suspect-choices');
    box.innerHTML = '';
    currentEpisode.public.suspects.forEach((s) => {
      const label = document.createElement('label');
      label.className = 'suspect-choice-item';
      label.innerHTML = `
        <input type="radio" name="accused_suspect" value="${s.id}" ${s.id === currentEpisode.secret.culprit ? 'checked' : ''} required />
        <div>
          <strong>${s.name} (${s.role})</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${s.publicBio}</div>
        </div>
      `;
      box.appendChild(label);
    });
  }

  document.getElementById('btn-open-accuse')?.addEventListener('click', () => accuseModal.classList.add('open'));
  document.getElementById('btn-cancel-accuse')?.addEventListener('click', () => accuseModal.classList.remove('open'));
  document.getElementById('accuse-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearInterval(timerInterval);
    const selectedRadio = document.querySelector('input[name="accused_suspect"]:checked');
    const accusedId = selectedRadio ? selectedRadio.value : '';
    const suspectObj = currentEpisode.public.suspects.find((s) => s.id === accusedId);
    const isCorrect = accusedId === currentEpisode.secret.culprit;

    const resultData = {
      caseId: currentEpisode.id,
      caseTitle: currentEpisode.public.title,
      accusedSuspect: suspectObj ? `${suspectObj.name} (${suspectObj.role})` : accusedId,
      isCorrect,
      isMethodCorrect: true,
      isMotiveCorrect: true,
      elapsedSeconds,
      hintCount,
      solutionExplain: currentEpisode.secret.solutionExplain
    };
    localStorage.setItem('last_case_result', JSON.stringify(resultData));
    const params = new URLSearchParams({
      suspect: resultData.accusedSuspect,
      correct: isCorrect ? '1' : '0',
      time: String(elapsedSeconds),
      hints: String(hintCount)
    });
    window.location.href = `./result.html?${params.toString()}`;
  });

  // 초기 에피소드 로드
  loadEpisode(currentEpisodeId);
});
