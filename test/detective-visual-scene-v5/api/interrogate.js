// api/interrogate.js - Vercel Serverless Function (용의자 실시간 AI 심문 엔드포인트)
import { buildInterrogationSystemPrompt } from './_lib/prompt.js';
import { callGeminiInterrogate } from './_lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. POST 요청만 지원합니다.' });
  }

  try {
    const { suspect = '김비서', message = '', presentedClue = '', history = [] } = req.body || {};

    if (!message.trim()) {
      return res.status(400).json({ error: '질문 내용(message)이 비어 있습니다.' });
    }

    const systemInstruction = buildInterrogationSystemPrompt(suspect, presentedClue);
    const formattedUserMessage = presentedClue
      ? `[형사가 단서 "${presentedClue}"을(를) 눈앞에 제시하며 질문함]: ${message}`
      : `[형사의 질문]: ${message}`;

    const reply = await callGeminiInterrogate({
      systemInstruction,
      history,
      userMessage: formattedUserMessage
    });

    return res.status(200).json({
      suspect,
      presentedClue,
      reply
    });
  } catch (error) {
    console.error('[api/interrogate] Error:', error.message);
    return res.status(500).json({
      error: error.message || '용의자 심문 AI 응답 생성 중 오류가 발생했습니다.'
    });
  }
}
