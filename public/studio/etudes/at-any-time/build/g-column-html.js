// THE ADOPTED GROUND — Dramaturg's STAGING-RULING-2.md §7 amendment and §15
// item 1: "the non-paper ground is not scaffolding, it is the condition. The
// work adopts a ground that is not paper-white ... with the column centred."
// This is column-html.js (unchanged stacking rule, unchanged band logic)
// with exactly three differences, each named:
//
//   1. GROUND: html/body background is rgb(128,128,128) — the same grey
//      bc2-paper-edges.js used as scaffolding — instead of #fff. This is now
//      the staging, not a test harness (Dramaturg §7, §9).
//   2. CENTRING: #stage gets `margin:0 auto` instead of living flush left,
//      so the paper sits centred in the viewport (measured x=208...1071 at
//      a 1280px viewport, per the Dramaturg's own bc2 measurement, which
//      this file reproduces by construction, not by copying the number).
//   3. NO DATE LEAK: data-date and data-docs attributes are REMOVED from
//      every slot (Dramaturg §15 item 4 / D6). Nothing else changes: no
//      caption, no number, no tick, no scale mark, no id/class that encodes
//      a date or count.
//
// Everything else — the 1118px/day slot, the k-way band split for multi-
// order days, the file:// image sourcing, the scrollbar-hiding CSS — is
// copied verbatim from column-html.js so the stacking rule cannot drift
// between the two builds.
const fs = require('fs');
const path = require('path');

const RENDER_DIR = '/tmp/claude-0/-home-user-studio/9f6afc39-9035-5664-9b4d-ee73bc4c6b35/scratchpad/renders';
const PAGE_W = 864;
const PAGE_H = 1118;
const GROUND_RGB = [128, 128, 128]; // same grey bc2-paper-edges.js used; now the adopted staging

function isoAddDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

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

// Same slot markup as column-html.js's daySlotHtml, MINUS data-date and
// data-docs (item 4 / D6: nothing in the served bytes should schedule the
// visitor). No replacement attribute of any kind is added in their place.
function daySlotHtml(day) {
  if (!day.files) {
    return `<div class="slot blank" style="width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;"></div>`;
  }
  const k = day.files.length;
  if (k === 1) {
    const src = 'file://' + path.join(RENDER_DIR, day.files[0].replace(/\.pdf$/, '.png'));
    return `<div class="slot order" style="width:${PAGE_W}px;height:${PAGE_H}px;">` +
      `<img src="${src}" width="${PAGE_W}" height="${PAGE_H}" style="display:block;width:${PAGE_W}px;height:${PAGE_H}px;">` +
      `</div>`;
  }
  const heights = bandHeights(k);
  const imgs = day.files.map((f, i) => {
    const src = 'file://' + path.join(RENDER_DIR, f.replace(/\.pdf$/, '.png'));
    return `<img src="${src}" width="${PAGE_W}" height="${heights[i]}" style="display:block;width:${PAGE_W}px;height:${heights[i]}px;">`;
  }).join('');
  return `<div class="slot order multi" style="width:${PAGE_W}px;height:${PAGE_H}px;">${imgs}</div>`;
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
      html,body{margin:0;padding:0;background:rgb(${GROUND_RGB.join(',')});}
      ::-webkit-scrollbar{display:none;width:0;height:0;}
      html{scrollbar-width:none;}
      #stage{width:${PAGE_W}px;margin:0 auto;transform-origin:top center;transform:scale(${scale});}
    </style></head><body><div id="stage">${body}</div></body></html>`,
  };
}

// RESPONSIVE variant, for the 390px phone build (task 2) — a genuine
// layout-width fit, not a CSS `transform:scale()` visual squeeze. Found
// during this build: applying `transform:scale()` to a `margin:0 auto`
// centred 864px-wide box, in a viewport narrower than 864px, shrinks the
// PAINTED pixels correctly but does NOT shrink the box's LAYOUT footprint —
// `transform` never affects layout size. The unscaled 864px box, centred by
// margin auto in a 390px viewport, straddles from x=-237 to x=627 in layout
// space; browsers report only the positive overflow, so
// `document.documentElement.scrollWidth` measured 627px, not 390px, and a
// `fullPage` screenshot captured at that wrong width. Nothing on a real
// device would look wrong (the transform still paints inside the viewport),
// but real horizontal overflow of that kind is exactly the affordance
// binding condition 4 was praised for NOT having (STAGING-RULING-2.md §8) —
// a phone could still swipe sideways into that 237px of dead layout space.
// This responsive variant avoids the defect at its root: every box is sized
// in percentages / `aspect-ratio`, so the LAYOUT width is genuinely 100% of
// the viewport, never wider — no transform, nothing to overflow.
function daySlotHtmlResponsive(day) {
  const ratio = `${PAGE_W}/${PAGE_H}`;
  if (!day.files) {
    return `<div class="slot blank" style="width:100%;aspect-ratio:${ratio};background:#fff;"></div>`;
  }
  const k = day.files.length;
  if (k === 1) {
    const src = 'file://' + path.join(RENDER_DIR, day.files[0].replace(/\.pdf$/, '.png'));
    return `<div class="slot order" style="width:100%;aspect-ratio:${ratio};">` +
      `<img src="${src}" style="display:block;width:100%;height:100%;">` +
      `</div>`;
  }
  const heights = bandHeights(k);
  const imgs = day.files.map((f, i) => {
    const src = 'file://' + path.join(RENDER_DIR, f.replace(/\.pdf$/, '.png'));
    const pct = (heights[i] / PAGE_H) * 100;
    return `<img src="${src}" style="display:block;width:100%;height:${pct}%;">`;
  }).join('');
  return `<div class="slot order multi" style="width:100%;aspect-ratio:${ratio};">${imgs}</div>`;
}

function buildColumnHtmlResponsive(startDate, endDate, byDateOrder) {
  const { days, count } = calendarRange(startDate, endDate, byDateOrder);
  const body = days.map(daySlotHtmlResponsive).join('\n');
  return {
    dayCount: count,
    html: `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:rgb(${GROUND_RGB.join(',')});}
      ::-webkit-scrollbar{display:none;width:0;height:0;}
      html{scrollbar-width:none;}
      #stage{width:100%;}
    </style></head><body><div id="stage">${body}</div></body></html>`,
  };
}

module.exports = { buildColumnHtml, buildColumnHtmlResponsive, calendarRange, bandHeights, daySlotHtml, daySlotHtmlResponsive, isoAddDays, daysBetween, PAGE_W, PAGE_H, GROUND_RGB, RENDER_DIR };
