// 로컬 개발 서버: public/ 정적 파일 + /api/* 를 api/ 핸들러로 연결한다.
// 실행: node --env-file=.env server.mjs   (또는 npm run dev)
// Vercel/로그인 없이 동작한다. 같은 api/*.js를 나중에 Vercel에 그대로 올린다.
// 내 컴퓨터(127.0.0.1)에서만 접속된다. Gemini 키 보호용.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(root, "public");
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 100_000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) tooLarge = true;
      else chunks.push(c);
    });
    req.on("end", () => (tooLarge ? reject(new Error("TOO_LARGE")) : resolve(Buffer.concat(chunks).toString("utf8"))));
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function handleApi(req, res, url) {
  const name = url.pathname.slice("/api/".length);
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return sendJson(res, 404, { ok: false, error: "없는 API입니다." });

  const file = path.join(root, "api", `${name}.js`);
  if (!fs.existsSync(file)) return sendJson(res, 404, { ok: false, error: "없는 API입니다." });

  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const raw = await readBody(req);
      req.body = raw || undefined;
    } catch {
      return sendJson(res, 413, { ok: false, error: "요청이 너무 큽니다." });
    }
  }

  // Vercel 함수가 쓰는 res.status().json() 을 흉내 낸다.
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(obj));
    return res;
  };

  const mod = await import(pathToFileURL(file).href);
  await mod.default(req, res);
}

function handleStatic(req, res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.statusCode = 400;
    return res.end("Bad Request");
  }

  if (pathname === "/") {
    pathname = fs.existsSync(path.join(pub, "index.html")) ? "/index.html" : "/dev.html";
  }

  const file = path.normalize(path.join(pub, pathname));
  if (!file.startsWith(pub + path.sep)) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.statusCode = 404;
    return res.end("Not Found");
  }

  res.setHeader("Content-Type", MIME[path.extname(file).toLowerCase()] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    req.query = Object.fromEntries(url.searchParams);

    if (url.pathname.startsWith("/api/")) await handleApi(req, res, url);
    else handleStatic(req, res, url);
  } catch (err) {
    console.error("[server]", err);
    if (!res.headersSent) sendJson(res, 500, { ok: false, error: "서버 오류가 발생했습니다." });
    else res.end();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`http://localhost:${PORT}/dev.html`);
});