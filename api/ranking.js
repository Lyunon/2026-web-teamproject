// GET /api/ranking?caseId=mansion-001&limit=10
// 사건별 랭킹. uid 는 내보내지 않는다. 로그인 토큰을 보내면 내 순위(me)도 함께 준다.

import { route } from "./_lib/http.js";
import { loadCase } from "./_lib/caseStore.js";
import { optionalUser } from "./_lib/firebase.js";
import { rankingCol, rankingRef } from "./_lib/session.js";

export default route(["GET"], async ({ query, req }) => {
  const caseId = String(query.caseId || "");
  loadCase(caseId); // 있는 사건인지만 확인한다
  const limit = Math.min(Math.max(Math.floor(Number(query.limit)) || 10, 1), 50);

  const col = rankingCol(caseId);
  const snap = await col.orderBy("sortKey", "desc").limit(limit).get();
  const user = await optionalUser(req);

  const row = (d, rank, isMe) => ({
    rank,
    nickname: d.nickname,
    score: d.score,
    elapsedSeconds: d.elapsedSeconds,
    hintCount: d.hintCount,
    isMe,
  });
  const top = snap.docs.map((doc, i) => row(doc.data(), i + 1, doc.id === user?.uid));

  let me = top.find((r) => r.isMe) || null;
  if (user && !me) {
    const mine = await rankingRef(user.uid, caseId).get();
    if (mine.exists) {
      const d = mine.data();
      const higher = await col.where("sortKey", ">", d.sortKey).count().get();
      me = row(d, higher.data().count + 1, true);
    }
  }
  return { caseId, top, me };
});
