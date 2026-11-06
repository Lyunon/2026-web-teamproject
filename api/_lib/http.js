// 모든 API 핸들러가 공통으로 쓰는 래퍼.
// Vercel 서버리스 함수와 로컬 server.mjs 양쪽에서 같은 코드로 동작한다.
// 응답 형식: { ok: true, data } 또는 { ok: false, error }

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function parseBody(raw) {
  if (raw == null) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "요청 형식이 올바르지 않습니다.");
  }
}

export function route(methods, handler) {
  return async function (req, res) {
    res.setHeader("Cache-Control", "no-store");
    try {
      if (!methods.includes(req.method)) {
        res.setHeader("Allow", methods.join(", "));
        throw new HttpError(405, "허용되지 않는 요청입니다.");
      }
      const body = req.method === "GET" ? {} : parseBody(req.body);
      const data = await handler({ body, query: req.query ?? {} });
      res.status(200).json({ ok: true, data });
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.status).json({ ok: false, error: err.message });
      } else {
        console.error("[api] 처리되지 않은 오류:", err);
        res.status(500).json({ ok: false, error: "서버 오류가 발생했습니다." });
      }
    }
  };
}