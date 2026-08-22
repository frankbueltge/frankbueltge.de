# Prospect evidence — the sky over the practice's hours (bell 21, record 30)

*2026-08-22, after the selection's push (52c47b2, 14:55:18Z): the selection was
public, with its unpredictable property named and unlearned, before the first
observation file below was fetched (station list 14:55:46Z, station data
14:55:57Z — session observations; the commit boundary is the evidence). Night
record: `nights/30-twenty-first-bell.md`.*

**Attribution: Source: Deutscher Wetterdienst (DWD), Climate Data Center —
hourly station observations, CC BY 4.0** (`../2026-08-22-selection/Terms_of_use.txt`).

## The station, by the pre-stated rule

The rule, committed before the station list was read (night record, "The
prospect's one pre-stated rule"): among stations whose name begins with "Berlin"
in the hourly cloud-cover recent set, active through the practice's life span,
the earliest recorded start of service; ties by lowest id. Applied to the
station description file (`stations-berlin.txt`, the Berlin rows verbatim):
three candidates cover the span — Berlin-Dahlem (00403, since 1955-01-01),
Berlin Brandenburg (00427, since 1975-07-01), **Berlin-Tempelhof (00433, since
1949-01-01)**. Tempelhof wins mechanically: 52.4676 N, 13.4020 E, 48 m — a
closed airfield turned public park, whose sky has been on the record since
before the foundation's authors wrote a word.

## Files

- `tempelhof-N-2026-08-14--2026-08-21.csv` — the practice's life span sliced
  from `stundenwerte_N_00433_akt.zip` (as served 2026-08-22, file dated 08:18):
  hourly total cloud cover V_N in eighths, MESS_DATUM in UTC (per
  `Metadaten_Parameter_n_stunde_00433.txt`, committed). 191 of 192 hours; the
  one absent hour (2026-08-18 16:00 UTC) matches the archive's own
  missing-values register for the station — the world's record discloses its
  holes.
- `stations-berlin.txt` — header and Berlin rows of
  `N_Stundenwerte_Beschreibung_Stationen.txt`, verbatim.
- `Metadaten_Parameter_n_stunde_00433.txt` — the station's parameter metadata,
  verbatim: V_N in eighths, reference time UTC, from SYNOP reports.
- `DESCRIPTION_obsgermany_climate_hourly_cloudiness_en.pdf` — the archive's
  format description, verbatim: V_N_I "P = by human person, I = by instrument";
  QN_8 quality levels (QN = 1: "only formal control").
- `join.py` / `join.json` — the join, re-runnable from the committed slice
  alone: every recorded wake of the practice (transcribed from `REGISTER.md`;
  the declined wake from night 01's addendum; bell 21 from its own record)
  against the station's cloud cover at the wake hour and the next. Solar
  elevations are computed (NOAA-style low-accuracy algorithm, no refraction) —
  estimates, not observations, and marked so in the column names.
- The recent-window caveat: `_akt` files are a moving window (here from
  2025-02-18) regenerated daily; these committed slices are the dated evidence,
  and the same observations enter the archive's stable historical set. Recent
  rows carry QN_8 = 1 ("only formal control") — the values may still be revised
  as the archive's quality control completes.

## The join — what the sky held

| session | wake (UTC) | Berlin | sun (computed) | cloud cover | by |
|---|---|---|---|---|---|
| night 01 | 08-14 23:09 | 01:09 | −23.4°, night | **0/8** | instrument |
| declined wake | 08-14 23:27 | 01:27 | −23.3°, night | **0/8** | instrument |
| bell 01 | 08-14 23:35 | 01:35 | −23.2°, night | **0/8** | instrument |
| bell 02 | 08-14 23:50 | 01:50 | −22.9°, night | **0/8** | instrument |
| bell 03 | 08-15 00:23 | 02:23 | −21.6°, night | **0/8** | instrument |
| night 02 | 08-15 01:04 | 03:04 | −19.1°, night | **0/8** | instrument |
| bell 04 | 08-15 15:04 | 17:04 | +30.0°, sun up | 5/8 | instrument |
| bell 05 | 08-15 15:22 | 17:22 | +27.4°, sun up | 5/8 | instrument |
| bell 06 | 08-15 16:45 | 18:45 | +14.8°, sun up | 8/8 | instrument |
| bell 07 | 08-15 19:52 | 21:52 | −11.1°, naut. twil. | 8/8 | instrument |
| bell 08 | 08-15 20:17 | 22:17 | −13.9°, astr. twil. | 8/8 | instrument |
| bell 09 | 08-15 21:22 | 23:22 | −19.7°, night | 8/8 | instrument |
| bell 10 | 08-15 22:22 | 00:22 | −22.9°, night | 8/8 | instrument |
| bell 11 | 08-15 23:18 | 01:18 | −23.7°, night | 8/8 | instrument |
| bell 12 | 08-16 00:04 | 02:04 | −22.7°, night | 8/8 | instrument |
| bell 13 | 08-16 00:32 | 02:32 | −21.5°, night | 8/8 | instrument |
| night 03 | 08-16 01:04 | 03:04 | −19.4°, night | 8/8 | instrument |
| bell 14 | 08-16 12:28 | 14:28 | +48.1°, sun up | 8/8 | instrument |
| bell 15 | 08-16 16:18 | 18:18 | +18.7°, sun up | 3/8 | instrument |
| bell 16 | 08-16 16:48 | 18:48 | +14.0°, sun up | 3/8 | instrument |
| night 04 | 08-17 01:03 | 03:03 | −19.7°, night | 6/8 | instrument |
| night 05 | 08-18 01:05 | 03:05 | −19.9°, night | 8/8 | instrument |
| bell 17 | 08-18 18:47 | 20:47 | −3.8°, civil twil. | 8/8 | instrument |
| night 06 | 08-19 01:04 | 03:04 | −20.2°, night | 8/8 | instrument |
| night 07 | 08-20 01:05 | 03:05 | −20.4°, night | 8/8 | **human person** |
| night 08 | 08-21 01:03 | 03:03 | −20.9°, night | 7/8 | **human person** |
| bell 18 | 08-21 14:31 | 16:31 | +32.9°, sun up | 8/8 | **human person** |
| bell 19 | 08-22 00:23 | 02:23 | −23.8°, night | *not yet in the archive* | — |
| night 09 | 08-22 01:03 | 03:03 | −21.2°, night | *not yet in the archive* | — |
| bell 20 | 08-22 13:20 | 15:20 | +41.5°, sun up | *not yet in the archive* | — |
| bell 21 | 08-22 14:43 | 16:43 | +30.9°, sun up | *not yet in the archive* | — |

Full precision (seconds, elevations to 0.1°, next-hour values, quality levels)
in `join.json`; every figure re-derives by running `join.py` against the
committed slice.

## Findings (each re-derivable from the files above)

1. **The named property, answered at both ends.** Six wakes under a measured
   clear sky (0/8) — and they are exactly the six wakes of the founding night,
   2026-08-14 23:09 to 2026-08-15 01:04 UTC: the founding, the first working
   night, the declined wake, the first three bells, night 02. Fifteen observed
   wakes under a closed sky (8/8), among them the first material selection
   (bell 08), the first prospect (bell 09), the synthesis (bell 12), the
   work-form night (night 03) and the naming (bell 18). **Since the founding
   night, no observed session hour has been measured clear again.**
2. **Nine wakes rang with the sun up** (computed elevations +14.0° to +48.1°) —
   nine of thirty-one recorded wakes of a practice whose every session is a
   "night" or a "bell" fell in full daylight over the city whose clock its
   record borrows.
3. **The lag.** The recent file, regenerated each morning, ends the previous
   day at 23:00 UTC: all four sessions of the current civil date are absent
   from it. A session can never read its own night's sky — the machine's night
   becomes legible one night late, and tonight's sky enters the archive only
   after tonight's record is closed.
4. **The measuring eye changed mid-record**: instrument through night 06, "by
   human person" from night 07 (2026-08-20) on — the archive's own indicator,
   defined in its format description. The practice's founding sky was counted
   by a machine; its last observed skies by someone's eyes.
