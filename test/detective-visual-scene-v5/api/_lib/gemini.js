// api/_lib/gemini.js - 서버 전용 Gemini API 멀티 엔드포인트 호출 모듈
// 중요: AQ.Ab8RN6... 형식(Vertex AI Express Mode / 신규 AI Studio 키)과 AIza... 형식 모두 자동 라우팅 지원

export async function callGeminiInterrogate({ systemInstruction, history = [], userMessage }) {
  const rawKey = (process.env.GEMINI_API_KEY || '').trim();
  const preferredModel = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

  if (!rawKey) {
    throw new Error('서버 환경 변수 GEMINI_API_KEY가 설정되어 있지 않습니다.');
  }

  // 모든 엔드포인트(v1, v1beta, Vertex AI, AI Studio)와 100% 호환되도록 시스템 지침을 첫 컨텍스트에 결합
  const contents = [
    {
      role: 'user',
      parts: [{ text: `[시스템 역할 지침]\n${systemInstruction}\n\n위 지침을 숙지하고 지금부터 용의자 본인의 대사로만 답변하세요.` }]
    },
    {
      role: 'model',
      parts: [{ text: '네, 알겠습니다. 지금부터 해당 용의자의 입장과 말투로만 대답하겠습니다.' }]
    }
  ];

  for (const item of history) {
    if (!item || !item.text) continue;
    contents.push({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.text }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 350
    }
  };

  // AQ. 접두사 키는 Vertex AI Express Mode 엔드포인트를 최우선으로 시도하고, 이후 AI Studio 엔드포인트 시도
  const isAqKey = rawKey.startsWith('AQ.');
  const endpoints = isAqKey
    ? [
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`,
        `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`,
        `https://generativelanguage.googleapis.com/v1beta/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`,
        `https://generativelanguage.googleapis.com/v1/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`
      ]
    : [
        `https://generativelanguage.googleapis.com/v1beta/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`,
        `https://generativelanguage.googleapis.com/v1/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`,
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${preferredModel}:generateContent?key=${encodeURIComponent(rawKey)}`
      ];

  let lastErrorMsg = '';

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': rawKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return replyText.trim();
        }
      } else {
        lastErrorMsg = data?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err) {
      lastErrorMsg = err.message;
    }
  }

  throw new Error(lastErrorMsg || 'Gemini API 모든 엔드포인트 호출 실패');
}
