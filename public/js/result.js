import { requireUser } from "./firebase.js";
import { mountHeader } from "./ui.js";

const user = await requireUser();
mountHeader(user);

const raw = sessionStorage.getItem("lastResult");
if (!raw) location.replace("cases.html");
const r = JSON.parse(raw);

const $ = (id) => document.getElementById(id);
$("result-case").textContent = r.caseTitle;
const title = $("result-title");
title.textContent = r.correct ? "사건 해결!" : "추리 실패";
title.className = r.correct ? "correct" : "wrong";
$("result-culprit").textContent = `진범: ${r.culpritName}`;
$("result-score").textContent = `점수: ${r.score}점`;
$("result-explain").textContent = r.explanation;
