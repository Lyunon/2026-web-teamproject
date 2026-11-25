// detective-visual-scene-v5/public/js/play.js
// 에피소드 JSON(scene.theme + scene.hotspots)에 따라 사건 현장 배경 일러스트와 온클릭 증거 오브젝트가 동적으로 변경되는 엔진

// 1. 배경 테마별 방 일러스트 SVG 템플릿 (저택 서재 / 미술관 전시실 / 특급열차 객실)
const SCENE_THEME_BACKGROUNDS = {
  mansion_study: `
      <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
<linearGradient id="bgWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2523"/><stop offset="1" stop-color="#111715"/></linearGradient>
<linearGradient id="bgSideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0e0d"/><stop offset="1" stop-color="#161e1c"/></linearGradient>
<linearGradient id="bgSideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#0a0e0d"/><stop offset="1" stop-color="#161e1c"/></linearGradient>
<pattern id="bgPaper" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M13 0V26" stroke="rgba(255,255,255,0.03)" stroke-width="1"/><path d="M13 9l4 4-4 4-4-4z" fill="rgba(255,255,255,0.025)"/></pattern>
<linearGradient id="bgPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e1d13"/><stop offset="1" stop-color="#170e09"/></linearGradient>
<linearGradient id="bgFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a10"/><stop offset="1" stop-color="#0b0705"/></linearGradient>
<linearGradient id="bgRug" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40141a"/><stop offset="1" stop-color="#22090d"/></linearGradient>
<linearGradient id="bgDeskTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4e2e1b"/><stop offset="1" stop-color="#6a3f25"/></linearGradient>
<linearGradient id="bgDeskFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2315"/><stop offset="1" stop-color="#1b0f08"/></linearGradient>
<linearGradient id="bgCurtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a080c"/><stop offset="0.5" stop-color="#4c1016"/><stop offset="1" stop-color="#22060a"/></linearGradient>
<linearGradient id="bgBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(150,190,220,0.16)"/><stop offset="1" stop-color="rgba(150,190,220,0)"/></linearGradient>
<linearGradient id="bgBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d58e"/><stop offset="1" stop-color="#7a5418"/></linearGradient>
<linearGradient id="bgShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7a52"/><stop offset="1" stop-color="#123b25"/></linearGradient>
<radialGradient id="bgLamp" cx="645" cy="330" r="430" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="rgba(255,200,120,0.34)"/><stop offset="0.45" stop-color="rgba(255,170,90,0.10)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
<radialGradient id="bgWin" cx="295" cy="140" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="rgba(120,170,205,0.22)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
<radialGradient id="bgBulb" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,236,190,0.95)"/><stop offset="1" stop-color="rgba(255,200,120,0)"/></radialGradient>
</defs>
      <rect width="1280" height="680" fill="#090c0b"/>
      <polygon points="0,0 1280,0 1060,40 190,40" fill="#0c100f"/>
      <rect x="190" y="40" width="870" height="390" fill="url(#bgWall)"/><rect x="190" y="40" width="870" height="390" fill="url(#bgPaper)"/>
      <polygon points="0,0 190,40 190,430 0,540" fill="url(#bgSideL)"/><polygon points="0,0 190,40 190,430 0,540" fill="url(#bgPaper)" opacity="0.6"/>
      <polygon points="1280,0 1060,40 1060,430 1280,540" fill="url(#bgSideR)"/><polygon points="1280,0 1060,40 1060,430 1280,540" fill="url(#bgPaper)" opacity="0.6"/>
      <rect x="190" y="40" width="870" height="10" fill="#22160e"/>
      <rect x="190" y="300" width="870" height="130" fill="url(#bgPanel)"/>
      <rect x="200" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="343" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="486" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="629" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="772" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="915" y="316" width="128" height="98" fill="rgba(0,0,0,0.18)" stroke="rgba(255,220,180,0.06)" stroke-width="2"/>
      <rect x="190" y="296" width="870" height="7" fill="#4a2f1d"/><rect x="190" y="296" width="870" height="2" fill="rgba(255,220,170,0.12)"/>
      <polygon points="0,410 190,300 190,430 0,540" fill="#1a100a"/><polygon points="1280,410 1060,300 1060,430 1280,540" fill="#1a100a"/>
      <polygon points="0,404 190,296 190,303 0,412" fill="#3a2416"/><polygon points="1280,404 1060,296 1060,303 1280,412" fill="#3a2416"/>
      <polygon points="0,540 190,430 1060,430 1280,540 1280,680 0,680" fill="url(#bgFloor)"/>
      <line x1="-63" y1="430" x2="-700" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="-29.8" y1="430" x2="-636" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="3.5" y1="430" x2="-572" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="36.7" y1="430" x2="-508" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="69.9" y1="430" x2="-444" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="103.2" y1="430" x2="-380" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="136.4" y1="430" x2="-316" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="169.6" y1="430" x2="-252" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="202.9" y1="430" x2="-188" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="236.1" y1="430" x2="-124" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="269.3" y1="430" x2="-60" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="302.6" y1="430" x2="4" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="335.8" y1="430" x2="68" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="369" y1="430" x2="132" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="402.2" y1="430" x2="196" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="435.5" y1="430" x2="260" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="468.7" y1="430" x2="324" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="501.9" y1="430" x2="388" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="535.2" y1="430" x2="452" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="568.4" y1="430" x2="516" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="601.6" y1="430" x2="580" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="634.9" y1="430" x2="644" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="668.1" y1="430" x2="708" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="701.3" y1="430" x2="772" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="734.6" y1="430" x2="836" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="767.8" y1="430" x2="900" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="801" y1="430" x2="964" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="834.2" y1="430" x2="1028" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="867.5" y1="430" x2="1092" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="900.7" y1="430" x2="1156" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="933.9" y1="430" x2="1220" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="967.2" y1="430" x2="1284" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1000.4" y1="430" x2="1348" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1033.6" y1="430" x2="1412" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1066.9" y1="430" x2="1476" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1100.1" y1="430" x2="1540" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1133.3" y1="430" x2="1604" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1166.6" y1="430" x2="1668" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1199.8" y1="430" x2="1732" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1233" y1="430" x2="1796" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1266.2" y1="430" x2="1860" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1299.5" y1="430" x2="1924" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="1332.7" y1="430" x2="1988" y2="680" stroke="rgba(0,0,0,0.38)" stroke-width="1.4"/>
      <line x1="0" y1="462" x2="1280" y2="462" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>
      <line x1="0" y1="505" x2="1280" y2="505" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>
      <line x1="0" y1="565" x2="1280" y2="565" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>
      <line x1="0" y1="640" x2="1280" y2="640" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>
      <polygon points="236,218 358,218 520,520 120,520" fill="url(#bgBeam)"/>
      <polygon points="230,468 1000,468 1140,662 100,662" fill="url(#bgRug)"/>
      <polygon points="248,478 982,478 1112,652 128,652" fill="none" stroke="#8a5c2c" stroke-width="3"/>
      <polygon points="268,490 962,490 1082,640 158,640" fill="none" stroke="rgba(200,150,80,0.35)" stroke-width="1.5" stroke-dasharray="10 6"/>
      <ellipse cx="620" cy="566" rx="170" ry="44" fill="rgba(0,0,0,0.18)" stroke="rgba(200,150,80,0.35)" stroke-width="2"/>
      <ellipse cx="620" cy="566" rx="95" ry="22" fill="none" stroke="rgba(200,150,80,0.25)" stroke-width="1.5"/>
      <circle cx="752" cy="566" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="734.3" cy="582.5" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="686" cy="594.6" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="620" cy="599" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="554" cy="594.6" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="505.7" cy="582.5" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="488" cy="566" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="505.7" cy="549.5" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="554" cy="537.4" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="620" cy="533" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="686" cy="537.4" r="3" fill="rgba(200,150,80,0.35)"/>
      <circle cx="734.3" cy="549.5" r="3" fill="rgba(200,150,80,0.35)"/>
      <rect x="198" y="46" width="196" height="5" rx="2" fill="url(#bgBrass)"/>
      <path d="M202,50 L238,50 L244,300 Q220.0,310 198,300 Z" fill="url(#bgCurtain)"/>
      <line x1="211" y1="54" x2="213" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <line x1="220" y1="54" x2="222" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <line x1="229" y1="54" x2="231" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <path d="M352,50 L390,50 L384,300 Q371.0,310 356,300 Z" fill="url(#bgCurtain)"/>
      <line x1="361.5" y1="54" x2="359.5" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <line x1="371" y1="54" x2="369" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <line x1="380.5" y1="54" x2="378.5" y2="298" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
      <rect x="596" y="52" width="348" height="250" fill="#140c07" stroke="#3a2617" stroke-width="7"/>
      <rect x="604" y="71" width="9" height="41" fill="#4a1d1d"/>
      <rect x="604" y="77" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="604" y="71" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="614" y="63" width="7" height="49" fill="#2a1e16"/>
      <rect x="614" y="69" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="614" y="63" width="1.5" height="49" fill="rgba(255,255,255,0.06)"/>
      <rect x="621" y="74" width="8" height="38" fill="#1d3833"/>
      <rect x="621" y="80" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="621" y="74" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="629" y="74" width="8" height="38" fill="#4a4030"/>
      <rect x="629" y="80" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="629" y="74" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="638" y="74" width="7" height="38" fill="#4a1d1d"/>
      <rect x="638" y="80" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="638" y="74" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="645" y="69" width="9" height="43" fill="#1d3833"/>
      <rect x="645" y="75" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="645" y="69" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="655" y="76" width="9" height="36" fill="#4a4030"/>
      <rect x="655" y="82" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="655" y="76" width="1.5" height="36" fill="rgba(255,255,255,0.06)"/>
      <rect x="664" y="66" width="15" height="46" fill="#1d3833"/>
      <rect x="664" y="72" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="664" y="66" width="1.5" height="46" fill="rgba(255,255,255,0.06)"/>
      <rect x="680" y="71" width="15" height="41" fill="#6a5a3c"/>
      <rect x="680" y="77" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="680" y="71" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="695" y="65" width="10" height="47" fill="#2c2948"/>
      <rect x="695" y="71" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="695" y="65" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="705" y="69" width="11" height="43" fill="#552a1a"/>
      <rect x="705" y="75" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="705" y="69" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="717" y="76" width="8" height="36" fill="#2a1e16"/>
      <rect x="717" y="82" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="717" y="76" width="1.5" height="36" fill="rgba(255,255,255,0.06)"/>
      <rect x="725" y="71" width="14" height="41" fill="#4a1d1d"/>
      <rect x="725" y="77" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="725" y="71" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="739" y="72" width="12" height="40" fill="#6a5a3c"/>
      <rect x="739" y="78" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="739" y="72" width="1.5" height="40" fill="rgba(255,255,255,0.06)"/>
      <rect x="752" y="64" width="8" height="48" fill="#1d3833"/>
      <rect x="752" y="70" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="752" y="64" width="1.5" height="48" fill="rgba(255,255,255,0.06)"/>
      <rect x="760" y="77" width="8" height="35" fill="#3a281b"/>
      <rect x="760" y="83" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="760" y="77" width="1.5" height="35" fill="rgba(255,255,255,0.06)"/>
      <rect x="769" y="66" width="11" height="46" fill="#1f2f2c"/>
      <rect x="769" y="72" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="769" y="66" width="1.5" height="46" fill="rgba(255,255,255,0.06)"/>
      <rect x="797" y="70" width="8" height="42" fill="#4a1d1d"/>
      <rect x="797" y="76" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="797" y="70" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="805" y="71" width="10" height="41" fill="#1f2f2c"/>
      <rect x="805" y="77" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="805" y="71" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="815" y="71" width="14" height="41" fill="#2a1e16"/>
      <rect x="815" y="77" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="815" y="71" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="829" y="73" width="15" height="39" fill="#1f2f2c"/>
      <rect x="829" y="79" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="829" y="73" width="1.5" height="39" fill="rgba(255,255,255,0.06)"/>
      <rect x="845" y="75" width="10" height="37" fill="#1d3833"/>
      <rect x="845" y="81" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="845" y="75" width="1.5" height="37" fill="rgba(255,255,255,0.06)"/>
      <rect x="855" y="70" width="7" height="42" fill="#4a4030"/>
      <rect x="855" y="76" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="855" y="70" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="878" y="75" width="12" height="37" fill="#2a1e16"/>
      <rect x="878" y="81" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="878" y="75" width="1.5" height="37" fill="rgba(255,255,255,0.06)"/>
      <rect x="891" y="70" width="7" height="42" fill="#2a1e16"/>
      <rect x="891" y="76" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="891" y="70" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="898" y="67" width="14" height="45" fill="#1f2f2c"/>
      <rect x="898" y="73" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="898" y="67" width="1.5" height="45" fill="rgba(255,255,255,0.06)"/>
      <rect x="912" y="75" width="14" height="37" fill="#1d3833"/>
      <rect x="912" y="81" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="912" y="75" width="1.5" height="37" fill="rgba(255,255,255,0.06)"/>
      <rect x="596" y="112" width="348" height="6" fill="#3a2617"/>
      <rect x="604" y="136" width="12" height="36" fill="#1d3833"/>
      <rect x="604" y="142" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="604" y="136" width="1.5" height="36" fill="rgba(255,255,255,0.06)"/>
      <rect x="617" y="125" width="11" height="47" fill="#4a4030"/>
      <rect x="617" y="131" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="617" y="125" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="628" y="122" width="14" height="50" fill="#552a1a"/>
      <rect x="628" y="128" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="628" y="122" width="1.5" height="50" fill="rgba(255,255,255,0.06)"/>
      <rect x="642" y="128" width="12" height="44" fill="#552a1a"/>
      <rect x="642" y="134" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="642" y="128" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="654" y="125" width="10" height="47" fill="#2c2948"/>
      <rect x="654" y="131" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="654" y="125" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="664" y="134" width="11" height="38" fill="#3a281b"/>
      <rect x="664" y="140" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="664" y="134" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="675" y="126" width="10" height="46" fill="#5a4827"/>
      <rect x="675" y="132" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="675" y="126" width="1.5" height="46" fill="rgba(255,255,255,0.06)"/>
      <rect x="685" y="129" width="13" height="43" fill="#5a4827"/>
      <rect x="685" y="135" width="13" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="685" y="129" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="698" y="128" width="7" height="44" fill="#552a1a"/>
      <rect x="698" y="134" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="698" y="128" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="706" y="122" width="12" height="50" fill="#6a5a3c"/>
      <rect x="706" y="128" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="706" y="122" width="1.5" height="50" fill="rgba(255,255,255,0.06)"/>
      <rect x="718" y="129" width="8" height="43" fill="#552a1a"/>
      <rect x="718" y="135" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="718" y="129" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="726" y="121" width="7" height="51" fill="#6a5a3c"/>
      <rect x="726" y="127" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="726" y="121" width="1.5" height="51" fill="rgba(255,255,255,0.06)"/>
      <rect x="733" y="124" width="8" height="48" fill="#5a4827"/>
      <rect x="733" y="130" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="733" y="124" width="1.5" height="48" fill="rgba(255,255,255,0.06)"/>
      <rect x="741" y="134" width="12" height="38" fill="#1f2f2c"/>
      <rect x="741" y="140" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="741" y="134" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="754" y="131" width="9" height="41" fill="#2c2948" transform="rotate(12 763 172)"/>
      <rect x="771" y="132" width="14" height="40" fill="#4a4030"/>
      <rect x="771" y="138" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="771" y="132" width="1.5" height="40" fill="rgba(255,255,255,0.06)"/>
      <rect x="785" y="132" width="12" height="40" fill="#2a1e16"/>
      <rect x="785" y="138" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="785" y="132" width="1.5" height="40" fill="rgba(255,255,255,0.06)"/>
      <rect x="818" y="132" width="15" height="40" fill="#1f2f2c"/>
      <rect x="818" y="138" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="818" y="132" width="1.5" height="40" fill="rgba(255,255,255,0.06)"/>
      <rect x="833" y="136" width="10" height="36" fill="#3a281b"/>
      <rect x="833" y="142" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="833" y="136" width="1.5" height="36" fill="rgba(255,255,255,0.06)"/>
      <rect x="844" y="128" width="12" height="44" fill="#2a1e16"/>
      <rect x="844" y="134" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="844" y="128" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="877" y="123" width="14" height="49" fill="#2a1e16"/>
      <rect x="877" y="129" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="877" y="123" width="1.5" height="49" fill="rgba(255,255,255,0.06)"/>
      <rect x="891" y="122" width="7" height="50" fill="#2c2948"/>
      <rect x="891" y="128" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="891" y="122" width="1.5" height="50" fill="rgba(255,255,255,0.06)"/>
      <rect x="898" y="133" width="14" height="39" fill="#2a1e16"/>
      <rect x="898" y="139" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="898" y="133" width="1.5" height="39" fill="rgba(255,255,255,0.06)"/>
      <rect x="913" y="121" width="15" height="51" fill="#1d3833"/>
      <rect x="913" y="127" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="913" y="121" width="1.5" height="51" fill="rgba(255,255,255,0.06)"/>
      <rect x="596" y="172" width="348" height="6" fill="#3a2617"/>
      <rect x="604" y="182" width="15" height="50" fill="#2a1e16" transform="rotate(12 619 232)"/>
      <rect x="627" y="182" width="8" height="50" fill="#6a5a3c"/>
      <rect x="627" y="188" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="627" y="182" width="1.5" height="50" fill="rgba(255,255,255,0.06)"/>
      <rect x="636" y="188" width="10" height="44" fill="#552a1a"/>
      <rect x="636" y="194" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="636" y="188" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="646" y="188" width="10" height="44" fill="#2a1e16"/>
      <rect x="646" y="194" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="646" y="188" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="656" y="183" width="9" height="49" fill="#1d3833"/>
      <rect x="656" y="189" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="656" y="183" width="1.5" height="49" fill="rgba(255,255,255,0.06)"/>
      <rect x="665" y="183" width="10" height="49" fill="#1d3833"/>
      <rect x="665" y="189" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="665" y="183" width="1.5" height="49" fill="rgba(255,255,255,0.06)"/>
      <rect x="675" y="185" width="9" height="47" fill="#2c2948"/>
      <rect x="675" y="191" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="675" y="185" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="684" y="193" width="10" height="39" fill="#1f2f2c"/>
      <rect x="684" y="199" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="684" y="193" width="1.5" height="39" fill="rgba(255,255,255,0.06)"/>
      <rect x="694" y="191" width="10" height="41" fill="#1f2f2c"/>
      <rect x="694" y="197" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="694" y="191" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="704" y="185" width="10" height="47" fill="#6a5a3c"/>
      <rect x="704" y="191" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="704" y="185" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="732" y="184" width="7" height="48" fill="#6a5a3c"/>
      <rect x="732" y="190" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="732" y="184" width="1.5" height="48" fill="rgba(255,255,255,0.06)"/>
      <rect x="739" y="193" width="8" height="39" fill="#5a4827"/>
      <rect x="739" y="199" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="739" y="193" width="1.5" height="39" fill="rgba(255,255,255,0.06)"/>
      <rect x="747" y="195" width="11" height="37" fill="#2c2948"/>
      <rect x="747" y="201" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="747" y="195" width="1.5" height="37" fill="rgba(255,255,255,0.06)"/>
      <rect x="758" y="184" width="11" height="48" fill="#2c2948"/>
      <rect x="758" y="190" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="758" y="184" width="1.5" height="48" fill="rgba(255,255,255,0.06)"/>
      <rect x="770" y="194" width="12" height="38" fill="#3a281b"/>
      <rect x="770" y="200" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="770" y="194" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="783" y="188" width="8" height="44" fill="#4a1d1d"/>
      <rect x="783" y="194" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="783" y="188" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="791" y="194" width="10" height="38" fill="#3a281b"/>
      <rect x="791" y="200" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="791" y="194" width="1.5" height="38" fill="rgba(255,255,255,0.06)"/>
      <rect x="819" y="192" width="11" height="40" fill="#4a1d1d"/>
      <rect x="819" y="198" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="819" y="192" width="1.5" height="40" fill="rgba(255,255,255,0.06)"/>
      <rect x="830" y="188" width="9" height="44" fill="#4a1d1d"/>
      <rect x="830" y="194" width="9" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="830" y="188" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="839" y="190" width="15" height="42" fill="#3a281b"/>
      <rect x="839" y="196" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="839" y="190" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="855" y="196" width="12" height="36" fill="#3a281b" transform="rotate(12 867 232)"/>
      <rect x="893" y="181" width="10" height="51" fill="#5a4827"/>
      <rect x="893" y="187" width="10" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="893" y="181" width="1.5" height="51" fill="rgba(255,255,255,0.06)"/>
      <rect x="903" y="181" width="13" height="51" fill="#2a1e16"/>
      <rect x="903" y="187" width="13" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="903" y="181" width="1.5" height="51" fill="rgba(255,255,255,0.06)"/>
      <rect x="916" y="190" width="11" height="42" fill="#5a4827"/>
      <rect x="916" y="196" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="916" y="190" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="596" y="232" width="348" height="6" fill="#3a2617"/>
      <rect x="604" y="253" width="7" height="43" fill="#4a1d1d"/>
      <rect x="604" y="259" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="604" y="253" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="612" y="252" width="13" height="44" fill="#4a1d1d"/>
      <rect x="612" y="258" width="13" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="612" y="252" width="1.5" height="44" fill="rgba(255,255,255,0.06)"/>
      <rect x="625" y="250" width="11" height="46" fill="#3a281b" transform="rotate(12 636 296)"/>
      <rect x="644" y="243" width="11" height="53" fill="#4a1d1d"/>
      <rect x="644" y="249" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="644" y="243" width="1.5" height="53" fill="rgba(255,255,255,0.06)"/>
      <rect x="655" y="247" width="15" height="49" fill="#5a4827" transform="rotate(12 670 296)"/>
      <rect x="678" y="246" width="10" height="50" fill="#2c2948" transform="rotate(12 688 296)"/>
      <rect x="696" y="249" width="14" height="47" fill="#2a1e16"/>
      <rect x="696" y="255" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="696" y="249" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="710" y="255" width="7" height="41" fill="#3a281b"/>
      <rect x="710" y="261" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="710" y="255" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="717" y="245" width="7" height="51" fill="#4a1d1d"/>
      <rect x="717" y="251" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="717" y="245" width="1.5" height="51" fill="rgba(255,255,255,0.06)"/>
      <rect x="725" y="253" width="15" height="43" fill="#4a4030"/>
      <rect x="725" y="259" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="725" y="253" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="740" y="253" width="14" height="43" fill="#3a281b"/>
      <rect x="740" y="259" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="740" y="253" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="755" y="244" width="15" height="52" fill="#2a1e16"/>
      <rect x="755" y="250" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="755" y="244" width="1.5" height="52" fill="rgba(255,255,255,0.06)"/>
      <rect x="771" y="250" width="7" height="46" fill="#1d3833" transform="rotate(12 778 296)"/>
      <rect x="786" y="254" width="12" height="42" fill="#1f2f2c"/>
      <rect x="786" y="260" width="12" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="786" y="254" width="1.5" height="42" fill="rgba(255,255,255,0.06)"/>
      <rect x="809" y="242" width="10" height="54" fill="#3a281b" transform="rotate(12 819 296)"/>
      <rect x="827" y="255" width="15" height="41" fill="#2a1e16"/>
      <rect x="827" y="261" width="15" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="827" y="255" width="1.5" height="41" fill="rgba(255,255,255,0.06)"/>
      <rect x="843" y="249" width="8" height="47" fill="#5a4827"/>
      <rect x="843" y="255" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="843" y="249" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="851" y="242" width="14" height="54" fill="#1f2f2c"/>
      <rect x="851" y="248" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="851" y="242" width="1.5" height="54" fill="rgba(255,255,255,0.06)"/>
      <rect x="866" y="251" width="7" height="45" fill="#1d3833"/>
      <rect x="866" y="257" width="7" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="866" y="251" width="1.5" height="45" fill="rgba(255,255,255,0.06)"/>
      <rect x="873" y="253" width="11" height="43" fill="#4a1d1d"/>
      <rect x="873" y="259" width="11" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="873" y="253" width="1.5" height="43" fill="rgba(255,255,255,0.06)"/>
      <rect x="884" y="251" width="8" height="45" fill="#552a1a"/>
      <rect x="884" y="257" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="884" y="251" width="1.5" height="45" fill="rgba(255,255,255,0.06)"/>
      <rect x="893" y="243" width="14" height="53" fill="#1d3833"/>
      <rect x="893" y="249" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="893" y="243" width="1.5" height="53" fill="rgba(255,255,255,0.06)"/>
      <rect x="908" y="242" width="8" height="54" fill="#4a1d1d"/>
      <rect x="908" y="248" width="8" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="908" y="242" width="1.5" height="54" fill="rgba(255,255,255,0.06)"/>
      <rect x="916" y="249" width="14" height="47" fill="#1f2f2c"/>
      <rect x="916" y="255" width="14" height="2" fill="rgba(220,180,110,0.28)"/>
      <rect x="916" y="249" width="1.5" height="47" fill="rgba(255,255,255,0.06)"/>
      <rect x="596" y="296" width="348" height="6" fill="#3a2617"/>
      <polygon points="952,192 1136,186 1142,316 948,316" fill="#1c120b" stroke="#3a2617" stroke-width="3"/>
      <rect x="960" y="206" width="84" height="98" fill="rgba(0,0,0,0.2)" stroke="rgba(255,220,180,0.07)"/><rect x="1052" y="204" width="80" height="100" fill="rgba(0,0,0,0.2)" stroke="rgba(255,220,180,0.07)"/>
      <circle cx="1038" cy="256" r="2.5" fill="url(#bgBrass)"/><circle cx="1058" cy="256" r="2.5" fill="url(#bgBrass)"/>
      <rect x="1112" y="328" width="26" height="150" rx="4" fill="#24160e"/><rect x="1118" y="340" width="14" height="120" fill="#3a1418"/>
      <polygon points="962,476 1150,476 1172,506 940,506" fill="#4a1418" stroke="#24160e" stroke-width="2"/>
      <rect x="940" y="506" width="232" height="12" fill="#24160e"/>
      <rect x="952" y="518" width="8" height="78" fill="#1a0f09"/>
      <rect x="1158" y="518" width="8" height="78" fill="#1a0f09"/>
      <ellipse cx="1056" cy="600" rx="120" ry="10" fill="rgba(0,0,0,0.45)"/>
      <ellipse cx="650" cy="574" rx="300" ry="20" fill="rgba(0,0,0,0.55)"/>
      <polygon points="440,346 860,346 902,388 398,388" fill="url(#bgDeskTop)" stroke="#2a180e" stroke-width="2"/>
      <polygon points="398,388 902,388 902,396 398,396" fill="#7a4a2c"/>
      <rect x="398" y="396" width="504" height="172" fill="url(#bgDeskFront)"/>
      <rect x="412" y="408" width="150" height="44" rx="2" fill="#2a190f" stroke="#120a05" stroke-width="2"/>
      <rect x="420" y="414" width="134" height="32" fill="none" stroke="rgba(255,220,180,0.08)"/>
      <path d="M472,430 Q487,438 502,430" fill="none" stroke="url(#bgBrass)" stroke-width="3"/>
      <rect x="412" y="460" width="150" height="44" rx="2" fill="#2a190f" stroke="#120a05" stroke-width="2"/>
      <rect x="420" y="466" width="134" height="32" fill="none" stroke="rgba(255,220,180,0.08)"/>
      <path d="M472,482 Q487,490 502,482" fill="none" stroke="url(#bgBrass)" stroke-width="3"/>
      <rect x="412" y="512" width="150" height="44" rx="2" fill="#2a190f" stroke="#120a05" stroke-width="2"/>
      <rect x="420" y="518" width="134" height="32" fill="none" stroke="rgba(255,220,180,0.08)"/>
      <path d="M472,534 Q487,542 502,534" fill="none" stroke="url(#bgBrass)" stroke-width="3"/>
      <rect x="572" y="404" width="128" height="164" fill="#0d0805"/>
      <rect x="708" y="512" width="182" height="46" rx="2" fill="#2a190f" stroke="#120a05" stroke-width="2"/><path d="M784,534 Q799,542 814,534" fill="none" stroke="url(#bgBrass)" stroke-width="3"/>
      <ellipse cx="645" cy="362" rx="190" ry="22" fill="rgba(255,200,120,0.22)"/>
      <ellipse cx="645" cy="352" rx="22" ry="6" fill="url(#bgBrass)"/><rect x="642.5" y="318" width="5" height="34" fill="url(#bgBrass)"/>
      <ellipse cx="645" cy="330" rx="60" ry="16" fill="url(#bgBulb)"/>
      <path d="M607,322 Q645,296 683,322 L676,330 Q645,318 614,330 Z" fill="url(#bgShade)" stroke="#0b2416" stroke-width="1.5"/>
      <path d="M618,316 Q645,302 668,314" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
      <rect width="1280" height="680" fill="url(#bgLamp)"/><rect width="1280" height="680" fill="url(#bgWin)"/>
      <circle cx="734.1" cy="205" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="694.8" cy="208.7" r="0.7" fill="rgba(255,230,180,0.2)"/>
      <circle cx="649.3" cy="334" r="1" fill="rgba(255,230,180,0.2)"/>
      <circle cx="803" cy="293.1" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="621.5" cy="229" r="0.7" fill="rgba(255,230,180,0.2)"/>
      <circle cx="590.3" cy="221" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="546.6" cy="152.5" r="1.3" fill="rgba(255,230,180,0.2)"/>
      <circle cx="502.1" cy="231.9" r="1.5" fill="rgba(255,230,180,0.1)"/>
      <circle cx="794.6" cy="308.7" r="1.5" fill="rgba(255,230,180,0.2)"/>
      <circle cx="497.5" cy="289" r="1.2" fill="rgba(255,230,180,0.2)"/>
      <circle cx="810.2" cy="241.6" r="0.9" fill="rgba(255,230,180,0.3)"/>
      <circle cx="746.9" cy="239.8" r="0.6" fill="rgba(255,230,180,0.3)"/>
      <circle cx="616" cy="333.9" r="1.2" fill="rgba(255,230,180,0.2)"/>
      <circle cx="507.4" cy="346" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="527.1" cy="332.6" r="1.1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="667" cy="185.9" r="1" fill="rgba(255,230,180,0.2)"/>
      <circle cx="567" cy="305.1" r="1.3" fill="rgba(255,230,180,0.2)"/>
      <circle cx="561.1" cy="251.5" r="1.3" fill="rgba(255,230,180,0.1)"/>
      <circle cx="698.7" cy="165.8" r="1.1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="667.1" cy="245.1" r="0.9" fill="rgba(255,230,180,0.3)"/>
      <circle cx="625.3" cy="265" r="0.8" fill="rgba(255,230,180,0.2)"/>
      <circle cx="669" cy="217.1" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="548.7" cy="154.2" r="1.5" fill="rgba(255,230,180,0.2)"/>
      <circle cx="733.6" cy="194.1" r="0.9" fill="rgba(255,230,180,0.3)"/>
      <circle cx="649.4" cy="270.6" r="1" fill="rgba(255,230,180,0.3)"/>
      <circle cx="659.9" cy="316" r="1.4" fill="rgba(255,230,180,0.1)"/>
      </svg>
  `,
  art_gallery: `
    <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" /><stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b" /><stop offset="100%" stop-color="#090d16" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1280" height="440" fill="url(#gWall)" />
      <polygon points="0,0 200,80 200,440 0,540" fill="#131c31" stroke="#334155" stroke-width="2" />
      <polygon points="1280,0 1080,80 1080,440 1280,540" fill="#131c31" stroke="#334155" stroke-width="2" />
      <!-- 대리석 바닥 타일 -->
      <polygon points="0,540 200,440 1080,440 1280,540 1280,680 0,680" fill="url(#gFloor)" stroke="#475569" stroke-width="2" />
      <!-- 미술관 벽면 액자들 -->
      <rect x="270" y="130" width="140" height="180" fill="#172554" stroke="#e0a96d" stroke-width="4" />
      <rect x="870" y="130" width="140" height="180" fill="#31102f" stroke="#e0a96d" stroke-width="4" />
      <!-- 천장 스포트라이트 빔 -->
      <polygon points="640,0 490,560 790,560" fill="rgba(56, 189, 248, 0.10)" />
      <!-- 붉은 보안 레이저 라인 연출 -->
      <line x1="200" y1="390" x2="1080" y2="390" stroke="rgba(239, 68, 68, 0.45)" stroke-width="2" stroke-dasharray="8,6" />
      <line x1="200" y1="240" x2="1080" y2="490" stroke="rgba(239, 68, 68, 0.35)" stroke-width="1.5" stroke-dasharray="6,6" />
    </svg>
  `,
  luxury_train: `
    <svg class="crime-scene-bg-svg" viewBox="0 0 1280 680" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="tWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f1614" /><stop offset="100%" stop-color="#33221d" />
        </linearGradient>
      </defs>
      <!-- 열차 원목 객실 벽면 -->
      <rect x="0" y="0" width="1280" height="460" fill="url(#tWall)" />
      <!-- 열차 천장 아치 몰딩 -->
      <path d="M0,70 Q640,10 1280,70" fill="none" stroke="#c89654" stroke-width="4" />
      <rect x="0" y="340" width="1280" height="120" fill="#241713" stroke="#784f37" stroke-width="2" />
      <!-- 열차 카펫 바닥 -->
      <polygon points="0,460 1280,460 1280,680 0,680" fill="#1b263b" stroke="#c89654" stroke-width="3" />
      <!-- 좌측 침대칸 소파 구조물 -->
      <rect x="90" y="350" width="360" height="150" rx="14" fill="#4a1525" stroke="#8c3b4f" stroke-width="3" />
    </svg>
  `
};

// 2. 재사용 가능한 오브젝트 아이콘 SVG 프리셋 라이브러리 (Gemini가 iconType만 지정하면 자동 렌더링)
const OBJECT_SVG_LIBRARY = {
  door: `<svg width="90" height="170" viewBox="0 0 92 185"><defs><linearGradient id="odW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3520"/><stop offset="1" stop-color="#2c1910"/></linearGradient><radialGradient id="odK" cx="0.35" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffe7a8"/><stop offset="1" stop-color="#7a5418"/></radialGradient></defs><polygon points="2,9 90,1 90,176 2,184" fill="#1a0f09" stroke="#3a2416" stroke-width="3"/><polygon points="7,13 85,6 85,172 7,180" fill="#040202"/><polygon points="66,8 85,6 85,172 66,173" fill="rgba(255,196,120,0.32)"/><polygon points="7,13 68,4 68,177 7,180" fill="url(#odW)"/><polygon points="7,13 68,4 68,7 7,16" fill="rgba(255,220,170,0.15)"/><polygon points="15,23 60,16 60,82 15,86" fill="rgba(0,0,0,0.22)" stroke="rgba(255,220,180,0.14)" stroke-width="1.5"/><polygon points="15,98 60,95 60,166 15,169" fill="rgba(0,0,0,0.22)" stroke="rgba(255,220,180,0.14)" stroke-width="1.5"/><path d="M20,30 Q30,50 22,80 M44,22 Q50,60 46,80 M24,104 Q34,130 26,160" stroke="rgba(0,0,0,0.18)" stroke-width="1.2" fill="none"/><rect x="55" y="89" width="7" height="18" rx="2" fill="#6a4a18"/><circle cx="58.5" cy="98" r="4.6" fill="url(#odK)"/><circle cx="57" cy="96.5" r="1.4" fill="rgba(255,255,255,0.7)"/><ellipse cx="56" cy="99" rx="6" ry="4" fill="rgba(255,255,255,0.08)"/><polygon points="68,177 85,172 92,185 56,185" fill="rgba(255,196,120,0.16)"/></svg>`,
  window: `<svg width="130" height="155" viewBox="0 0 135 175"><defs><linearGradient id="owN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1824"/><stop offset="0.6" stop-color="#173246"/><stop offset="1" stop-color="#0a141c"/></linearGradient><linearGradient id="owF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a2e1b"/><stop offset="1" stop-color="#22140c"/></linearGradient><clipPath id="owC"><rect x="12" y="12" width="111" height="152"/></clipPath></defs><rect x="3" y="3" width="129" height="168" rx="2" fill="url(#owF)" stroke="#120a05" stroke-width="2"/><rect x="12" y="12" width="111" height="152" fill="url(#owN)"/><g clip-path="url(#owC)"><path d="M12,128 Q34,112 52,120 Q76,104 98,118 Q112,110 123,116 L123,164 L12,164 Z" fill="#050b10"/><path d="M84,108 L88,114 L74,124" stroke="#04080b" stroke-width="3" fill="none"/><polyline points="98,14 92,34 99,36 88,62" fill="none" stroke="rgba(215,230,255,0.85)" stroke-width="1.3"/><ellipse cx="94" cy="36" rx="30" ry="22" fill="rgba(170,200,255,0.12)"/><line x1="110" y1="70.1" x2="107.4" y2="80.3" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="47.4" y1="132.9" x2="44.2" y2="145.6" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="59.5" y1="125.5" x2="56.6" y2="136.9" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="66.4" y1="24.7" x2="63.3" y2="37.1" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="70.5" y1="82.4" x2="68.3" y2="90.9" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="37.9" y1="36.2" x2="34.8" y2="49" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="102.3" y1="116.3" x2="99.4" y2="128.1" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="23.1" y1="127.4" x2="21.8" y2="132.4" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="74.9" y1="19.5" x2="72.2" y2="30.2" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="81" y1="91.1" x2="78.9" y2="99.6" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="24.6" y1="57.9" x2="21.5" y2="70.4" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="41.9" y1="129.4" x2="40.7" y2="134.4" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="120.6" y1="54.7" x2="118.7" y2="62.2" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="39.9" y1="90.8" x2="37.6" y2="100.2" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="58.1" y1="108.8" x2="56.7" y2="114.3" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="108.7" y1="108.5" x2="107.3" y2="114.1" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="59.4" y1="68.1" x2="57.2" y2="77" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="90.9" y1="66.9" x2="88.8" y2="75.1" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="45.3" y1="137.4" x2="43.9" y2="142.9" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="35.4" y1="125.8" x2="33.8" y2="132.4" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="42.4" y1="143.8" x2="40.9" y2="149.7" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="79.3" y1="144.9" x2="77.1" y2="153.8" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="20" y1="100.8" x2="16.9" y2="113.2" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="16.5" y1="101" x2="14.4" y2="109.4" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="33.7" y1="79.6" x2="31" y2="90.3" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="26.1" y1="25.6" x2="24.5" y2="31.9" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="83.8" y1="90.6" x2="81.6" y2="99.4" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="91.6" y1="136.5" x2="88.4" y2="149.4" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="25.7" y1="25.4" x2="24.2" y2="31.1" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="108.7" y1="95.9" x2="105.9" y2="107" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="96.3" y1="59.1" x2="93.4" y2="70.5" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="89.5" y1="42.6" x2="87.1" y2="51.9" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="48.6" y1="121.6" x2="46.4" y2="130.4" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="40.5" y1="105.3" x2="38.5" y2="113.5" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="63.7" y1="131.3" x2="62.3" y2="136.8" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="20.7" y1="102.4" x2="18.7" y2="110.3" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="116.1" y1="20.4" x2="113.3" y2="31.3" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="112.9" y1="57.4" x2="110.2" y2="68.2" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="100.2" y1="152.2" x2="98.8" y2="157.7" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="25.5" y1="118.5" x2="23.3" y2="127.2" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="98.5" y1="147.4" x2="95.6" y2="158.9" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="67.1" y1="15.3" x2="64" y2="27.7" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="88.1" y1="36.1" x2="86.3" y2="43" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="63.3" y1="128.4" x2="60.9" y2="138.2" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="55.9" y1="37.4" x2="53.8" y2="45.6" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="65.5" y1="93.5" x2="64" y2="99.8" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="25.3" y1="24.5" x2="22.8" y2="34.5" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="59.1" y1="158.3" x2="55.9" y2="171.1" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="28.2" y1="81.3" x2="25.2" y2="93.4" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="71.6" y1="127" x2="68.9" y2="138.1" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="45.4" y1="54.8" x2="43.7" y2="61.9" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="41.9" y1="78.2" x2="40.2" y2="84.6" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="44.1" y1="146.5" x2="42.5" y2="153" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="40.9" y1="49.9" x2="38.6" y2="59.1" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="24.8" y1="81.7" x2="23.4" y2="87" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="108.5" y1="47.7" x2="106.3" y2="56.3" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="107.8" y1="48" x2="106.5" y2="53.4" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="102.6" y1="42.3" x2="101.2" y2="47.9" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="33" y1="102" x2="30.2" y2="113.2" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="14.7" y1="107.1" x2="12" y2="117.7" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="18" y1="63.6" x2="16.7" y2="69" stroke="rgba(180,210,235,0.5)" stroke-width="0.8"/><line x1="18.1" y1="120.9" x2="15" y2="133.2" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="101.6" y1="73.7" x2="99.6" y2="81.7" stroke="rgba(180,210,235,0.4)" stroke-width="0.8"/><line x1="22.3" y1="18.6" x2="20.1" y2="27.6" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="57.7" y1="130.2" x2="55.1" y2="140.5" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="71.1" y1="109.3" x2="69.1" y2="117.5" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="119.7" y1="111.5" x2="117.7" y2="119.8" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="93.8" y1="143" x2="91.7" y2="151.3" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><line x1="96" y1="131.1" x2="93.5" y2="141.3" stroke="rgba(180,210,235,0.3)" stroke-width="0.8"/><line x1="57.3" y1="151.5" x2="55.2" y2="160" stroke="rgba(180,210,235,0.2)" stroke-width="0.8"/><circle cx="26.1" cy="27.2" r="1.3" fill="rgba(210,230,245,0.45)"/><circle cx="53" cy="126.9" r="0.8" fill="rgba(210,230,245,0.45)"/><circle cx="19.5" cy="34.8" r="1.6" fill="rgba(210,230,245,0.45)"/><circle cx="56.4" cy="97.6" r="1.7" fill="rgba(210,230,245,0.45)"/><circle cx="92.9" cy="39.1" r="1.1" fill="rgba(210,230,245,0.45)"/><circle cx="31.3" cy="39.1" r="0.8" fill="rgba(210,230,245,0.45)"/><circle cx="55.1" cy="124" r="1.6" fill="rgba(210,230,245,0.45)"/><circle cx="100.1" cy="58" r="1.6" fill="rgba(210,230,245,0.45)"/><circle cx="18.7" cy="147.3" r="1" fill="rgba(210,230,245,0.45)"/><circle cx="79" cy="106.9" r="0.8" fill="rgba(210,230,245,0.45)"/><circle cx="90.2" cy="114.5" r="1.7" fill="rgba(210,230,245,0.45)"/><circle cx="82.5" cy="139.1" r="1.4" fill="rgba(210,230,245,0.45)"/><circle cx="79.8" cy="42.6" r="1.2" fill="rgba(210,230,245,0.45)"/><circle cx="74.5" cy="20.1" r="1.7" fill="rgba(210,230,245,0.45)"/><circle cx="30.7" cy="66.4" r="0.9" fill="rgba(210,230,245,0.45)"/><circle cx="117.9" cy="133.1" r="0.9" fill="rgba(210,230,245,0.45)"/><circle cx="108.6" cy="137" r="1.4" fill="rgba(210,230,245,0.45)"/><circle cx="85.5" cy="61.3" r="1.1" fill="rgba(210,230,245,0.45)"/><circle cx="62.8" cy="138" r="1.6" fill="rgba(210,230,245,0.45)"/><circle cx="83.4" cy="59" r="1" fill="rgba(210,230,245,0.45)"/><circle cx="55.6" cy="67.6" r="1.3" fill="rgba(210,230,245,0.45)"/><circle cx="33.1" cy="14.5" r="1.8" fill="rgba(210,230,245,0.45)"/><circle cx="63.8" cy="79.2" r="1.4" fill="rgba(210,230,245,0.45)"/><circle cx="101.6" cy="136.1" r="1.6" fill="rgba(210,230,245,0.45)"/><circle cx="56.8" cy="23.8" r="1.1" fill="rgba(210,230,245,0.45)"/><circle cx="53.1" cy="131.1" r="1.3" fill="rgba(210,230,245,0.45)"/><polygon points="12,12 60,12 12,70" fill="rgba(255,255,255,0.05)"/></g><rect x="64" y="12" width="7" height="152" fill="url(#owF)"/><rect x="12" y="84" width="111" height="8" fill="url(#owF)"/><rect x="58" y="85" width="18" height="5" rx="1" fill="#c9a24a"/><circle cx="74" cy="87.5" r="2.4" fill="#e8c56a"/><rect x="0" y="166" width="135" height="9" fill="#3a2416"/><rect x="0" y="166" width="135" height="2" fill="rgba(255,220,170,0.15)"/></svg>`,
  medicine_cabinet: `<svg width="112" height="130" viewBox="0 0 115 135"><defs><linearGradient id="omcW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3520"/><stop offset="1" stop-color="#26150c"/></linearGradient><linearGradient id="omcA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e09a3a"/><stop offset="0.5" stop-color="#9a5a14"/><stop offset="1" stop-color="#4a2806"/></linearGradient><linearGradient id="omcB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6e2d6"/><stop offset="1" stop-color="#9a958a"/></linearGradient></defs><rect x="5" y="7" width="105" height="123" rx="3" fill="url(#omcW)" stroke="#120a05" stroke-width="2"/><rect x="1" y="2" width="113" height="9" rx="2" fill="#3a2214"/><rect x="1" y="2" width="113" height="2" fill="rgba(255,220,170,0.2)"/><rect x="14" y="17" width="87" height="104" fill="#100a06"/><rect x="14" y="52" width="87" height="4" fill="#3a2416"/><rect x="14" y="88" width="87" height="4" fill="#3a2416"/><rect x="18" y="30" width="11" height="22" rx="2" fill="url(#omcA)"/><rect x="19" y="26" width="9" height="5" rx="1" fill="#1a1a1a"/><rect x="19" y="38.36" width="9" height="7.5" fill="#e7d8b5"/><rect x="19.5" y="31" width="1.6" height="19" fill="rgba(255,255,255,0.35)"/><rect x="32" y="34" width="10" height="18" rx="2" fill="url(#omcA)"/><rect x="33" y="30" width="8" height="5" rx="1" fill="#1a1a1a"/><rect x="33" y="40.84" width="8" height="6.1" fill="#e7d8b5"/><rect x="33.5" y="35" width="1.6" height="15" fill="rgba(255,255,255,0.35)"/><rect x="46" y="28" width="12" height="24" rx="2" fill="url(#omcA)"/><rect x="47" y="24" width="10" height="5" rx="1" fill="#1a1a1a"/><rect x="47" y="37.120000000000005" width="10" height="8.2" fill="#e7d8b5"/><rect x="47.5" y="29" width="1.6" height="21" fill="rgba(255,255,255,0.35)"/><rect x="68" y="26" width="15" height="26" rx="2" fill="url(#omcA)"/><rect x="69" y="21" width="13" height="6" rx="1" fill="#f4f1e8"/><rect x="68.5" y="33" width="14" height="11" fill="#fbfaf5" stroke="#d8d4c8" stroke-width="0.5"/><rect x="71" y="36" width="9" height="1.2" fill="#555"/><rect x="71" y="39" width="6" height="1" fill="#888"/><rect x="69.5" y="27" width="1.8" height="23" fill="rgba(255,255,255,0.45)"/><rect x="18" y="68" width="13" height="20" rx="2" fill="url(#omcA)"/><rect x="19" y="64" width="11" height="5" rx="1" fill="#1a1a1a"/><rect x="19" y="75.6" width="11" height="6.8" fill="#cfc3a2"/><rect x="19.5" y="69" width="1.6" height="17" fill="rgba(255,255,255,0.35)"/><rect x="36" y="74" width="24" height="14" fill="#c9c2b1"/><rect x="36" y="74" width="24" height="3" fill="#a8160f"/><rect x="66" y="62" width="10" height="26" rx="2" fill="url(#omcA)"/><rect x="67" y="58" width="8" height="5" rx="1" fill="#7a1414"/><rect x="67" y="71.88" width="8" height="8.8" fill="#e7d8b5"/><rect x="67.5" y="63" width="1.6" height="23" fill="rgba(255,255,255,0.35)"/><rect x="20" y="103" width="9" height="16" rx="2" fill="url(#omcA)"/><rect x="21" y="99" width="7" height="5" rx="1" fill="#1a1a1a"/><rect x="21" y="109.08" width="7" height="5.4" fill="#e7d8b5"/><rect x="21.5" y="104" width="1.6" height="13" fill="rgba(255,255,255,0.35)"/><rect x="34" y="107" width="14" height="12" rx="2" fill="url(#omcB)"/><rect x="35" y="103" width="12" height="5" rx="1" fill="#1a1a1a"/><rect x="35" y="111.56" width="12" height="4.1" fill="#a8160f"/><rect x="35.5" y="108" width="1.6" height="9" fill="rgba(255,255,255,0.35)"/><rect x="56" y="97" width="11" height="22" rx="2" fill="url(#omcA)"/><rect x="57" y="93" width="9" height="5" rx="1" fill="#1a1a1a"/><rect x="57" y="105.36" width="9" height="7.5" fill="#e7d8b5"/><rect x="57.5" y="98" width="1.6" height="19" fill="rgba(255,255,255,0.35)"/><rect x="74" y="101" width="12" height="18" rx="2" fill="url(#omcA)"/><rect x="75" y="97" width="10" height="5" rx="1" fill="#1a1a1a"/><rect x="75" y="107.84" width="10" height="6.1" fill="#e7d8b5"/><rect x="75.5" y="102" width="1.6" height="15" fill="rgba(255,255,255,0.35)"/><rect x="11" y="14" width="93" height="110" fill="rgba(170,205,225,0.07)" stroke="#5a3a22" stroke-width="3"/><polygon points="16,18 46,18 18,70" fill="rgba(255,255,255,0.07)"/><polygon points="70,120 100,80 100,120" fill="rgba(255,255,255,0.04)"/><circle cx="99" cy="68" r="2.6" fill="#e0b85a"/></svg>`,
  armchair: `<svg width="140" height="150" viewBox="0 0 150 165"><defs><linearGradient id="oaL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2424"/><stop offset="1" stop-color="#330b0d"/></linearGradient><linearGradient id="oaS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a2e2a"/><stop offset="1" stop-color="#4a1214"/></linearGradient><pattern id="oaP" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#5c5440"/><path d="M0 5H10M5 0V10" stroke="#7a1e1e" stroke-width="1.6"/><path d="M0 2H10" stroke="rgba(255,240,200,0.18)" stroke-width="0.8"/></pattern></defs><ellipse cx="78" cy="158" rx="64" ry="6" fill="rgba(0,0,0,0.55)"/><path d="M32,104 L30,30 Q32,6 76,4 Q120,6 122,30 L120,104 Z" fill="url(#oaL)"/><path d="M34,26 L118,26 M34,44 L118,44 M34,62 L118,62 M34,80 L118,80" stroke="rgba(0,0,0,0.25)" stroke-width="1"/><path d="M42,26 L50,44 L42,62 L50,80 M58,26 L66,44 L58,62 L66,80 M75,26 L83,44 L75,62 L83,80 M91,26 L99,44 L91,62 L99,80 M108,26 L116,44 L108,62" stroke="rgba(0,0,0,0.22)" stroke-width="1" fill="none"/><circle cx="42" cy="26" r="1.8" fill="#1e0607"/><circle cx="58.5" cy="26" r="1.8" fill="#1e0607"/><circle cx="75" cy="26" r="1.8" fill="#1e0607"/><circle cx="91.5" cy="26" r="1.8" fill="#1e0607"/><circle cx="108" cy="26" r="1.8" fill="#1e0607"/><circle cx="50" cy="44" r="1.8" fill="#1e0607"/><circle cx="66.5" cy="44" r="1.8" fill="#1e0607"/><circle cx="83" cy="44" r="1.8" fill="#1e0607"/><circle cx="99.5" cy="44" r="1.8" fill="#1e0607"/><circle cx="42" cy="62" r="1.8" fill="#1e0607"/><circle cx="58.5" cy="62" r="1.8" fill="#1e0607"/><circle cx="75" cy="62" r="1.8" fill="#1e0607"/><circle cx="91.5" cy="62" r="1.8" fill="#1e0607"/><circle cx="108" cy="62" r="1.8" fill="#1e0607"/><circle cx="50" cy="80" r="1.8" fill="#1e0607"/><circle cx="66.5" cy="80" r="1.8" fill="#1e0607"/><circle cx="83" cy="80" r="1.8" fill="#1e0607"/><circle cx="99.5" cy="80" r="1.8" fill="#1e0607"/><path d="M36,10 Q76,0 116,10" stroke="rgba(255,200,180,0.25)" stroke-width="2" fill="none"/><path d="M24,40 Q12,46 15,98 L34,100 L32,34 Z" fill="#4a1012"/><path d="M128,40 Q140,46 137,98 L118,100 L120,34 Z" fill="#4a1012"/><path d="M30,98 Q76,88 122,98 L127,120 Q76,128 25,120 Z" fill="url(#oaS)"/><ellipse cx="76" cy="108" rx="30" ry="6" fill="rgba(0,0,0,0.22)"/><rect x="11" y="78" width="27" height="58" rx="13" fill="url(#oaL)"/><rect x="112" y="78" width="27" height="58" rx="13" fill="url(#oaL)"/><circle cx="24.5" cy="90" r="9" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/><circle cx="125.5" cy="90" r="9" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/><rect x="26" y="119" width="100" height="22" fill="#3a0c0e"/><rect x="30" y="141" width="7" height="13" rx="2" fill="#2a170c"/><rect x="114" y="141" width="7" height="13" rx="2" fill="#2a170c"/><path d="M6,82 Q26,74 42,92 L40,148 Q22,162 2,156 Z" fill="url(#oaP)"/><path d="M6,82 Q26,74 42,92" stroke="rgba(0,0,0,0.35)" stroke-width="2" fill="none"/><path d="M14,100 Q20,130 12,154 M28,96 Q32,126 26,156" stroke="rgba(0,0,0,0.25)" stroke-width="2" fill="none"/><g stroke="#d8d2c2" stroke-width="1.4" fill="rgba(200,220,235,0.15)"><ellipse cx="118" cy="80" rx="6" ry="4"/><ellipse cx="132" cy="80" rx="6" ry="4"/></g><path d="M124,80 Q125,78 126,80" stroke="#d8d2c2" stroke-width="1.2" fill="none"/></svg>`,
  tray: `<svg width="112" height="80" viewBox="0 0 115 82"><defs><linearGradient id="otS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f3"/><stop offset="1" stop-color="#6e757d"/></linearGradient><linearGradient id="otI" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f666e"/><stop offset="0.5" stop-color="#c4c9ce"/><stop offset="1" stop-color="#4c535a"/></linearGradient></defs><ellipse cx="58" cy="70" rx="54" ry="9" fill="rgba(0,0,0,0.55)"/><ellipse cx="57" cy="62" rx="53" ry="14" fill="url(#otS)"/><ellipse cx="57" cy="61" rx="46" ry="10" fill="url(#otI)"/><path d="M14,58 Q57,46 100,58" stroke="rgba(255,255,255,0.6)" stroke-width="1" fill="none"/><ellipse cx="40" cy="64" rx="10" ry="2.8" fill="rgba(0,0,0,0.3)"/><ellipse cx="40" cy="63.5" rx="9" ry="2.4" fill="rgba(220,235,245,0.35)" stroke="rgba(255,255,255,0.7)" stroke-width="0.8"/><rect x="39" y="55" width="2.2" height="8" fill="rgba(230,240,248,0.7)"/><path d="M28,22 C14,40 22,56 40,56 C58,56 66,40 52,22 Z" fill="rgba(210,225,238,0.16)" stroke="rgba(255,255,255,0.75)" stroke-width="1.1"/><ellipse cx="40" cy="22" rx="12" ry="2.6" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="0.9"/><ellipse cx="40" cy="51" rx="9" ry="2.6" fill="rgba(170,90,25,0.55)"/><path d="M27,30 C22,40 25,48 31,52" stroke="rgba(255,255,255,0.65)" stroke-width="1.6" fill="none"/><polygon points="66,53 93,48 97,60 90,62 87,58 82,63 78,59 70,64" fill="#c9ccd2" stroke="#7d828a" stroke-width="0.8"/><ellipse cx="76" cy="55" rx="3.2" ry="2.2" fill="#9aa0a7" stroke="#e8eaee" stroke-width="0.6"/><ellipse cx="86" cy="53" rx="3.2" ry="2.2" fill="#9aa0a7" stroke="#e8eaee" stroke-width="0.6"/><path d="M76,55 l2,-1" stroke="#555" stroke-width="0.6"/></svg>`,
  document: `<svg width="115" height="84" viewBox="0 0 120 86"><ellipse cx="60" cy="76" rx="48" ry="6" fill="rgba(0,0,0,0.5)"/><rect x="16" y="14" width="72" height="58" fill="#ddd4bd" transform="rotate(-5 52 43)"/><rect x="19" y="12" width="72" height="58" fill="#e8e0c9" transform="rotate(-2 55 41)"/><g transform="rotate(4 58 40)"><rect x="22" y="9" width="74" height="60" fill="#f7f2e4" stroke="#cbbf9f" stroke-width="0.8"/><rect x="30" y="15" width="40" height="3.4" fill="#2a2420"/><rect x="74" y="14" width="16" height="6" fill="none" stroke="#a8161f" stroke-width="1"/><rect x="76" y="16" width="12" height="2" fill="#a8161f" opacity="0.7"/><rect x="30" y="28" width="46" height="1.6" fill="#8a8272"/><rect x="30" y="33" width="50" height="1.6" fill="#8a8272"/><rect x="30" y="38" width="40" height="1.6" fill="#8a8272"/><rect x="30" y="43" width="48" height="1.6" fill="#8a8272"/><rect x="30" y="48" width="36" height="1.6" fill="#8a8272"/><rect x="58" y="60" width="30" height="0.9" fill="#4a4238"/><rect x="58" y="62" width="10" height="1" fill="#9a9284"/><path d="M26,10 L26,22 Q26,25 29,25 Q32,25 32,22 L32,13" fill="none" stroke="#9aa0a7" stroke-width="1.4"/></g><g transform="rotate(-32 92 58)"><rect x="70" y="55" width="44" height="6.5" rx="3" fill="#121212"/><rect x="70" y="55" width="44" height="1.6" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="98" y="55" width="3" height="6.5" fill="#d8b45a"/><polygon points="70,55 62,58.2 70,61.5" fill="#c9a24a"/></g></svg>`,
  drawer: `<svg width="138" height="74" viewBox="0 0 145 78"><defs><linearGradient id="odrW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3520"/><stop offset="1" stop-color="#2a180e"/></linearGradient><linearGradient id="odrB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d58e"/><stop offset="1" stop-color="#7a5418"/></linearGradient></defs><rect x="0" y="0" width="145" height="78" fill="#1e120a"/><rect x="6" y="3" width="133" height="12" fill="#030201"/><polygon points="4,12 141,12 137,25 8,25" fill="#2e1c11"/><polygon points="32,14 74,13 76,23 34,24" fill="#4a2a17"/><polygon points="34,14 74,13 74,14.5 34,15.5" fill="#e8e0c8"/><line x1="54" y1="13.5" x2="55" y2="23.5" stroke="#2a170c" stroke-width="1"/><polygon points="90,15 118,14 119,22 91,23" fill="#d9d0b6"/><path d="M94,17 L114,16.5 M94,19.5 L110,19" stroke="#6a6254" stroke-width="0.7"/><rect x="6" y="24" width="133" height="47" rx="2" fill="url(#odrW)" stroke="#120a05" stroke-width="1.5"/><rect x="6" y="24" width="133" height="2" fill="rgba(255,220,170,0.2)"/><rect x="14" y="31" width="117" height="33" fill="rgba(0,0,0,0.14)" stroke="rgba(255,220,180,0.12)" stroke-width="1"/><circle cx="57" cy="46" r="3" fill="url(#odrB)"/><circle cx="88" cy="46" r="3" fill="url(#odrB)"/><path d="M57,46 Q72.5,58 88,46" fill="none" stroke="url(#odrB)" stroke-width="3"/><path d="M70,38 l2.5,0 l0,4 l-2.5,0 z" fill="#0a0503"/></svg>`,
  cctv: `<svg width="155" height="115" viewBox="0 0 165 125"><defs><linearGradient id="ocF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16241e"/><stop offset="1" stop-color="#0a120e"/></linearGradient><pattern id="ocL" width="4" height="2" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="rgba(0,0,0,0.35)"/></pattern><linearGradient id="ocB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2f33"/><stop offset="1" stop-color="#121315"/></linearGradient></defs><polygon points="70,104 95,104 104,118 61,118" fill="#141517"/><rect x="52" y="117" width="61" height="5" rx="2" fill="#1d1e21"/><rect x="5" y="5" width="155" height="101" rx="7" fill="url(#ocB)" stroke="#050505" stroke-width="1.5"/><rect x="12" y="12" width="141" height="86" fill="#040706"/><rect x="14" y="14" width="68" height="40" fill="url(#ocF)"/><polygon points="14,14 40,28 40,42 14,54" fill="rgba(140,170,150,0.16)"/><polygon points="82,14 56,28 56,42 82,54" fill="rgba(140,170,150,0.10)"/><rect x="40" y="28" width="16" height="14" fill="rgba(0,0,0,0.5)"/><polygon points="14,54 40,42 56,42 82,54" fill="rgba(160,190,170,0.12)"/><text x="17" y="21" font-family="monospace" font-size="5.5" fill="#9fe0bc">CAM 01</text><rect x="84" y="14" width="68" height="40" fill="url(#ocF)"/><polygon points="84,14 110,28 110,42 84,54" fill="rgba(140,170,150,0.16)"/><polygon points="152,14 126,28 126,42 152,54" fill="rgba(140,170,150,0.10)"/><rect x="110" y="28" width="16" height="14" fill="rgba(0,0,0,0.5)"/><polygon points="84,54 110,42 126,42 152,54" fill="rgba(160,190,170,0.12)"/><text x="87" y="21" font-family="monospace" font-size="5.5" fill="#9fe0bc">CAM 02</text><rect x="14" y="56" width="68" height="40" fill="url(#ocF)"/><polygon points="14,56 40,70 40,84 14,96" fill="rgba(140,170,150,0.16)"/><polygon points="82,56 56,70 56,84 82,96" fill="rgba(140,170,150,0.10)"/><rect x="40" y="70" width="16" height="14" fill="rgba(0,0,0,0.5)"/><polygon points="14,96 40,84 56,84 82,96" fill="rgba(160,190,170,0.12)"/><text x="17" y="63" font-family="monospace" font-size="5.5" fill="#9fe0bc">CAM 03</text><rect x="84" y="56" width="68" height="40" fill="url(#ocF)"/><polygon points="84,56 110,70 110,84 84,96" fill="rgba(140,170,150,0.16)"/><polygon points="152,56 126,70 126,84 152,96" fill="rgba(140,170,150,0.10)"/><rect x="110" y="70" width="16" height="14" fill="rgba(0,0,0,0.5)"/><polygon points="84,96 110,84 126,84 152,96" fill="rgba(160,190,170,0.12)"/><text x="87" y="63" font-family="monospace" font-size="5.5" fill="#9fe0bc">CAM 04</text><rect x="82" y="12" width="2" height="86" fill="#040706"/><rect x="12" y="54" width="141" height="2" fill="#040706"/><rect x="12" y="12" width="141" height="86" fill="url(#ocL)"/><rect x="12" y="12" width="141" height="86" fill="rgba(120,255,180,0.04)"/><polygon points="12,12 70,12 12,50" fill="rgba(255,255,255,0.05)"/><circle cx="151" cy="102" r="1.8" fill="#4dff8a"/><circle cx="151" cy="102" r="4" fill="rgba(77,255,138,0.25)"/></svg>`,
  bag: `<svg width="138" height="115" viewBox="0 0 145 120"><defs><linearGradient id="obL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a3d"/><stop offset="0.5" stop-color="#18181a"/><stop offset="1" stop-color="#060607"/></linearGradient><linearGradient id="obB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d58e"/><stop offset="1" stop-color="#7a5418"/></linearGradient></defs><ellipse cx="73" cy="112" rx="66" ry="7" fill="rgba(0,0,0,0.55)"/><path d="M48,32 C48,6 97,6 97,32" stroke="#0b0b0c" stroke-width="8" fill="none"/><path d="M51,30 C52,11 93,11 94,30" stroke="rgba(255,255,255,0.14)" stroke-width="1.5" fill="none"/><path d="M11,46 Q13,32 30,30 L115,30 Q132,32 134,46 L137,100 Q137,111 124,111 L21,111 Q8,111 8,100 Z" fill="url(#obL)"/><path d="M14,48 Q15,36 30,35 L115,35 Q129,36 130,48 L133,99 Q133,106 124,106 L21,106 Q12,106 12,99 Z" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1" stroke-dasharray="3 3"/><rect x="16" y="26" width="113" height="9" rx="4" fill="#2a2a2c" stroke="#050505" stroke-width="1"/><rect x="16" y="26" width="113" height="2" rx="1" fill="rgba(255,255,255,0.18)"/><path d="M30,31 Q40,34 46,31" stroke="#060606" stroke-width="2.5" fill="none"/><path d="M34,30 C30,14 44,10 50,20" stroke="#202022" stroke-width="3" fill="none"/><circle cx="51" cy="21" r="4.5" fill="#b9bec4" stroke="#6a6f75" stroke-width="1"/><circle cx="51" cy="21" r="2" fill="#e9ecef"/><rect x="63" y="22" width="19" height="14" rx="2" fill="url(#obB)" stroke="#5a3a10" stroke-width="0.8"/><rect x="69" y="27" width="7" height="4" rx="1" fill="#5a3a10"/><path d="M20,46 Q22,70 18,98" stroke="rgba(255,255,255,0.12)" stroke-width="4" fill="none"/><rect x="58" y="70" width="30" height="16" rx="2" fill="url(#obB)" opacity="0.85"/><path d="M73,73 v10 M68,78 h10" stroke="#7a1414" stroke-width="2.4"/></svg>`,
  glass_dome: `<svg width="135" height="165" viewBox="0 0 135 165"><path d="M25,95 L25,52 C25,14 110,14 110,52 L110,95 Z" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="3"/><rect x="18" y="95" width="99" height="58" rx="4" fill="#1e293b" stroke="#e0a96d" stroke-width="2.5"/><polygon points="67,55 82,72 67,86 52,72" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2"/></svg>`,
  vent: `<svg width="110" height="80" viewBox="0 0 110 80"><rect x="8" y="8" width="94" height="64" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="3"/><line x1="20" y1="24" x2="90" y2="24" stroke="#475569" stroke-width="4"/><line x1="20" y1="40" x2="90" y2="40" stroke="#475569" stroke-width="4"/><line x1="20" y1="56" x2="90" y2="56" stroke="#475569" stroke-width="4"/></svg>`
};

// 2-1. 심문실(취조실) 장면: 뒤 배경, 앞 책상·전등, 용의자 인물 (우리가 만든 정적 SVG)
const INTERRO_ROOM_BACK = "<svg viewBox=\"0 0 1000 300\" preserveAspectRatio=\"xMidYMid slice\"><defs><linearGradient id=\"irWall\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#2c3230\"/><stop offset=\"1\" stop-color=\"#171b1a\"/></linearGradient><linearGradient id=\"irGlass\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#16201f\"/><stop offset=\"0.5\" stop-color=\"#0a1011\"/><stop offset=\"1\" stop-color=\"#1a2526\"/></linearGradient><linearGradient id=\"irDoor\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#2e3436\"/><stop offset=\"1\" stop-color=\"#1c2022\"/></linearGradient><pattern id=\"irWire\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\"><path d=\"M0 0L8 8M8 0L0 8\" stroke=\"rgba(200,210,210,0.25)\" stroke-width=\"0.6\"/></pattern><pattern id=\"irTile\" width=\"50\" height=\"25\" patternUnits=\"userSpaceOnUse\"><rect width=\"50\" height=\"25\" fill=\"none\" stroke=\"rgba(0,0,0,0.35)\" stroke-width=\"1\"/></pattern><radialGradient id=\"irLampWall\" cx=\"500\" cy=\"70\" r=\"380\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"rgba(255,225,160,0.26)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0)\"/></radialGradient></defs><rect width=\"1000\" height=\"300\" fill=\"url(#irWall)\"/><path d=\"M0 60H1000M0 120H1000\" stroke=\"rgba(0,0,0,0.25)\" stroke-width=\"1.5\"/><rect x=\"0\" y=\"175\" width=\"1000\" height=\"125\" fill=\"#1b201f\"/><rect x=\"0\" y=\"175\" width=\"1000\" height=\"125\" fill=\"url(#irTile)\"/><rect x=\"0\" y=\"171\" width=\"1000\" height=\"5\" fill=\"#3a403e\"/><ellipse cx=\"760\" cy=\"150\" rx=\"60\" ry=\"30\" fill=\"rgba(0,0,0,0.12)\"/><ellipse cx=\"180\" cy=\"230\" rx=\"80\" ry=\"22\" fill=\"rgba(0,0,0,0.15)\"/><rect x=\"34\" y=\"34\" width=\"312\" height=\"148\" rx=\"3\" fill=\"#3b4240\"/><rect x=\"44\" y=\"44\" width=\"292\" height=\"128\" fill=\"url(#irGlass)\"/><polygon points=\"60,44 120,44 70,172 44,172 44,90\" fill=\"rgba(255,255,255,0.05)\"/><polygon points=\"150,44 175,44 115,172 92,172\" fill=\"rgba(255,255,255,0.035)\"/><ellipse cx=\"300\" cy=\"70\" rx=\"40\" ry=\"10\" fill=\"rgba(255,225,160,0.10)\"/><rect x=\"34\" y=\"180\" width=\"312\" height=\"6\" fill=\"#4a5250\"/><circle cx=\"640\" cy=\"66\" r=\"25\" fill=\"#1a1d1c\"/><circle cx=\"640\" cy=\"66\" r=\"21\" fill=\"#d9d4c6\"/><path d=\"M640 66L640 50M640 66L652 72\" stroke=\"#1a1a1a\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><path d=\"M640 66L629 54\" stroke=\"#a8161f\" stroke-width=\"1\" stroke-linecap=\"round\"/><circle cx=\"640\" cy=\"66\" r=\"2\" fill=\"#1a1a1a\"/><rect x=\"818\" y=\"28\" width=\"138\" height=\"250\" fill=\"#141817\"/><rect x=\"826\" y=\"34\" width=\"122\" height=\"244\" fill=\"url(#irDoor)\"/><rect x=\"856\" y=\"56\" width=\"62\" height=\"62\" fill=\"#0b1112\" stroke=\"#555d5e\" stroke-width=\"3\"/><rect x=\"856\" y=\"56\" width=\"62\" height=\"62\" fill=\"url(#irWire)\"/><rect x=\"832\" y=\"150\" width=\"12\" height=\"34\" rx=\"3\" fill=\"#6d7476\"/><rect x=\"826\" y=\"250\" width=\"122\" height=\"4\" fill=\"rgba(0,0,0,0.4)\"/><text x=\"887\" y=\"146\" font-family=\"monospace\" font-size=\"11\" fill=\"rgba(220,220,210,0.45)\" text-anchor=\"middle\">ROOM 2</text><rect x=\"760\" y=\"8\" width=\"34\" height=\"14\" rx=\"3\" fill=\"#202423\"/><rect x=\"788\" y=\"11\" width=\"10\" height=\"8\" rx=\"2\" fill=\"#111\"/><rect x=\"770\" y=\"0\" width=\"6\" height=\"10\" fill=\"#202423\"/><circle cx=\"766\" cy=\"15\" r=\"2.2\" fill=\"#ff3b3b\"/><circle cx=\"766\" cy=\"15\" r=\"5\" fill=\"rgba(255,59,59,0.25)\"/><rect width=\"1000\" height=\"300\" fill=\"url(#irLampWall)\"/></svg>";
const INTERRO_ROOM_FRONT = "<svg viewBox=\"0 0 1000 300\" preserveAspectRatio=\"xMidYMid slice\"><defs><linearGradient id=\"irTable\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#5d6466\"/><stop offset=\"1\" stop-color=\"#2a2f31\"/></linearGradient><linearGradient id=\"irCone\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"rgba(255,232,175,0.30)\"/><stop offset=\"1\" stop-color=\"rgba(255,232,175,0)\"/></linearGradient><linearGradient id=\"irShade\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#3e4442\"/><stop offset=\"1\" stop-color=\"#1b1f1e\"/></linearGradient><radialGradient id=\"irBulb\" cx=\"0.5\" cy=\"0.5\" r=\"0.5\"><stop offset=\"0\" stop-color=\"rgba(255,244,210,1)\"/><stop offset=\"1\" stop-color=\"rgba(255,220,150,0)\"/></radialGradient><linearGradient id=\"irFolder\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#d9c48e\"/><stop offset=\"1\" stop-color=\"#a88e52\"/></linearGradient></defs><polygon class=\"ir-cone\" points=\"455,52 545,52 830,300 170,300\" fill=\"url(#irCone)\"/><rect x=\"498.5\" y=\"0\" width=\"3\" height=\"30\" fill=\"#0d0d0d\"/><polygon points=\"474,28 526,28 552,54 448,54\" fill=\"url(#irShade)\" stroke=\"#0d0f0e\" stroke-width=\"1.5\"/><ellipse class=\"ir-bulb\" cx=\"500\" cy=\"56\" rx=\"46\" ry=\"10\" fill=\"url(#irBulb)\"/><polygon points=\"110,236 890,236 950,300 50,300\" fill=\"url(#irTable)\"/><polygon points=\"110,236 890,236 893,240 107,240\" fill=\"rgba(255,255,255,0.28)\"/><ellipse cx=\"500\" cy=\"262\" rx=\"240\" ry=\"16\" fill=\"rgba(255,230,170,0.12)\"/><polygon points=\"200,252 330,246 340,282 206,290\" fill=\"url(#irFolder)\"/><polygon points=\"212,250 300,246 304,254 214,258\" fill=\"#f2ead6\"/><rect x=\"262\" y=\"258\" width=\"40\" height=\"14\" fill=\"none\" stroke=\"#a8161f\" stroke-width=\"2\" transform=\"rotate(-4 282 265)\"/><rect x=\"400\" y=\"254\" width=\"70\" height=\"26\" rx=\"4\" fill=\"#1a1c1d\"/><rect x=\"408\" y=\"260\" width=\"34\" height=\"14\" rx=\"2\" fill=\"#0b0c0c\"/><circle cx=\"458\" cy=\"267\" r=\"3.5\" fill=\"#ff3b3b\"/><circle cx=\"458\" cy=\"267\" r=\"7\" fill=\"rgba(255,59,59,0.25)\"/><rect x=\"414\" y=\"264\" width=\"22\" height=\"2\" fill=\"#3a3d3e\"/><rect x=\"414\" y=\"268\" width=\"16\" height=\"2\" fill=\"#3a3d3e\"/><polygon points=\"690,246 716,246 712,280 694,280\" fill=\"#e6e1d4\"/><ellipse cx=\"703\" cy=\"246\" rx=\"13\" ry=\"3.5\" fill=\"#6a4a2a\"/><polygon points=\"692,256 714,256 713,264 693,264\" fill=\"#a8161f\" opacity=\"0.8\"/></svg>";
const SUSPECT_FIGURES = {
  butler: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fsbt\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#c49a80\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 158 150 155C212 158 266 190 270 260Z\" fill=\"#121316\"/><path d=\"M150 156L128 166L150 230L172 166Z\" fill=\"#e9e6dc\"/><path d=\"M150 158L120 168L138 260M150 158L180 168L162 260\" stroke=\"rgba(0,0,0,0.35)\" stroke-width=\"3\" fill=\"none\"/><path d=\"M138 160l12 6l12 -6v12l-12 -6l-12 6z\" fill=\"#0a0a0b\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fsbt)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M119 82C118 52 136 46 152 46C170 46 183 56 181 84C176 66 166 60 150 60C134 60 124 68 119 82Z\" fill=\"#9a9a96\"/><path d=\"M128 58C140 52 160 52 172 60\" stroke=\"rgba(255,255,255,0.35)\" stroke-width=\"2\" fill=\"none\"/><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
  secretary: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fssc\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#d4ab92\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><circle cx=\"150\" cy=\"54\" r=\"16\" fill=\"#1a1210\"/><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 158 150 155C212 158 266 190 270 260Z\" fill=\"#2b2e34\"/><path d=\"M150 156L130 166L150 214L170 166Z\" fill=\"#e8dfcc\"/><path d=\"M150 158L120 168L138 260M150 158L180 168L162 260\" stroke=\"rgba(0,0,0,0.35)\" stroke-width=\"3\" fill=\"none\"/><path d=\"M122 170L132 230\" stroke=\"#3b6aa8\" stroke-width=\"2\"/><rect x=\"124\" y=\"222\" width=\"18\" height=\"24\" rx=\"2\" fill=\"#e9eef3\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fssc)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M118 96C112 56 134 50 150 50C168 50 190 58 182 96C180 74 170 64 150 64C134 64 122 72 118 96Z\" fill=\"#20160f\"/><path d=\"M130 58C142 52 160 52 172 60\" stroke=\"rgba(255,255,255,0.2)\" stroke-width=\"2\" fill=\"none\"/><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
  son: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fssn\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#c99d82\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 158 150 155C212 158 266 190 270 260Z\" fill=\"#1b2640\"/><path d=\"M150 156L132 166L150 204L168 166Z\" fill=\"#c9d8ea\"/><path d=\"M140 162L150 176L160 162\" stroke=\"#9fb4cc\" stroke-width=\"2\" fill=\"none\"/><path d=\"M150 158L120 168L138 260M150 158L180 168L162 260\" stroke=\"rgba(0,0,0,0.35)\" stroke-width=\"3\" fill=\"none\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fssn)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M119 84C116 54 134 48 152 48C172 48 186 58 181 86C178 70 172 64 166 62C150 70 132 66 124 64C121 70 120 76 119 84Z\" fill=\"#141010\"/><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
  wife: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fswf\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#d6ae96\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><path d=\"M112 92C104 140 108 170 124 182C132 160 128 130 126 100ZM188 92C196 140 192 170 176 182C168 160 172 130 174 100Z\" fill=\"#2a1510\"/><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 160 150 157C212 160 266 190 270 260Z\" fill=\"#4a1322\"/><path d=\"M126 160Q150 196 174 160\" fill=\"#c99d82\"/><circle cx=\"170.26334186806346\" cy=\"171.00953016155572\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"168.15738352801293\" cy=\"174.16356452111063\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"165.32754760563765\" cy=\"176.9124096361914\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"161.88665072909907\" cy=\"179.14647772654214\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"157.97187059848682\" cy=\"180.77670354741008\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"153.7392771438053\" cy=\"181.73809513979228\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"149.35761050937165\" cy=\"181.9923248547471\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"145.00155391675207\" cy=\"181.52925735580752\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"140.84476959596287\" cy=\"180.36735368286227\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"137.05297542038238\" cy=\"178.55293526875263\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"133.7773382580926\" cy=\"176.15833724992072\" r=\"2.6\" fill=\"#f3efe4\"/><circle cx=\"131.14844742588315\" cy=\"173.27902469278635\" r=\"2.6\" fill=\"#f3efe4\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fswf)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M117 100C110 56 132 48 152 48C176 48 192 60 183 100C182 78 172 62 150 62C140 70 126 76 117 100Z\" fill=\"#2e1812\"/><path d=\"M134 54C146 50 162 52 174 60\" stroke=\"rgba(255,220,200,0.2)\" stroke-width=\"2\" fill=\"none\"/><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
  doctor: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fsdc\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#c79a80\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 158 150 155C212 158 266 190 270 260Z\" fill=\"#d8dbd7\"/><path d=\"M150 156L126 166L150 240L174 166Z\" fill=\"#b9cde0\"/><path d=\"M150 158L120 168L138 260M150 158L180 168L162 260\" stroke=\"rgba(0,0,0,0.25)\" stroke-width=\"3\" fill=\"none\"/><path d=\"M146 166h8l3 8l-7 50l-7 -50z\" fill=\"#6a1a22\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><rect x=\"196\" y=\"200\" width=\"22\" height=\"3\" fill=\"#2a3b6a\"/><rect x=\"200\" y=\"194\" width=\"3\" height=\"16\" fill=\"#1a1a1a\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fsdc)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M119 84C117 54 136 48 152 48C170 48 184 58 181 84C178 68 170 62 160 60C150 64 132 64 124 66C121 72 120 78 119 84Z\" fill=\"#7d7b76\"/><g stroke=\"#1b1b1b\" stroke-width=\"2\" fill=\"rgba(200,220,235,0.12)\"><rect x=\"128\" y=\"85\" width=\"18\" height=\"12\" rx=\"4\"/><rect x=\"154\" y=\"85\" width=\"18\" height=\"12\" rx=\"4\"/><path d=\"M146 90h8\" fill=\"none\"/></g><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
  default: "<svg viewBox=\"0 0 300 260\" preserveAspectRatio=\"xMidYMax meet\"><defs><linearGradient id=\"fsdf\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#c79a7c\"/><stop offset=\"1\" stop-color=\"#3a2a22\"/></linearGradient><linearGradient id=\"fShadow\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0.25\" stop-color=\"rgba(0,0,0,0)\"/><stop offset=\"1\" stop-color=\"rgba(0,0,0,0.7)\"/></linearGradient></defs><g class=\"fig-body\"><rect x=\"136\" y=\"116\" width=\"28\" height=\"36\" fill=\"#5a4034\"/><path d=\"M30 260C34 190 88 158 150 155C212 158 266 190 270 260Z\" fill=\"#24282b\"/><path d=\"M150 156L134 166L150 200L166 166Z\" fill=\"#8a8f92\"/><path d=\"M150 158L120 168L138 260M150 158L180 168L162 260\" stroke=\"rgba(0,0,0,0.35)\" stroke-width=\"3\" fill=\"none\"/><path d=\"M60 205C75 185 100 172 120 168\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"5\" fill=\"none\"/><g class=\"fig-head\"><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fsdf)\"/><ellipse cx=\"119\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#7a5848\"/><ellipse cx=\"181\" cy=\"94\" rx=\"5\" ry=\"9\" fill=\"#5a4034\"/><g class=\"fig-face\"><g class=\"brow brow-calm\"><path d=\"M131 82h12M157 82h12\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><g class=\"brow brow-angry\"><path d=\"M130 79l14 5M170 79l-14 5\" stroke=\"#1d130f\" stroke-width=\"3\" stroke-linecap=\"round\"/></g><g class=\"brow brow-sad\"><path d=\"M131 85l12-4M169 85l-12-4\" stroke=\"#2a1d17\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g><ellipse cx=\"137\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><ellipse cx=\"163\" cy=\"91\" rx=\"4\" ry=\"2.6\" fill=\"#1a110d\"/><path d=\"M150 94q-3 10 -1 13\" stroke=\"rgba(60,35,25,0.6)\" stroke-width=\"1.6\" fill=\"none\"/><path class=\"mouth mouth-calm\" d=\"M141 113h18\" stroke=\"#3a2018\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path class=\"mouth mouth-angry\" d=\"M140 115q10 -5 20 0\" stroke=\"#2a1410\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-sad\" d=\"M141 116q9 -6 18 0\" stroke=\"#3a2018\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"mouth mouth-nervous\" d=\"M140 113q5 3 10 0t10 0\" stroke=\"#3a2018\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/></g><ellipse cx=\"150\" cy=\"90\" rx=\"31\" ry=\"37\" fill=\"url(#fShadow)\"/><path d=\"M119 84C116 54 134 48 152 48C172 48 186 58 181 86C176 70 166 62 150 62C134 62 124 70 119 84Z\" fill=\"#1a1412\"/><path class=\"fig-sweat\" d=\"M178 72q4 7 0 10q-4 -3 0 -10z\" fill=\"rgba(200,230,255,0.85)\"/></g></g></svg>",
};

// 3. 에피소드별 현장 배치 (사건 JSON 에 scene 이 없을 때 쓰는 기본 배치)
const EPISODES_DB = {
  'mansion-001': {
    id: 'mansion-001',
    public: {
      title: '송림 저택의 마지막 밤',
      roomTitle: '송림 저택 2층 서재 & 보안 모니터실',
      sceneTheme: 'mansion_study',
      intro: '폭우로 길이 끊긴 송림 저택에서 강태산 회장이 숨진 채 발견되었다. 주치의는 심장마비라고 하지만, 회장은 어제까지 건강했고 이번 주에 유언장을 고치려 했다는 소문이 있다. 날이 밝아 도로가 열리기 전까지, 저택 안의 다섯 명 중 누군가의 거짓말을 찾아내야 한다.',
      suspects: [
        { id: 'butler', name: '박영찬', role: '집사', publicBio: '31년째 이 집을 지킨 집사. 말수가 적고 회장의 일과를 모두 알고 있다.' },
        { id: 'secretary', name: '한소영', role: '비서', publicBio: '5년째 회장을 보좌한 비서. 시신의 첫 발견자.' },
        { id: 'son', name: '강지훈', role: '장남', publicBio: '그룹 부사장. 아버지와 사이가 좋지 않았다는 소문이 있다.' },
        { id: 'wife', name: '윤세라', role: '회장의 부인', publicBio: '6년 전 재혼한 부인. 결혼 전에는 간호사였다.' },
        { id: 'doctor', name: '오진석', role: '주치의', publicBio: '20년 지기 주치의이자 재단병원 원장. 사망 직후 가장 먼저 달려왔다.' }
      ],
      clues: [
        { id: 'c01', title: '서재의 현장', location: '서재', role: '현장 기본', text: '회장이 안락의자에 기대어 숨져 있다. 외상은 없고 책상 위는 정돈되어 있다. 창문은 안에서 잠겨 있다.' },
        { id: 'c02', title: '취침 전 쟁반', location: '서재 책상', role: '현장 기본', text: '쟁반 위에 브랜디 잔과 약 포장지 한 장이 있다. 잔은 비어 있고 약은 이미 복용한 흔적이 있다.' },
        { id: 'c03', title: '고립된 저택', location: '저택 전체', role: '현장 기본', text: '18시에 폭우로 진입로가 통제되어 외부인은 들어올 수 없다. 저택 안에는 용의자 5명과 회장뿐이다.' }
      ],
      hotspots: [
        { mode: 'investigate', target: 'inner_door', clueId: 'c14', iconType: 'door', label: '🚪 서재의 안쪽 문 (c14)', x: 4.5, y: 24 },
        { mode: 'clue', clueId: 'c03', iconType: 'window', label: '🌧️ 폭우로 고립된 창밖 (c03)', x: 18, y: 9 },
        { mode: 'investigate', target: 'medicine_cabinet', clueId: 'c04', iconType: 'medicine_cabinet', label: '💊 서재 약장 (c04)', x: 35.5, y: 11 },
        { mode: 'clue', clueId: 'c01', iconType: 'armchair', label: '🪑 안락의자 현장 (c01)', x: 16, y: 47 },
        { mode: 'clue', clueId: 'c02', iconType: 'tray', label: '🍷 취침 전 쟁반 (c02)', x: 38.5, y: 43 },
        { mode: 'investigate', target: 'study_desk', clueId: 'c07', iconType: 'document', label: '📄 서재 책상 위 유언장 (c07)', x: 53.5, y: 42 },
        { mode: 'investigate', target: 'desk_drawer', clueId: 'c10', iconType: 'drawer', label: '🗄️ 서재 책상 서랍 (c10)', x: 55.5, y: 64 },
        { mode: 'investigate', target: 'cctv', clueId: 'c06', iconType: 'cctv', label: '📹 보안실 복도 CCTV (c06)', x: 75.5, y: 10 },
        { mode: 'investigate', target: 'doctor_bag', clueId: 'c13', iconType: 'bag', label: '🧰 오진석의 의료 가방 (c13)', x: 77, y: 56 }
      ]
    },
  },
  'gallery-002': {
    id: 'gallery-002',
    public: {
      title: '사라진 푸른 다이아몬드',
      roomTitle: '국립미술관 제1보석전시실 (야간 특별 보안 구역)',
      sceneTheme: 'art_gallery',
      hotspots: [
        { mode: 'investigate', target: 'glass_dome', clueId: 'g03', iconType: 'glass_dome', label: '💎 중앙 유리 돔 진열대', x: 44, y: 36 },
        { mode: 'investigate', target: 'vent_grille', clueId: 'g04', iconType: 'vent', label: '🌀 벽면 환풍구 그릴', x: 14, y: 20 },
        { mode: 'investigate', target: 'laser_cctv', clueId: 'g05', iconType: 'cctv', label: '📹 레이저 보안 관제 모니터', x: 76, y: 14 },
        { mode: 'investigate', target: 'curator_drawer', clueId: 'g07', iconType: 'drawer', label: '🗄️ 큐레이터 보관함', x: 18, y: 60 },
        { mode: 'investigate', target: 'appraiser_bag', clueId: 'g11', iconType: 'bag', label: '🧳 관계자 소지품 보관대', x: 76, y: 58 }
      ]
    },
  },
};

// public/js/play.js 의 `document.addEventListener('DOMContentLoaded', ...` 부터 파일 끝까지를 이 코드로 교체한다.
// (위쪽 SCENE_THEME_BACKGROUNDS, OBJECT_SVG_LIBRARY, EPISODES_DB 는 그대로 두되, EPISODES_DB 에서 secret 을 지운다.)
// 서버 API: /api/start, /api/investigate, /api/ask, /api/hint, /api/accuse
document.addEventListener('DOMContentLoaded', async () => {
  const authUser = await window.authReady; // guard.js 가 로그인·가입을 먼저 확인한다
  if (!authUser) return;
  const { canAccuse, createPlayClock, validCount } = await import('./scoring.js');
  const uid = authUser.uid;
  // 사건 목록에서 ?case=<id> 로 들어온다. 없으면 기본 사건.
  const CASE_ID = (new URLSearchParams(location.search).get('case') || 'mansion-001').trim();
  const STORAGE_KEY = `case_state_${uid}_${CASE_ID}`; // 계정마다 저장을 나눈다

  // 현장 배치(배경, 오브젝트 위치). 기본은 이 파일의 EPISODES_DB, 사건 JSON 에 scene 이 있으면 서버(start)가 준다.
  // 정답·해금 규칙은 서버에만 있다.
  let view = EPISODES_DB[CASE_ID]?.public || { roomTitle: '', sceneTheme: 'mansion_study', hotspots: [] };

  const $ = (id) => document.getElementById(id);
  const screens = {
    notebook: { el: $('screen-notebook'), label: '사건 수첩' },
    scene: { el: $('screen-scene'), label: '사건 현장 탐색' },
    interrogate: { el: $('screen-interrogate'), label: '용의자 심문실' },
  };

  // ---------- 상태 (개발 모드: 브라우저가 보관, 요청마다 서버로 보낸다) ----------
  let startData = null;
  let suspects = [];
  let allCluesMap = {};
  let unlockedClueIds = new Set();
  let investigatedTargets = new Set();
  let currentSuspectId = '';
  let selectedClueIdForChat = '';
  let chatLogs = {};     // 화면 표시용 { suspectId: [{role:'user'|'model'|'system'|'error', ...}] }
  let apiHistory = {};   // 서버에 되돌려 보내는 대화 기록 { suspectId: [{role, text}] }
  let hintCount = 0;
  let hintsShown = [];
  let elapsedSeconds = 0;
  let investigating = false;
  let asking = false;

  // ---------- 작은 도우미 ----------
  function mk(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  const toast = (msg) => { $('scene-stage-toast').textContent = msg; };
  const cleanLabel = (label) => String(label || '').replace(/\s*\([a-z]\d+\)\s*/gi, ' ').trim();

  async function api(path, body) {
    let token;
    try {
      token = await authUser.getIdToken(); // 만료가 가까우면 Firebase 가 새 토큰을 받아 준다
    } catch {
      throw new Error('로그인 정보를 확인하지 못했습니다. 새로고침해 주세요.');
    }
    let res;
    try {
      res = await fetch(`/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error('서버에 연결할 수 없습니다.');
    }
    let json;
    try { json = await res.json(); } catch { throw new Error('서버 응답을 읽을 수 없습니다.'); }
    if (!json.ok) throw new Error(json.error || '요청을 처리하지 못했습니다.');
    return json.data;
  }

  // 서버가 주는 단서 필드 이름이 달라도 화면이 깨지지 않도록 맞춰 준다.
  function normClue(c) {
    return {
      id: c.id,
      title: c.title || '',
      location: c.location || '',
      role: c.role || '',
      text: c.text ?? c.publicText ?? c.body ?? '',
    };
  }
  function addClues(list) {
    const added = [];
    for (const raw of list || []) {
      const c = normClue(raw);
      const isNew = !unlockedClueIds.has(c.id);
      allCluesMap[c.id] = c;
      unlockedClueIds.add(c.id);
      if (isNew) added.push(c);
    }
    return added;
  }

  // ---------- 저장 / 복원 ----------
    // 이 브라우저(localStorage)에는 즉시, Firestore 에는 save.js 가 모아서 저장한다.
  let ready = false; // 저장본을 불러오기 전에는 저장하지 않는다 (빈 상태로 덮어쓰기 방지)
  function snapshot() {
    return {
      clues: Array.from(unlockedClueIds).map((id) => allCluesMap[id]).filter(Boolean),
      unlocked: Array.from(unlockedClueIds),
      investigated: Array.from(investigatedTargets),
      chatLogs, apiHistory, hintCount, hintsShown, elapsedSeconds,
    };
  }
  function save() {
    if (!ready) return;
    const s = snapshot();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
    } catch { /* 저장 공간이 없으면 건너뜀 */ }
    window.cloudSave?.schedule(s);
  }
  function applySave(s) {
    try {
      const saved = new Map((s.clues || []).map((c) => [c.id, c]));
      (s.unlocked || []).forEach((id) => {
        if (saved.has(id)) { allCluesMap[id] = normClue(saved.get(id)); unlockedClueIds.add(id); }
      });
      investigatedTargets = new Set(s.investigated || []);
      for (const sp of suspects) {
        if (Array.isArray(s.chatLogs?.[sp.id])) chatLogs[sp.id] = s.chatLogs[sp.id];
        if (Array.isArray(s.apiHistory?.[sp.id])) apiHistory[sp.id] = s.apiHistory[sp.id];
      }
      hintCount = validCount(s.hintCount) ? s.hintCount : 0;
      hintsShown = Array.isArray(s.hintsShown) ? s.hintsShown : [];
      elapsedSeconds = validCount(s.elapsedSeconds) ? s.elapsedSeconds : 0;
    } catch { /* 저장본이 깨졌으면 무시 */ }
  }
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }
  // 이 브라우저와 클라우드 중 더 최근 저장본을 고르고, 이어할지 묻는다.
  async function restoreLatest() {
    const local = readLocal();
    window.cloudSave?.init(uid, CASE_ID);
    const cloud = await window.cloudSave?.load(); // { savedAt, state } 또는 null
    let pick = local;
    let at = Number(local?.savedAt) || 0;
    if (cloud && cloud.savedAt > at) { pick = cloud.state; at = cloud.savedAt; }
    const has = window.cloudSave ? window.cloudSave.hasProgress(pick) : Boolean(pick);
    if (has) {
      const when = at ? new Date(at).toLocaleString('ko-KR') : '알 수 없음';
      if (confirm(`저장된 진행 상황이 있습니다. (마지막 저장: ${when})\n이어서 할까요? [취소]를 누르면 처음부터 시작합니다.`)) {
        applySave(pick);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        await window.cloudSave?.clear(false); // 새 게임은 계속 저장한다
      }
    }
    ready = true;
  }


  // ---------- 타이머 ----------
  const timerDisplay = $('timer-display');
  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  let clock = null;
  let timerInterval = null;
  let finished = false;
  const accuseButton = $('btn-open-accuse');
  function updateTimer() {
    if (clock && !finished) elapsedSeconds = clock();
    if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);
    const enabled = ready && canAccuse(elapsedSeconds) && !finished;
    if (accuseButton) {
      accuseButton.disabled = !enabled;
      accuseButton.textContent = enabled ? '🚨 범인 지목하기' :
        `🔒 범인 지목까지 ${formatTime(Math.max(0, 60 - elapsedSeconds))}`;
    }
  }
  function persistTime() {
    if (!ready || finished) return;
    updateTimer();
    save();
    void window.cloudSave?.flush(true);
  }
  window.addEventListener('pagehide', persistTime);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistTime();
  });
  updateTimer();

  // ---------- 화면 전환 ----------
  function switchScreen(key) {
    if (!screens[key]) return;
    Object.keys(screens).forEach((k) => screens[k].el.classList.toggle('active', k === key));
    $('current-screen-badge').textContent = `현재 화면: ${screens[key].label}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.getAttribute('data-goto')));
  });

  // ---------- 목록 항목 ----------
  function selectableItem({ icon, strong, sub, selected, onClick }) {
    const li = document.createElement('li');
    const btn = mk('button', `selectable-item${selected ? ' selected' : ''}`);
    btn.type = 'button';
    const left = document.createElement('span');
    left.append(`${icon} `, mk('strong', null, strong));
    btn.append(left, mk('span', 'item-sub', sub));
    btn.addEventListener('click', onClick);
    li.appendChild(btn);
    return li;
  }

  // ---------- 현장 오브젝트 ----------
  function renderHotspots() {
    const container = $('dynamic-scene-hotspots');
    container.innerHTML = '';
    view.hotspots.forEach((hs) => {
      const btn = mk('button', 'scene-hotspot');
      btn.type = 'button';
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      const done = hs.mode === 'clue' || investigatedTargets.has(hs.target);
      btn.classList.add(done ? 'state-done' : 'state-ready');

      const visual = mk('div', 'hotspot-visual');
      visual.appendChild(mk('span', 'hotspot-pulse', done ? '✔' : '🔎'));
      const svgHolder = document.createElement('div');
      svgHolder.innerHTML = OBJECT_SVG_LIBRARY[hs.iconType] || OBJECT_SVG_LIBRARY.document; // 우리가 만든 정적 SVG
      visual.appendChild(svgHolder);
      btn.append(visual, mk('span', 'hotspot-label', cleanLabel(hs.label)));

      btn.addEventListener('click', () => onHotspot(hs));
      container.appendChild(btn);
    });
  }

  async function onHotspot(hs) {
    if (hs.mode === 'clue') {
      const clue = allCluesMap[hs.clueId];
      if (clue) openClueCloseupModal(clue, false, hs.iconType);
      return;
    }
    if (investigating) return;
    investigating = true;
    try {
      const r = await api('investigate', {
        caseId: CASE_ID,
        target: hs.target,
        unlocked: Array.from(unlockedClueIds),
      });
      if (r.status === 'FOUND') {
        investigatedTargets.add(hs.target);
        const added = addClues(r.newClues);
        syncAllViews();
        save();
        const clue = added[0] || allCluesMap[r.newClues?.[0]?.id];
        if (clue) {
          toast(`✨ 현장에서 "${clue.title}" 단서를 발견해 사건 수첩에 기록했습니다!`);
          openClueCloseupModal(clue, true, hs.iconType);
        }
      } else if (r.status === 'ALREADY') {
        investigatedTargets.add(hs.target);
        syncAllViews();
        save();
        const clue = hs.clueId ? allCluesMap[hs.clueId] : null;
        if (clue) openClueCloseupModal(clue, false, hs.iconType);
        else toast(r.message);
      } else if (r.status === 'LOCKED') {
        openLockedSpotModal(hs, r.message);
      } else {
        toast(r.message || '조사할 만한 것이 없다.');
      }
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    } finally {
      investigating = false;
    }
  }

  function syncAllViews() {
    renderHotspots();
    renderNotebookClues();
    renderInterrogateClues();
    renderSceneInventoryDock();
    updateSceneHudCounters();
  }

  function updateSceneHudCounters() {
    const spots = view.hotspots.filter((hs) => hs.mode === 'investigate');
    const doneCount = spots.filter((hs) => investigatedTargets.has(hs.target)).length;
    $('scene-progress-text').textContent = `${doneCount} / ${spots.length} 핵심 구역 조사 완료`;
    $('scene-total-clue-badge').textContent = `${unlockedClueIds.size}건`;
  }

  function renderSceneInventoryDock() {
    const slots = $('scene-inventory-slots');
    slots.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      const chip = mk('button', 'inv-chip');
      chip.type = 'button';
      chip.appendChild(mk('span', null, `📌 ${c.title}`));
      chip.addEventListener('click', () => openClueCloseupModal(c, false, 'document'));
      slots.appendChild(chip);
    });
  }

  // ---------- 모달 ----------
  const closeupModal = $('evidence-closeup-modal');

  function openClueCloseupModal(clue, isNewlyFound, iconType = 'document') {
    $('closeup-svg-holder').innerHTML = OBJECT_SVG_LIBRARY[iconType] || OBJECT_SVG_LIBRARY.document;
    const pill = $('closeup-status-pill');
    pill.textContent = isNewlyFound ? '🎉 신규 단서 획득!' : '✔ 확보된 단서 감식';
    pill.style.color = 'var(--success)';
    $('closeup-role-badge').textContent = `${clue.role || '핵심'} 단서`;
    const evidenceNo = Array.from(unlockedClueIds).sort().indexOf(clue.id) + 1;
    $('closeup-id-label').textContent = evidenceNo > 0 ? `증거 No.${evidenceNo}` : '';
    $('closeup-title').textContent = clue.title;
    $('closeup-location').textContent = `📍 발견 위치: ${clue.location}`;
    $('closeup-desc').textContent = clue.text;
    $('closeup-tip').textContent = '💡 이 단서를 사건 수첩에서 대조하거나 용의자 심문실에서 제시해 보세요!';

    const actions = $('closeup-actions');
    actions.innerHTML = '';
    const goBtn = mk('button', 'btn', '💬 이 단서 들고 심문하러 가기');
    goBtn.type = 'button';
    const okBtn = mk('button', 'btn btn-primary', '📥 사건 수첩에 보관 확인');
    okBtn.type = 'button';
    okBtn.addEventListener('click', () => closeupModal.classList.remove('open'));
    goBtn.addEventListener('click', () => {
      closeupModal.classList.remove('open');
      selectedClueIdForChat = clue.id;
      renderInterrogateClues();
      $('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 ${clue.title}`;
      switchScreen('interrogate');
    });
    actions.append(goBtn, okBtn);
    closeupModal.classList.add('open');
  }

  // 서버가 LOCKED 를 돌려준 경우. 어떤 단서가 필요한지는 알려주지 않는다.
  function openLockedSpotModal(hs, message) {
    $('closeup-svg-holder').innerHTML = `
      <svg viewBox="0 0 160 160">
        <rect x="38" y="68" width="84" height="68" rx="10" fill="#3b1d1d" stroke="#e05a5a" stroke-width="3.5"/>
        <path d="M54,68 L54,46 C54,28 106,28 106,46 L106,68" fill="none" stroke="#e05a5a" stroke-width="8" stroke-linecap="round"/>
      </svg>`;
    const pill = $('closeup-status-pill');
    pill.textContent = '🔒 아직 조사할 수 없음';
    pill.style.color = 'var(--danger)';
    $('closeup-role-badge').textContent = '조건부 잠금 오브젝트';
    $('closeup-id-label').textContent = 'LOCKED';
    $('closeup-title').textContent = `🔒 ${cleanLabel(hs.label)}`;
    $('closeup-location').textContent = '';
    $('closeup-desc').textContent = message || '아직 열 이유가 없다.';
    $('closeup-tip').textContent = '💡 용의자 심문이나 다른 현장 조사로 새 단서를 얻은 뒤 다시 시도해 보세요.';
    const actions = $('closeup-actions');
    actions.innerHTML = '';
    const closeBtn = mk('button', 'btn', '닫기');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', () => closeupModal.classList.remove('open'));
    actions.appendChild(closeBtn);
    closeupModal.classList.add('open');
  }

  // ---------- 사건 수첩 ----------
  function showDetailInNotebook(badge, title, meta, body) {
    $('detail-badge').textContent = badge;
    $('detail-title').textContent = title;
    $('detail-meta').textContent = meta;
    $('detail-body').textContent = body;
  }
  function clearNotebookSelection() {
    document.querySelectorAll('#screen-notebook .selectable-item').forEach((el) => el.classList.remove('selected'));
  }

  function renderNotebookSuspects() {
    const list = $('notebook-suspect-list');
    list.innerHTML = '';
    suspects.forEach((s, idx) => {
      list.appendChild(selectableItem({
        icon: '👤', strong: s.name, sub: s.role, selected: idx === 0,
        onClick: (e) => {
          clearNotebookSelection();
          e.currentTarget.classList.add('selected');
          showDetailInNotebook('용의자 프로필', `${s.name} (${s.role})`, `신분: ${s.role}`, s.publicBio || '');
        },
      }));
    });
  }

  function renderNotebookClues() {
    const list = $('notebook-clue-list');
    list.innerHTML = '';
    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      list.appendChild(selectableItem({
        icon: '📌', strong: c.title, sub: c.location,
        onClick: (e) => {
          clearNotebookSelection();
          e.currentTarget.classList.add('selected');
          showDetailInNotebook(`확보 단서 · ${c.role || '일반'}`, c.title, `발견 위치: ${c.location}`, c.text);
        },
      }));
    });
    $('notebook-clue-count').textContent = `${unlockedClueIds.size}건`;
  }

  // ---------- 심문실 ----------
  function renderInterrogateSuspects() {
    const list = $('interrogate-suspect-list');
    list.innerHTML = '';
    suspects.forEach((s) => {
      list.appendChild(selectableItem({
        icon: '👤', strong: s.name, sub: s.role, selected: s.id === currentSuspectId,
        onClick: () => {
          currentSuspectId = s.id;
          renderInterrogateSuspects();
          $('chat-target-name').textContent = `${s.name} (${s.role})`;
          renderChatLog(s.id);
        },
      }));
    });
  }

  function renderInterrogateClues() {
    const list = $('interrogate-clue-list');
    list.innerHTML = '';
    const none = document.createElement('li');
    const noneBtn = mk('button', `selectable-item${selectedClueIdForChat === '' ? ' selected' : ''}`);
    noneBtn.type = 'button';
    noneBtn.appendChild(mk('span', null, '💬 단서 제시 안 함 (일반 질문)'));
    noneBtn.addEventListener('click', () => {
      selectedClueIdForChat = '';
      renderInterrogateClues();
      $('selected-clue-indicator').textContent = '현재 선택된 제시 단서: 없음 (일반 질문)';
    });
    none.appendChild(noneBtn);
    list.appendChild(none);

    Array.from(unlockedClueIds).sort().forEach((cid) => {
      const c = allCluesMap[cid];
      if (!c) return;
      list.appendChild(selectableItem({
        icon: '📌', strong: c.title, sub: c.location, selected: selectedClueIdForChat === cid,
        onClick: () => {
          selectedClueIdForChat = cid;
          renderInterrogateClues();
          $('selected-clue-indicator').textContent = `현재 선택된 제시 단서: 📌 ${c.title}`;
        },
      }));
    });
  }

  function suspectLabel(id) {
    const s = suspects.find((x) => x.id === id);
    return s ? `${s.name} (${s.role})` : id;
  }

  // ---------- 취조실 장면 ----------
  const EMOTION_LABEL = { calm: '😐 침착하다', nervous: '😰 눈에 띄게 긴장했다', angry: '😠 화가 났다', sad: '😢 침울하다' };
  function figureFor(sp) {
    if (!sp) return SUSPECT_FIGURES.default;
    if (SUSPECT_FIGURES[sp.id]) return SUSPECT_FIGURES[sp.id];
    const role = sp.role || '';
    if (/집사/.test(role)) return SUSPECT_FIGURES.butler;
    if (/비서/.test(role)) return SUSPECT_FIGURES.secretary;
    if (/의사|주치의|원장/.test(role)) return SUSPECT_FIGURES.doctor;
    if (/부인|아내|여사/.test(role)) return SUSPECT_FIGURES.wife;
    if (/아들|장남|차남/.test(role)) return SUSPECT_FIGURES.son;
    return SUSPECT_FIGURES.default;
  }
  function updateInterroStage(suspectId) {
    const stage = $('interro-stage');
    if (!stage) return;
    const sp = suspects.find((x) => x.id === suspectId);
    if (stage.dataset.suspect !== suspectId) {
      stage.querySelector('.interro-figure').innerHTML = figureFor(sp); // 우리가 만든 정적 SVG
      stage.dataset.suspect = suspectId;
    }
    const last = [...(chatLogs[suspectId] || [])].reverse().find((m) => m.role === 'model');
    const emotion = EMOTION_LABEL[last?.emotion] ? last.emotion : 'calm';
    stage.dataset.emotion = emotion;
    stage.querySelector('.interro-emotion').textContent = `${sp?.name || ''} · ${EMOTION_LABEL[emotion]}`;
  }

  function renderChatLog(suspectId) {
    updateInterroStage(suspectId);
    const box = $('chat-messages');
    const name = suspectLabel(suspectId);
    const sp = suspects.find((x) => x.id === suspectId);
    box.innerHTML = '';

    const greeting = mk('div', 'msg suspect');
    greeting.append(mk('strong', null, `[${name}]`), document.createElement('br'),
      document.createTextNode(`${sp?.publicBio || ''} 무엇이 궁금하신가요?`));
    box.appendChild(greeting);

    for (const item of chatLogs[suspectId] || []) {
      let node;
      if (item.role === 'user') {
        node = mk('div', 'msg detective', item.text);
      } else if (item.role === 'system') {
        node = mk('div', 'msg system-unlock');
        node.append('🎉 신규 단서 해금: ', mk('strong', null, item.title), ` — "${item.text}"`);
      } else if (item.role === 'error') {
        node = mk('div', 'msg system-unlock', `⚠️ ${item.text}`);
      } else {
        node = mk('div', 'msg suspect');
        node.append(mk('strong', null, `[${name}]`), document.createElement('br'), mk('span', null, item.text));
      }
      box.appendChild(node);
    }
    box.scrollTop = box.scrollHeight;
  }

  $('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (asking) return;
    const input = $('chat-input');
    const text = input.value.trim();
    const clueId = selectedClueIdForChat;
    if (!text && !clueId) return;

    const suspectId = currentSuspectId;
    const clue = clueId ? allCluesMap[clueId] : null;
    const shown = clue ? `[단서 제시: ${clue.title}] ${text}`.trim() : text;

    chatLogs[suspectId] = chatLogs[suspectId] || [];
    apiHistory[suspectId] = apiHistory[suspectId] || [];
    chatLogs[suspectId].push({ role: 'user', text: shown });
    renderChatLog(suspectId);

    const typing = mk('div', 'msg suspect', '…');
    $('chat-messages').appendChild(typing);
    $('chat-messages').scrollTop = $('chat-messages').scrollHeight;

    asking = true;
    $('interro-stage')?.classList.add('is-thinking');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const r = await api('ask', {
        caseId: CASE_ID,
        suspectId,
        message: text,
        showClueId: clueId || undefined,
        unlocked: Array.from(unlockedClueIds),
        history: apiHistory[suspectId],
      });
      chatLogs[suspectId].push({ role: 'model', text: r.reply, emotion: r.emotion });
      apiHistory[suspectId].push({ role: 'user', text: r.historyUser }, { role: 'model', text: r.historyModel });
      apiHistory[suspectId] = apiHistory[suspectId].slice(-20);
      for (const c of addClues(r.newClues)) {
        chatLogs[suspectId].push({ role: 'system', id: c.id, title: c.title, text: c.text });
      }
      input.value = '';
      syncAllViews();
    } catch (err) {
      chatLogs[suspectId].push({ role: 'error', text: err.message });
    } finally {
      asking = false;
      $('interro-stage')?.classList.remove('is-thinking');
      if (submitBtn) submitBtn.disabled = false;
      save();
      if (currentSuspectId === suspectId) renderChatLog(suspectId);
    }
  });

  // ---------- 힌트 ----------
  const hintModal = $('hint-modal');
  function showHint() {
    $('hint-count-display').textContent = hintCount;
    $('modal-hint-count').textContent = hintCount;
    $('hint-modal-text').textContent = `힌트 ${hintsShown.length}: ${hintsShown[hintsShown.length - 1]}`;
    hintModal.classList.add('open');
  }
  $('btn-use-hint')?.addEventListener('click', async () => {
    const total = Number(startData.hintTotal) || 3;
    if (hintCount >= total && hintsShown.length) { showHint(); return; } // 더 쓰면 감점만 늘어나므로 호출하지 않는다.
    try {
      const r = await api('hint', { caseId: CASE_ID, hintCount });
      hintCount = r.hintCount;
      hintsShown.push(r.hint);
      save();
      showHint();
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    }
  });
  $('btn-close-hint')?.addEventListener('click', () => hintModal.classList.remove('open'));

  // ---------- 범인 지목 ----------
  const accuseModal = $('accuse-modal');
  function renderAccuseSuspects() {
    const box = $('accuse-suspect-choices');
    box.innerHTML = '';
    suspects.forEach((s) => {
      const label = mk('label', 'suspect-choice-item');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'accused_suspect';
      radio.value = s.id;
      radio.required = true; // 미리 선택해 두지 않는다.
      const info = document.createElement('div');
      info.appendChild(mk('strong', null, `${s.name} (${s.role})`));
      const bio = mk('div', null, s.publicBio || '');
      bio.style.cssText = 'font-size: 0.8rem; color: var(--text-muted);';
      info.appendChild(bio);
      label.append(radio, info);
      box.appendChild(label);
    });
  }
  accuseButton?.addEventListener('click', () => {
    updateTimer();
    if (ready && canAccuse(elapsedSeconds) && !finished) accuseModal.classList.add('open');
  });
  $('btn-cancel-accuse')?.addEventListener('click', () => accuseModal.classList.remove('open'));

  let accusing = false;
  $('accuse-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateTimer();
    if (accusing || !ready || !canAccuse(elapsedSeconds) || finished) return;
    const checked = document.querySelector('input[name="accused_suspect"]:checked');
    if (!checked) return;
    accusing = true;
    try {
      const submittedSeconds = elapsedSeconds;
      const submittedHints = hintCount;
      const r = await api('accuse', { caseId: CASE_ID, suspectId: checked.value, hintCount: submittedHints, elapsedSeconds: submittedSeconds });
      elapsedSeconds = r.elapsedSeconds;
      hintCount = r.hintCount;
      finished = true;
      clearInterval(timerInterval);
      const result = {
        playerUid: uid,
        caseId: CASE_ID,
        caseTitle: startData.title,
        accusedSuspect: suspectLabel(checked.value),
        isCorrect: r.correct,
        base: r.base,
        penalty: r.penalty,
        score: r.score,
        timePenalty: r.timePenalty,
        hintPenalty: r.hintPenalty,
        scoringVersion: r.scoringVersion,
        ranked: r.ranked,
        elapsedSeconds,
        hintCount,
        solutionExplain: r.solutionExplain,
        isMethodCorrect: r.correct, // 이 서버는 범인만 채점한다. result.js 가 기대하는 필드라 같은 값으로 채운다.
        isMotiveCorrect: r.correct,
      };
      localStorage.setItem('last_case_result', JSON.stringify(result));
      localStorage.removeItem(STORAGE_KEY);
      await window.cloudSave?.clear(); // 사건이 끝났으니 클라우드 저장본도 지운다
      const params = new URLSearchParams({
        suspect: result.accusedSuspect,
        correct: r.correct ? '1' : '0',
        time: String(elapsedSeconds),
        hints: String(hintCount),
        method: r.correct ? '1' : '0',
        motive: r.correct ? '1' : '0',
      });
      window.location.href = `./result.html?${params.toString()}`;
    } catch (err) {
      accusing = false;
      alert(err.message);
    }
  });

  // ---------- 시작 ----------
  try {
    startData = await api('start', { caseId: CASE_ID });
    if (startData.scene) view = startData.scene; // 사건 JSON 에 정의된 배경 테마와 오브젝트 배치
  } catch (err) {
    clearInterval(timerInterval);
    toast(`⚠️ 사건을 불러오지 못했습니다: ${err.message}`);
    return;
  }

  suspects = startData.suspects || [];
  addClues(startData.clues);
  suspects.forEach((s) => { chatLogs[s.id] = []; apiHistory[s.id] = []; });
  await restoreLatest();
  clock = createPlayClock(elapsedSeconds);
  updateTimer();
  let lastSavedSecond = elapsedSeconds;
  timerInterval = setInterval(() => {
    updateTimer();
    if (elapsedSeconds - lastSavedSecond >= 5) {
      save();
      lastSavedSecond = elapsedSeconds;
    }
  }, 1000);
  currentSuspectId = suspects[0]?.id || '';

  $('case-header-title').textContent = `📁 ${startData.title}`;
  $('notebook-heading').textContent = `📓 사건 수첩 — ${startData.title}`;
  $('case-intro-text').textContent = startData.intro;
  $('scene-room-heading').textContent = `🔍 사건 현장 — ${view.roomTitle}`;
  $('notebook-suspect-count').textContent = `${suspects.length}명`;
  $('dynamic-scene-bg').innerHTML = SCENE_THEME_BACKGROUNDS[view.sceneTheme] || SCENE_THEME_BACKGROUNDS.mansion_study;
  $('interro-stage').querySelector('.interro-back').innerHTML = INTERRO_ROOM_BACK;
  $('interro-stage').querySelector('.interro-front').innerHTML = INTERRO_ROOM_FRONT;
  // 물건 그림은 배경(가로 1280 기준)과 같은 비율로 커지고 작아져야 그림 속 가구와 위치가 맞는다.
  const stage = $('crime-scene-stage');
  const fitScene = () => stage.style.setProperty('--scene-scale', (stage.clientWidth / 1280).toFixed(3));
  if (window.ResizeObserver) new ResizeObserver(fitScene).observe(stage);
  fitScene();
  $('hint-count-display').textContent = hintCount;
  if (timerDisplay) timerDisplay.textContent = formatTime(elapsedSeconds);

  renderNotebookSuspects();
  syncAllViews();
  renderInterrogateSuspects();
  renderChatLog(currentSuspectId);
  renderAccuseSuspects();
  if (suspects[0]) {
    showDetailInNotebook('용의자 프로필', `${suspects[0].name} (${suspects[0].role})`, `신분: ${suspects[0].role}`, suspects[0].publicBio || '');
    $('chat-target-name').textContent = `${suspects[0].name} (${suspects[0].role})`;
  }
  toast(`✨ [${startData.title}] 현장이 로드되었습니다! 화면 속 물건을 클릭해 단서를 수집하세요.`);
});
