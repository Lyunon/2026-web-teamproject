import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const res = await ai.models.generateContent({
  model: MODEL,
  contents: "형사입니다. 어젯밤 어디 계셨습니까?",
  config: {
    systemInstruction:
      "너는 저택의 집사 '박 집사'다. 공손하고 조심스러운 말투를 쓴다. 범인이 누구인지는 모른다고 답한다.",
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      properties: {
        reply: { type: "string" },
        emotion: { type: "string", enum: ["calm", "nervous", "angry", "sad"] },
      },
      required: ["reply", "emotion"],
    },
  },
});

console.log(JSON.parse(res.text));
