// 난이도별 사건 구성 규칙. 프롬프트에 지시하고, 응답은 caseGenerator.js 가 같은 숫자로 검증한다.
//
// 어렵게 만드는 방법
//  1. 용의자 수           : 3 → 6명
//  2. 진술 모순 수         : 범인의 거짓말 + 무고한 사람의 거짓말(각자 숨기는 사정)
//  3. 가짜(유도) 단서 수    : 엉뚱한 사람을 의심하게 만드는 단서
//  4. 증거 연쇄 깊이       : 결정적 증거를 얻으려면 앞 단서를 몇 단계 거쳐야 하는가
//  5. 조건부 해금 수       : requires 가 걸린 잠긴 현장·질문 (아직 열 이유가 없다)
//  6. 단서 획득 방식       : 질문 키워드(ask), 단서 제시(show), 현장 조사(investigate)를 섞음
//  7. 시작 단서 수         : 처음 공개되는 단서를 줄인다 (expert 2개)
//  8. 심문 AI의 태도       : prompt.js 의 DIFFICULTY_STYLE
//  9. 힌트 구체성          : 쉬움은 거의 직접, 매우어려움은 방향만

export const DIFFICULTY_RULES = {
  easy: {
    label: "쉬움",
    suspects: 3,
    startClues: [3, 3],
    hidden: [4, 5],
    redHerrings: 1,
    contradictions: 1,
    culpritLies: 1,
    innocentLiars: 0,
    chainDepth: 2,
    decisiveDeps: 1,
    gatedRules: 1,
    askRules: 1,
    showRules: 1,
    hintStyle: "구체적으로. 어떤 장소를 조사하고 누구에게 무엇을 물어야 하는지 거의 직접 알려 준다.",
    extra: "범인의 거짓말은 하나이고, 그 거짓말을 깰 단서는 눈에 띄는 곳에 있다. 무고한 용의자는 거짓말을 하지 않는다.",
  },
  normal: {
    label: "보통",
    suspects: 4,
    startClues: [3, 3],
    hidden: [5, 6],
    redHerrings: 2,
    contradictions: 2,
    culpritLies: 2,
    innocentLiars: 1,
    chainDepth: 3,
    decisiveDeps: 2,
    gatedRules: 2,
    askRules: 2,
    showRules: 1,
    hintStyle: "방향 위주로. 어떤 종류의 단서를 서로 맞춰 봐야 하는지 알려 주되 이름은 직접 말하지 않는다.",
    extra: "무고한 용의자 한 명이 사건과 무관한 비밀 때문에 거짓말을 한다. 가짜 단서가 그 사람을 가리킨다.",
  },
  hard: {
    label: "어려움",
    suspects: 5,
    startClues: [3, 3],
    hidden: [6, 7],
    redHerrings: 3,
    contradictions: 3,
    culpritLies: 2,
    innocentLiars: 3,
    chainDepth: 4,
    decisiveDeps: 2,
    gatedRules: 3,
    askRules: 2,
    showRules: 2,
    hintStyle: "모호하게. 질문 방향만 제시하고 장소나 인물 이름은 말하지 않는다.",
    extra:
      "범인의 알리바이는 처음에는 단단해 보인다(무고한 증인이 자기 사정 때문에 거짓 진술을 해서 알리바이를 뒷받침한다). " +
      "무고한 용의자 대부분이 각자의 비밀 때문에 거짓말을 해서 진술끼리 서로 어긋나 보인다.",
  },
  expert: {
    label: "매우어려움",
    suspects: 6,
    startClues: [2, 2],
    hidden: [7, 8],
    redHerrings: 4,
    contradictions: 4,
    culpritLies: 3,
    innocentLiars: 4,
    chainDepth: 5,
    decisiveDeps: 3,
    gatedRules: 4,
    askRules: 3,
    showRules: 2,
    hintStyle: "아주 모호하게. 무엇을 의심해야 하는지만 한 문장으로 말하고 단서 id나 장소는 말하지 않는다.",
    extra:
      "시작 단서 중 하나는 오해를 부르는 내용이다(진실이지만 잘못된 결론으로 이끈다). " +
      "범인의 진술은 대부분 사실이고 핵심 한두 곳만 거짓이다. " +
      "결정적 증거는 서로 다른 방식(현장 조사, 질문, 단서 제시)으로 얻은 단서 세 개를 모두 모아야 열린다. " +
      "무고한 용의자들의 거짓말이 서로 겹쳐 있어서 한 명의 모순만 보고는 범인을 정할 수 없다.",
  },
};

export const DIFFICULTY_IDS = Object.keys(DIFFICULTY_RULES);
export const ID_BY_LABEL = Object.fromEntries(
  Object.entries(DIFFICULTY_RULES).map(([id, r]) => [r.label, id])
);
