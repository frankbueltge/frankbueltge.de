  // marked days
  var SANS = "font-family=\"'Helvetica Neue', Helvetica, Arial, sans-serif\"";
  function T(x, y, size, txt, extra) { P('<text ' + SANS + ' x="' + x + '" y="' + y + '" font-size="' + size + '" ' + (extra || '') + '>' + txt + '</text>'); }
  function find(y, m, d) { return days.filter(function (q) { return q.y === y && q.m === m && q.d === d; })[0]; }
  function sgn(v) { var p = Math.round(v * 100); return (p > 0 ? '+' : '−') + Math.abs(p) + '%'; }
  var marks = [
    { y: 2006, m: 5, d: 6, t: "6.6.06, avoided", lv: 0 },
    { y: 2009, m: 8, d: 9, t: "9.9.09, the busiest day of the fifteen years: 16,081 births", lv: 0 },
    { y: 2010, m: 9, d: 10, t: "10.10.10, a Sunday", lv: 1 },
    { y: 2011, m: 10, d: 11, t: "11.11.11", lv: 2 },
    { y: 2012, m: 11, d: 12, t: "12.12.12", lv: 3 }
  ];
  marks.forEach(function (mk) {
    var o = find(mk.y, mk.m, mk.d);
    var x = sx(o.slot), yy = TOP + (o.y - 2000) * (RH + GAP);
    P('<rect x="' + (x - 1.2).toFixed(1) + '" y="' + (yy - 1.2) + '" width="' + (CW + 2.4).toFixed(1) + '" height="' + (RH + 2.4) + '" fill="none" stroke="' + RED + '" stroke-width="1.1"/>');
    var cx = x + CW / 2, ly = BOT + 15 + mk.lv * 12;
    P('<line x1="' + cx + '" x2="' + cx + '" y1="' + (BOT + 3) + '" y2="' + (ly - 3) + '" stroke="' + RED + '" stroke-width="0.7"/>');
    P('<line x1="' + cx + '" x2="' + (cx - 4) + '" y1="' + (ly - 3) + '" y2="' + (ly - 3) + '" stroke="' + RED + '" stroke-width="0.7"/>');
    T(cx - 6, ly, 10.5, mk.t + ' <tspan font-weight="bold">' + sgn(o.r - 1) + '</tspan>', 'text-anchor="end" fill="' + RED + '"');
  });
  T(X0, BOT + 15, 10, 'Ringed: the repeating dates. Figures give each day against an ordinary day of its weekday and month.', 'fill="' + GREY + '"');

  // ---- the year with the week taken out ----
  var BASE = 618, SC = 270; // px per 1.0 of ratio
  P('<text font-family="Georgia, \'Times New Roman\', serif" x="' + X0 + '" y="' + (BASE - 86) + '" font-size="18" font-style="italic">The same calendar with the week taken out</text>');
  T(X0, BASE - 68, 11.5, 'Each day of the year set against what its weekday and month would predict, averaged over the fifteen years: above the line, more births than expected; below, fewer.', 'fill="#4a4a44"');
  T(X0, BASE - 53, 11.5, 'What remains is largely choice — the days on which an induction or a caesarean was booked, and the days everyone kept free.', 'fill="#4a4a44"');
  for (var s2 = 0; s2 < 366; s2++) {
    var v = prof[s2] - 1;
    var h = Math.abs(v) * SC;
    var x = sx(s2);
    P('<rect x="' + x.toFixed(1) + '" y="' + (v >= 0 ? BASE - h : BASE).toFixed(1) + '" width="' + (CW - 0.5).toFixed(2) + '" height="' + Math.max(0.6, h).toFixed(1) + '" fill="' + (v >= 0 ? "rgb(" + INK.join(",") + ")" : RED) + '"/>');
  }
  P('<line x1="' + (X0 - 6) + '" x2="' + (sx(366) + 4) + '" y1="' + BASE + '" y2="' + BASE + '" stroke="#1f2430" stroke-width="0.6"/>');
  T(X0 - 12, BASE + 4, 10, 'as expected', 'text-anchor="end" fill="' + GREY + '"');
  [-0.4, -0.3, -0.2, -0.1, 0.1].forEach(function (v) {
    var yy = BASE - v * SC;
    P('<line x1="' + (X0 - 6) + '" x2="' + (X0 - 2) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + GREY + '" stroke-width="0.6"/>');
    T(X0 - 9, yy + 3.5, 9.5, (v > 0 ? "+" : "−") + Math.round(Math.abs(v * 100)) + '%', 'text-anchor="end" fill="' + GREY + '"');
  });
  for (i = 1; i < 12; i++) P('<line x1="' + sx(MSTART[i]) + '" x2="' + sx(MSTART[i]) + '" y1="' + (BASE - 34) + '" y2="' + (BASE + 116) + '" stroke="' + GREY + '" stroke-width="0.4" stroke-dasharray="1 3"/>');
  for (i = 0; i < 12; i++) T(sx(MSTART[i]) + 1, BASE + 128, 10, MON[i].toUpperCase(), 'letter-spacing="1" fill="' + GREY + '"');

  function slotOf(m, d) { return MSTART[m] + d - 1; }
  // label beside the tip of a day's bar
  function note(m, d, label, side, dy) {
    var s = slotOf(m, d), v = prof[s] - 1;
    var x = sx(s) + CW / 2, y = BASE - v * SC + (dy || 0);
    var tx = side === "end" ? x - 6 : x + 6;
    T(tx, y, 10.5, label + ' <tspan fill="' + RED + '" font-weight="bold">' + sgn(v) + '</tspan>', 'text-anchor="' + side + '" fill="#1f2430"');
  }
  note(0, 1, "New Year’s Day", "start", 2);
  note(6, 4, "Fourth of July", "start", 2);
  note(9, 31, "Halloween", "end", 2);
  note(11, 25, "Christmas Day", "end", 2);
  note(11, 24, "Christmas Eve", "end", -6);

  function remark(x, y, lines, anchor) {
    lines.forEach(function (l, j) { T(x, y + j * 12, 10, l, 'fill="#4a4a44" text-anchor="' + (anchor || "start") + '"'); });
  }
  remark(sx(slotOf(10, 25)), BASE + 46, ["Thanksgiving", "(it moves)"], "middle");
  remark(sx(slotOf(8, 1)) - 6, BASE + 30, ["Labor Day", "(it moves)"], "end");
  remark(sx(slotOf(11, 15)) - 4, BASE - 30, ["the year’s last working days →"], "end");

  // the thirteenths
  var s13 = 0, n13 = 0;
  days.forEach(function (o) { if (o.d === 13) { s13 += o.r; n13++; } });
  for (i = 0; i < 12; i++) P('<circle cx="' + (sx(slotOf(i, 13)) + CW / 2) + '" cy="' + (BASE + 104) + '" r="1.7" fill="' + RED + '"/>');
  T(X0 - 9, BASE + 107, 9.5, 'every 13th: ' + sgn(s13 / n13 - 1), 'text-anchor="end" fill="' + RED + '"');

  // footer
  var mn = days.reduce(function (a, o) { return o.n < a.n ? o : a; }), mx = days.reduce(function (a, o) { return o.n > a.n ? o : a; });
  var WD = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  T(X0, H - 16, 9.5, 'Data: U.S. Social Security Administration, via FiveThirtyEight (CC BY 4.0). Fewest births in a day: ' + mn.n.toLocaleString("en-US") + ', ' + mn.d + ' ' + MON[mn.m] + ' ' + mn.y + ' (a ' + WD[mn.wd] + '). Most: ' + mx.n.toLocaleString("en-US") + ', ' + mx.d + ' ' + MON[mx.m] + ' ' + mx.y + ' (a ' + WD[mx.wd] + '). Mean: ' + Math.round(b.reduce(function (a, c) { return a + c; }, 0) / b.length).toLocaleString("en-US") + '.', 'fill="' + GREY + '"');
