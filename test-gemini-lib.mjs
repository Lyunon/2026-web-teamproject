import { generateSuspectReply } from "./api/_lib/gemini.js";

const r = await generateSuspectReply({
  systemInstruction: "너는 저택의 집사 '박 집사'다. 공손한 말투를 쓰고, 범인이 누구인지는 모른다고 답한다.",
  history: [],
  message: "어젯밤 어디 계셨습니까?",
});
console.log(r);
