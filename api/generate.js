// POST /api/generate  { genre, difficulty }
// Gemini 로 새 사건을 만들고 봉인한 caseToken 과 공개 정보를 돌려준다. 정답은 caseToken 안에만 있다.
//   genre: mansion | gallery | train | random
//   difficulty: easy | normal | hard | expert

import { route, HttpError } from "./_lib/http.js";
import { requireUser } from "./_lib/firebase.js";
import { GeminiError } from "./_lib/gemini.js";
import { generateCase } from "./_lib/caseGenerator.js";
import { sealCase } from "./_lib/caseToken.js";
import { DIFFICULTY_RULES } from "./_lib/difficulty.js";
import { GENRES, RANDOM_GENRE } from "../public/js/genres.js";

const GENRE_IDS = [...GENRES.map((g) => g.id), RANDOM_GENRE.id];

// 베타 기간에는 원인 코드(예: TIMEOUT)를 문구 끝에 붙여 화면만 보고도 원인을 알 수 있게 한다. 키·프롬프트는 노출하지 않는다.
function toHttpError(err) {
  const code = err instanceof GeminiError ? err.code : "UNKNOWN";
  const e = mapError(code);
  e.message = `${e.message} (오류 코드: ${code})`;
  return e;
}

function mapError(code) {
  switch (code) {
    case "RATE_LIMIT":
      return new HttpError(429, "사건 생성 요청이 몰렸습니다. 잠시 후 다시 시도해 주세요.");
    case "TIMEOUT":
    case "UNAVAILABLE":
    case "BAD_RESPONSE":
      return new HttpError(503, "사건을 완성하지 못했습니다. 한 번 더 시도해 주세요.");
    case "BAD_REQUEST":
      return new HttpError(400, "요청 내용을 확인해 주세요.");
    default:
      // CONFIG / AUTH / BILLING / MODEL_NOT_FOUND / UNKNOWN: 내부 사정은 노출하지 않는다.
      return new HttpError(500, "서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요.");
  }
}

export default route(["POST"], async ({ body, req }) => {
  const genre = String(body.genre ?? "");
  const difficulty = String(body.difficulty ?? "");
  if (!GENRE_IDS.includes(genre)) throw new HttpError(400, "장르를 선택해 주세요.");
  if (!Object.hasOwn(DIFFICULTY_RULES, difficulty)) throw new HttpError(400, "난이도를 선택해 주세요.");

  await requireUser(req); // 로그인한 사용자만 Gemini 를 쓸 수 있다

  let made;
  try {
    made = await generateCase({ genreId: genre, difficultyId: difficulty });
  } catch (err) {
    console.error("[generate] 실패:", err?.code || err?.message || err);
    throw toHttpError(err);
  }

  const { id, public: pub, secret } = made;
  return {
    caseId: id,
    caseToken: sealCase({ id, public: pub, secret }),
    title: pub.title,
    intro: pub.intro,
    genre: pub.genre,
    difficulty: pub.difficulty,
    difficultyId: pub.difficultyId,
    suspectCount: pub.suspects.length,
    createdAt: Date.now(),
  };
});
