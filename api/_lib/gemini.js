// api/_lib/gemini.js
// Gemini 호출 전담 모듈. 모델 목록, 타임아웃, 재시도, 모델 전환, JSON 검증을 여기서만 처리한다.
// 서버 전용: GEMINI_API_KEY는 환경변수에서만 읽는다.

import { GoogleGenAI } from "@google/genai";

// ---------- 설정 ----------
export const EMOTIONS = ["calm", "nervous", "angry", "sad"];

const parseList = (value, fallback) => {
  const arr = String(value || "").split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : fallback;
};

// 심문 대화용 모델 (앞에서부터 시도, 429면 다음 모델로 전환)
// .env 예: GEMINI_MODELS=gemini-3.5-flash-lite,<두 번째 모델 ID>
export const CHAT_MODELS = parseList(process.env.GEMINI_MODELS, ["gemini-3.5-flash-lite"]);
// 최종 서술식 채점용 모델 (지정하지 않으면 대화용과 같게)
export const GRADER_MODELS = parseList(process.env.GEMINI_GRADER_MODELS, CHAT_MODELS);

const DEFAULTS = {
  temperature: 0.8,
  maxOutputTokens: 1024,
  perAttemptTimeoutMs: 12000, // 한 번의 호출 제한
  totalBudgetMs: 25000,       // 재시도와 모델 전환을 모두 합친 제한
  maxHistoryTurns: 12,        // 프롬프트에 넣을 최근 대화 수
  maxMessageChars: 500,
  maxReplyChars: 800,
};

export const SUSPECT_REPLY_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    emotion: { type: "string", enum: EMOTIONS },
  },
  required: ["reply", "emotion"],
};

// ---------- 오류 ----------
export class GeminiError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.name = "GeminiError";
    this.code = code; // CONFIG | AUTH | BILLING | BAD_REQUEST | RATE_LIMIT | MODEL_NOT_FOUND
                      // TIMEOUT | UNAVAILABLE | BAD_RESPONSE | UNKNOWN
    Object.assign(this, extra);
  }
}

function classify(err) {
  if (err instanceof GeminiError) return err.code;
  const status = Number(err?.status ?? err?.code);
  const msg = String(err?.message ?? "");
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return "TIMEOUT";
  if (status === 429 || /RESOURCE_EXHAUSTED/.test(msg)) return "RATE_LIMIT";
  if (status === 404) return "MODEL_NOT_FOUND";
  if (status === 402) return "BILLING";
  if (status === 401 || status === 403) return "AUTH";
  if (status === 400) return "BAD_REQUEST";
  if (status >= 500 || /fetch failed|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/.test(msg)) return "UNAVAILABLE";
  return "UNKNOWN";
}

// 같은 모델로 다시 시도할 오류
const RETRY_SAME = new Set(["TIMEOUT", "UNAVAILABLE", "BAD_RESPONSE"]);
// 다음 모델로 넘어갈 오류
const NEXT_MODEL = new Set(["RATE_LIMIT", "MODEL_NOT_FOUND"]);

// ---------- 클라이언트 ----------
let client;
function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new GeminiError("CONFIG", "GEMINI_API_KEY가 설정되지 않았습니다.");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// history: [{ role: "user" | "model", text }]  →  Gemini contents 형식
function buildContents(history, message, opts) {
  const past = (history || [])
    .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .slice(-opts.maxHistoryTurns)
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, opts.maxReplyChars) }] }));

  const current = String(message ?? "").trim().slice(0, opts.maxMessageChars);
  if (!current) throw new GeminiError("BAD_REQUEST", "메시지가 비어 있습니다.");
  return [...past, { role: "user", parts: [{ text: current }] }];
}

async function callOnce({ model, systemInstruction, contents, schema, validate, opts, timeoutMs }) {
  const res = await getClient().models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: opts.temperature,
      maxOutputTokens: opts.maxOutputTokens,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      abortSignal: AbortSignal.timeout(timeoutMs),
    },
  });

  const text = res?.text;
  if (!text) throw new GeminiError("BAD_RESPONSE", "빈 응답 (안전 필터 또는 토큰 초과 가능)", { model });

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new GeminiError("BAD_RESPONSE", "JSON 파싱 실패", { model });
  }
  return validate ? validate(data) : data;
}

// ---------- 공용 호출 (모델 전환 + 재시도) ----------
/**
 * @param {object} p
 * @param {string[]} p.models            시도할 모델 ID 목록 (앞이 우선)
 * @param {string}   p.systemInstruction 시스템 프롬프트
 * @param {Array}    p.history           [{role, text}]
 * @param {string}   p.message           이번 사용자 입력
 * @param {object}   p.schema            응답 JSON 스키마
 * @param {Function} [p.validate]        응답 검증·정리 함수 (실패 시 GeminiError 던짐)
 * @param {object}   [p.options]         DEFAULTS 덮어쓰기
 * @returns {Promise<{ data: any, model: string }>}
 */
export async function generateStructured({
  models, systemInstruction, history, message, schema, validate, options,
}) {
  const opts = { ...DEFAULTS, ...options };
  const contents = buildContents(history, message, opts);
  const deadline = Date.now() + opts.totalBudgetMs;
  let lastErr = new GeminiError("UNKNOWN", "호출을 시도하지 못했습니다.");

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 1500) throw lastErr;

      try {
        const data = await callOnce({
          model, systemInstruction, contents, schema, validate, opts,
          timeoutMs: Math.min(opts.perAttemptTimeoutMs, remaining),
        });
        return { data, model };
      } catch (e) {
        const code = classify(e);
        lastErr = e instanceof GeminiError ? e : new GeminiError(code, e?.message || code, { model });
        // 서버 로그용. 키와 프롬프트 내용은 남기지 않는다.
        console.error(`[gemini] model=${model} attempt=${attempt + 1} code=${code} status=${e?.status ?? "-"}`);

        if (NEXT_MODEL.has(code)) break;                    // 다음 모델로
        if (RETRY_SAME.has(code) && attempt === 0) {        // 같은 모델 1회 재시도
          await sleep(600 + Math.random() * 300);
          continue;
        }
        if (RETRY_SAME.has(code)) break;                    // 재시도도 실패 → 다음 모델
        throw lastErr;                                      // 설정·인증·요청 오류는 즉시 중단
      }
    }
  }
  throw lastErr;
}

// ---------- 용의자 대화 ----------
function validateSuspectReply(data, maxChars) {
  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new GeminiError("BAD_RESPONSE", "reply가 비어 있습니다.");
  const emotion = EMOTIONS.includes(data?.emotion) ? data.emotion : "calm";
  return { reply: reply.slice(0, maxChars), emotion };
}

/** 용의자 한 명의 답변을 생성한다. 반환: { reply, emotion, model } */
export async function generateSuspectReply({ systemInstruction, history, message, options }) {
  const maxChars = options?.maxReplyChars ?? DEFAULTS.maxReplyChars;
  const { data, model } = await generateStructured({
    models: CHAT_MODELS,
    systemInstruction,
    history,
    message,
    schema: SUSPECT_REPLY_SCHEMA,
    validate: (d) => validateSuspectReply(d, maxChars),
    options,
  });
  return { ...data, model };
}

// ---------- 사용자에게 보여줄 오류 변환 ----------
/** API 핸들러의 catch에서 사용: { status, message } */
export function toPublicError(err) {
  const code = err instanceof GeminiError ? err.code : classify(err);
  switch (code) {
    case "RATE_LIMIT":
      return { status: 429, message: "용의자가 잠시 생각 중입니다. 잠시 후 다시 시도해 주세요." };
    case "TIMEOUT":
    case "UNAVAILABLE":
    case "BAD_RESPONSE":
      return { status: 503, message: "용의자의 대답을 받지 못했습니다. 다시 시도해 주세요." };
    case "BAD_REQUEST":
      return { status: 400, message: "요청 내용을 확인해 주세요." };
    default:
      // CONFIG / AUTH / BILLING / MODEL_NOT_FOUND / UNKNOWN: 내부 사정은 노출하지 않는다.
      return { status: 500, message: "서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요." };
  }
}