// src/lib/comma/places.ts — where a country sits, east or west, for placing its sounds in the stereo field (2026-11-13).
//
// The longitude of each country's centre, rounded to whole degrees, from the country table of Google's Dataset
// Publishing Language (github.com/google/dspl, samples/google/canonical/countries.csv). Facts, rounded; only the pan of
// a sound depends on them: west sounds left, east sounds right. A country missing here sounds in the middle.

export const LONGITUDE: Readonly<Record<string, number>> = {
  AD: 2, AE: 54, AF: 68, AG: -62, AI: -63, AL: 20, AM: 45, AN: -69, AO: 18, AQ: 0, AR: -64, AS: -170,
  AT: 15, AU: 134, AW: -70, AZ: 48, BA: 18, BB: -60, BD: 90, BE: 4, BF: -2, BG: 25, BH: 51, BI: 30,
  BJ: 2, BM: -65, BN: 115, BO: -64, BR: -52, BS: -77, BT: 90, BV: 3, BW: 25, BY: 28, BZ: -88, CA: -106,
  CC: 97, CD: 22, CF: 21, CG: 16, CH: 8, CI: -6, CK: -160, CL: -72, CM: 12, CN: 104, CO: -74, CR: -84,
  CU: -78, CV: -24, CX: 106, CY: 33, CZ: 15, DE: 10, DJ: 43, DK: 10, DM: -61, DO: -70, DZ: 2, EC: -78,
  EE: 25, EG: 31, EH: -13, ER: 40, ES: -4, ET: 40, FI: 26, FJ: 179, FK: -60, FM: 151, FO: -7, FR: 2,
  GA: 12, GB: -3, GD: -62, GE: 43, GF: -53, GG: -3, GH: -1, GI: -5, GL: -43, GM: -15, GN: -10, GP: -62,
  GQ: 10, GR: 22, GS: -37, GT: -90, GU: 145, GW: -15, GY: -59, GZ: 34, HK: 114, HM: 74, HN: -86, HR: 15,
  HT: -72, HU: 20, ID: 114, IE: -8, IL: 35, IM: -5, IN: 79, IO: 72, IQ: 44, IR: 54, IS: -19, IT: 13,
  JE: -2, JM: -77, JO: 36, JP: 138, KE: 38, KG: 75, KH: 105, KI: -169, KM: 44, KN: -63, KP: 128, KR: 128,
  KW: 47, KY: -81, KZ: 67, LA: 102, LB: 36, LC: -61, LI: 10, LK: 81, LR: -9, LS: 28, LT: 24, LU: 6,
  LV: 25, LY: 17, MA: -7, MC: 7, MD: 28, ME: 19, MG: 47, MH: 171, MK: 22, ML: -4, MM: 96, MN: 104,
  MO: 114, MP: 145, MQ: -61, MR: -11, MS: -62, MT: 14, MU: 58, MV: 73, MW: 34, MX: -103, MY: 102, MZ: 36,
  NA: 18, NC: 166, NE: 8, NF: 168, NG: 9, NI: -85, NL: 5, NO: 8, NP: 84, NR: 167, NU: -170, NZ: 175,
  OM: 56, PA: -81, PE: -75, PF: -149, PG: 144, PH: 122, PK: 69, PL: 19, PM: -56, PN: -127, PR: -67, PS: 35,
  PT: -8, PW: 135, PY: -58, QA: 51, RE: 56, RO: 25, RS: 21, RU: 105, RW: 30, SA: 45, SB: 160, SC: 55,
  SD: 30, SE: 19, SG: 104, SH: -10, SI: 15, SJ: 24, SK: 20, SL: -12, SM: 12, SN: -14, SO: 46, SR: -56,
  ST: 7, SV: -89, SY: 39, SZ: 31, TC: -72, TD: 19, TF: 69, TG: 1, TH: 101, TJ: 71, TK: -172, TL: 126,
  TM: 60, TN: 10, TO: -175, TR: 35, TT: -61, TV: 178, TW: 121, TZ: 35, UA: 31, UG: 32, US: -96, UY: -56,
  UZ: 65, VA: 12, VC: -61, VE: -67, VG: -65, VI: -65, VN: 108, VU: 167, WF: -177, WS: -172, XK: 21, YE: 49,
  YT: 45, ZA: 23, ZM: 28, ZW: 29,
}

/** −1 (far west) … 1 (far east), held inside 0.9 so nothing sits on one ear only. */
export function panOf(cc: string): number {
  const lon = LONGITUDE[cc]
  return lon === undefined ? 0 : Math.max(-0.9, Math.min(0.9, lon / 180))
}
