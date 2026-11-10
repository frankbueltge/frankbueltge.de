// Builds the HTML for a real calendar-day column: one page-height (864 x
// 1118 native px, the house's proven 4 px/mm scale) per CALENDAR DAY between
// a start and end date. Order days get the actual rendered page image(s)
// (file:// paths into the render cache — never re-encoded, never retyped).
// Blank days get a plain white 864x1118 div. Nothing else is added: no
// background wall, no border, no caption, no date — matching NO PART's own
// "nothing added" discipline (compose-strip.js).
//
// STACKING RULE for a day with k>1 Miscellaneous Orders (documented in
// REPORT.md verbatim, restated here so the code and the prose can never
// drift apart): the day's one 1118px slot is split into k horizontal bands,
// ordered top-to-bottom in the exact sequence the records for that date
// appear in orders-2025-term.json's own `records` array. Band heights are
// floor(1118/k) for every band but the last, and the remainder for the last,
// so the bands sum to exactly 1118px with no gap, no overlap. Each order's
// full rendered page is shown at the full 864px native width, non-uniformly
// scaled (squeezed) to exactly fill its band's height — the whole sheet,
// compressed, never cropped, never dropped.
const fs = require('fs');
const path = require('path');

const RENDER_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/renders';
const PAGE_W = 864;
const PAGE_H = 1118;

function isoAddDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

// Returns { days: [{date, files|null}], startDate, endDate, count }
function calendarRange(startDate, endDate, byDateOrder) {
  const map = new Map(byDateOrder.map(e => [e.date, e.files]));
  const n = daysBetween(startDate, endDate) + 1;
  const days = [];
  for (let i = 0; i < n; i++) {
    const date = isoAddDays(startDate, i);
    days.push({ date, files: map.get(date) || null });
  }
  return { days, startDate, endDate, count: n };
}

function bandHeights(k) {
  const base = Math.floor(PAGE_H / k);
  const arr = new Array(k).fill(base);
  arr[k - 1] = PAGE_H - base * (k - 1);
  return arr;
}

function daySlotHtml(day) {
  if (!day.files) {
    return `<div class="slot blank" data-date="${day.date}" style="width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;"></div>`;
  }
  const k = day.files.length;
  if (k === 1) {
    const src = 'file://' + path.join(RENDER_DIR, day.files[0].replace(/\.pdf$/, '.png'));
    return `<div class="slot order" data-date="${day.date}" data-docs="1" style="width:${PAGE_W}px;height:${PAGE_H}px;">` +
      `<img src="${src}" width="${PAGE_W}" height="${PAGE_H}" style="display:block;width:${PAGE_W}px;height:${PAGE_H}px;">` +
      `</div>`;
  }
  const heights = bandHeights(k);
  const imgs = day.files.map((f, i) => {
    const src = 'file://' + path.join(RENDER_DIR, f.replace(/\.pdf$/, '.png'));
    return `<img src="${src}" width="${PAGE_W}" height="${heights[i]}" style="display:block;width:${PAGE_W}px;height:${heights[i]}px;">`;
  }).join('');
  return `<div class="slot order multi" data-date="${day.date}" data-docs="${k}" style="width:${PAGE_W}px;height:${PAGE_H}px;">${imgs}</div>`;
}

function buildColumnHtml(startDate, endDate, byDateOrder, opts) {
  opts = opts || {};
  const { days, count } = calendarRange(startDate, endDate, byDateOrder);
  const totalHeight = count * PAGE_H;
  const scale = opts.scale != null ? opts.scale : 1;
  const body = days.map(daySlotHtml).join('\n');
  return {
    totalHeight,
    dayCount: count,
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:#fff;}
      ::-webkit-scrollbar{display:none;width:0;height:0;}
      html{scrollbar-width:none;}
      #stage{width:${PAGE_W}px;transform-origin:top left;transform:scale(${scale});}
    </style></head><body><div id="stage">${body}</div></body></html>`,
  };
}

module.exports = { buildColumnHtml, calendarRange, bandHeights, daySlotHtml, isoAddDays, daysBetween, PAGE_W, PAGE_H, RENDER_DIR };
