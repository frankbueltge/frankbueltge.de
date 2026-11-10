// Builder — Ensemble, session 45 (CONCEPT)
// Renders one still frame from /etudes/5000-series/corpus/entries.json.
// Only entries with section === "CERTIORARI DENIED" are used (792 real objects).
// Nothing in the visible text is invented: every docket/caption on every card
// is verbatim from the corpus. The one repeating sentence is verified verbatim
// against the source document and is the only string allowed to repeat.
//
// Usage:  NODE_PATH=/opt/node22/lib/node_modules node build.js
// Output: page.html (the rendered document, kept for inspection/reproducibility)
//         still-1x.png (2000x1250 @ deviceScaleFactor 1)
//         still-2x.png (2000x1250 @ deviceScaleFactor 2)

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const CORPUS = path.join(__dirname, '..', 'corpus', 'entries.json');
const OUT_HTML = path.join(__dirname, 'page.html');
const OUT_1X = path.join(__dirname, 'still-1x.png');
const OUT_2X = path.join(__dirname, 'still-2x.png');

const SENTENCE = 'The petitions for writs of certiorari are denied.';

// ---- Tunable geometry (values chosen by the Builder; see README.md) ----
const CONF = {
  stageW: 2000,
  stageH: 1250,
  cols: 36,
  rows: 22,
  cardW: 200,
  cardH: 310,
  gutter: 12,
  perspective: 1000,
  perspectiveOriginX: '15%',
  perspectiveOriginY: '15%',
  rotateX: 8,    // small: top tips back slightly (standing-height cue) — this is a WALL, not a floor
  rotateY: -30,   // dominant recession: right (near the ledge) is close, left swings away into depth
  wallTranslateZ: 0,
  pivotTargetX: 3200,  // desired on-screen position of the wall's near (bottom-right) pivot corner
  pivotTargetY: 3500,
  // ledge / foreground object, in screen space, positioned empirically after look-and-fix
  ledgeColIndex: 32,  // column in the grid whose slot is left empty (the gap)
  ledgeGapRow: 13,      // row (0 = top/far, rows-1 = bottom/near) of the empty slot — near the bottom, by the ledge
  ledgeLeft: 1400,
  ledgeTop: 690,
  ledgeW: 400,
  ledgeH: 420,
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function main() {
  const all = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
  const denied = all.filter((e) => e.section === 'CERTIORARI DENIED');
  if (denied.length !== 792) {
    console.error('Expected 792 CERTIORARI DENIED entries, got', denied.length);
    process.exit(1);
  }

  // Ledge card: a real entry, held out of the grid pool entirely.
  const ledgeEntry = denied[0]; // 24-796 MISSOURI, ET AL. V. UNITED STATES
  const gridPool = denied.slice(1); // 791 remaining, all real, no repeats

  const { cols, rows } = CONF;
  const totalCells = cols * rows; // 792
  const gapIndex = CONF.ledgeGapRow * cols + CONF.ledgeColIndex;

  // Fill grid cells row-major with the pool, skipping the single gap cell.
  const cells = [];
  let p = 0;
  for (let i = 0; i < totalCells; i++) {
    if (i === gapIndex) {
      cells.push(null); // the empty slot
    } else {
      cells.push(gridPool[p]);
      p++;
    }
  }
  if (p !== gridPool.length) {
    console.error('Pool/grid mismatch: used', p, 'of', gridPool.length);
    process.exit(1);
  }

  const wallW = cols * (CONF.cardW + CONF.gutter);
  const wallH = rows * (CONF.cardH + CONF.gutter);

  function cardInner(entry, big) {
    return `
      <div class="doc">${esc(entry.docket)}</div>
      <div class="cap">${esc(entry.caption)}</div>
      <div class="sentence">${esc(SENTENCE)}</div>
      <div class="ruled">
        ${Array.from({ length: big ? 5 : 6 }).map(() => '<div class="rule"></div>').join('')}
      </div>
      <div class="foot"><span class="footrule"></span></div>
    `;
  }

  let cardDivs = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const entry = cells[idx];
      const left = c * (CONF.cardW + CONF.gutter);
      const top = r * (CONF.cardH + CONF.gutter);
      if (entry === null) {
        cardDivs += `<div class="card gap" style="left:${left}px;top:${top}px;width:${CONF.cardW}px;height:${CONF.cardH}px;"></div>\n`;
      } else {
        cardDivs += `<div class="card" style="left:${left}px;top:${top}px;width:${CONF.cardW}px;height:${CONF.cardH}px;">${cardInner(entry, false)}</div>\n`;
      }
    }
  }

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>still</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${CONF.stageW}px; height: ${CONF.stageH}px;
    background: #17150f;
    overflow: hidden;
  }
  .stage {
    width: ${CONF.stageW}px; height: ${CONF.stageH}px;
    position: relative;
    overflow: hidden;
    background: #1c1a13;
    perspective: ${CONF.perspective}px;
    perspective-origin: ${CONF.perspectiveOriginX} ${CONF.perspectiveOriginY};
  }
  .wall {
    position: absolute;
    width: ${wallW}px;
    height: ${wallH}px;
    left: 50%; top: 50%;
    margin-left: ${CONF.pivotTargetX - 1000 - wallW}px;
    margin-top: ${CONF.pivotTargetY - 625 - wallH}px;
    transform-style: preserve-3d;
    transform-origin: 100% 100%;
    transform:
      rotateX(${CONF.rotateX}deg)
      rotateY(${CONF.rotateY}deg)
      translateZ(${CONF.wallTranslateZ}px);
    background: #b8ae98;
  }
  .card {
    position: absolute;
    background: #eee6d5;
    border: 1px solid #a89f8a;
    box-shadow: 0 3px 0 rgba(20,16,6,0.35);
    font-family: 'Liberation Mono', monospace;
    padding: 9px 8px 7px 8px;
    overflow: hidden;
  }
  .card.gap {
    background: #100e09;
    border: 1px solid #050403;
    box-shadow: inset 0 6px 10px rgba(0,0,0,0.8);
  }
  .doc {
    font-size: 15px;
    font-weight: 700;
    color: #17130a;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cap {
    font-size: 10px;
    font-weight: 700;
    color: #17130a;
    letter-spacing: 0.005em;
    white-space: normal;
    overflow-wrap: break-word;
    line-height: 1.22;
    margin-top: 3px;
  }
  .sentence {
    font-size: 9px;
    color: #7a7462;
    line-height: 1.28;
    margin-top: 7px;
  }
  .ruled { margin-top: 12px; }
  .rule {
    border-bottom: 1px solid rgba(23,19,10,0.16);
    height: 15px;
  }
  .foot {
    position: absolute;
    left: 0; right: 0; bottom: 10px;
    display: flex; justify-content: center;
  }
  .footrule {
    display: block;
    width: 46%;
    border-bottom: 1px solid rgba(23,19,10,0.45);
  }

  /* ---- foreground ledge (near-camera, not part of the receding plane) ---- */
  .ledge-backing {
    position: absolute;
    left: ${CONF.ledgeLeft - 10}px;
    top: ${CONF.ledgeTop - 10}px;
    width: ${CONF.ledgeW + 20}px;
    height: ${CONF.ledgeH * 0.62 + 26 + 10}px;
    background: #a89a7c;
  }
  .ledge-shelf {
    position: absolute;
    left: ${CONF.ledgeLeft - 10}px;
    top: ${CONF.ledgeTop + CONF.ledgeH * 0.62}px;
    width: ${CONF.ledgeW + 20}px;
    height: 26px;
    background: #97896a;
    border-top: 1px solid #cabf9e;
    box-shadow: 0 10px 18px rgba(0,0,0,0.45);
  }
  .ledge-card {
    position: absolute;
    left: ${CONF.ledgeLeft + 26}px;
    top: ${CONF.ledgeTop}px;
    width: ${CONF.ledgeW * 0.62}px;
    height: ${CONF.ledgeH * 0.62}px;
    background: #eee6d5;
    border: 1px solid #a89f8a;
    box-shadow: 0 9px 16px rgba(0,0,0,0.5);
    font-family: 'Liberation Mono', monospace;
    padding: 14px 13px 11px 13px;
    transform: rotate(-1.2deg);
    overflow: hidden;
  }
  .ledge-card .doc { font-size: 21px; }
  .ledge-card .cap {
    font-size: 17px;
    line-height: 1.2;
    margin-top: 5px;
    white-space: normal;
    overflow-wrap: break-word;
  }
  .ledge-card .sentence { font-size: 12px; margin-top: 12px; }
  .ledge-card .rule { height: 18px; }
  .ledge-card .foot { bottom: 14px; }
  .pen {
    position: absolute;
    left: ${CONF.ledgeLeft + CONF.ledgeW * 0.62 + 34}px;
    top: ${CONF.ledgeTop + CONF.ledgeH * 0.44}px;
    width: 96px;
    height: 8px;
    background: #2b2b2e;
    border-radius: 0 4px 4px 0;
    transform: rotate(8deg);
    box-shadow: 0 4px 6px rgba(0,0,0,0.4);
  }
  .pen::before {
    content: '';
    position: absolute;
    right: -9px; top: 1px;
    width: 12px; height: 7px;
    background: #d8b45a;
    border-radius: 0 5px 5px 0;
  }
  .pen::after {
    content: '';
    position: absolute;
    left: 0; top: 3px;
    width: 30px; height: 3px;
    background: #c9c9cf;
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="wall">
      ${cardDivs}
    </div>
    <div class="ledge-backing"></div>
    <div class="ledge-shelf"></div>
    <div class="pen"></div>
    <div class="ledge-card">${cardInner(ledgeEntry, true)}</div>
  </div>
</body>
</html>`;

  fs.writeFileSync(OUT_HTML, html, 'utf8');
  console.log('wrote', OUT_HTML);
  return { gapIndex, cols, rows, ledgeEntry };
}

async function shoot() {
  const meta = main();
  const browser = await chromium.launch();
  for (const [scale, out] of [[1, OUT_1X], [2, OUT_2X]]) {
    const ctx = await browser.newContext({
      viewport: { width: CONF.stageW, height: CONF.stageH },
      deviceScaleFactor: scale,
    });
    const page = await ctx.newPage();
    await page.goto('file://' + OUT_HTML);
    await page.waitForTimeout(150);
    await page.screenshot({ path: out });
    console.log('wrote', out);
    await ctx.close();
  }
  await browser.close();
  console.log('gap cell index', meta.gapIndex, 'of', meta.cols * meta.rows, 'ledge entry', meta.ledgeEntry);
}

shoot();
