import { USE_MOCK } from "./config.js";
import { getIdToken } from "./firebase.js";

async function call(path, body, method = "POST") {
  if (USE_MOCK) {
    const mock = await import("./mock.js"); // 실서비스에서는 로드되지 않음
    return mock.handle(path, body);
  }

  const token = await getIdToken();
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
  } catch {
    throw new Error("네트워크 오류가 발생했습니다.");
  }

  const json = await res.json().catch(() => null);
  if (!json || !json.ok) {
    throw new Error(json?.error || `요청에 실패했습니다. (${res.status})`);
  }
  return json.data;
}

export const api = {
  listCases: () => call("/api/cases", null, "GET"),
  startSession: (p) => call("/api/session/start", p),
  interrogate: (p) => call("/api/interrogate", p),
  investigate: (p) => call("/api/investigate", p),
  hint: (p) => call("/api/hint", p),
  accuse: (p) => call("/api/accuse", p),
};
