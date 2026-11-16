# Advanced Squad STX Scorecard

Live grading console for the advanced squad situational training exercise — D Co, 2-506 IN (White Currahee).
Modeled on the Squad LFX Scorecard: same server, same console, same look.

External evaluators grade the squad leader's TLP/OPORD and each tactical lane on their phones.
Scores save to the server instantly and the squad rankings update live for everyone.

## What is graded

| Sheet | Source | Scale |
|---|---|---|
| TLP | Squad Leader OPORD evaluation sheet (24 measures, 8 critical) | GO / NO-GO, T/P/U |
| Lane 1 — Recon | 171-123-1301 steps 1.f, 3.a, 3.c, 3.d, 3.e(10), 8, 9; 34-CO-0010 step 3.a–g (SALUTE) | GO / NO-GO |
| Lane 2 — Attack | T&EO 07-SQD-1092 steps 1, 2, 2.b(2), 2.b(3), 2.b(9), 2.b(10), 6.c, 6.d, 6.d(2), 6.d(4), 6.d(5), 6.e(4), 6.e(5), 6.e(6), 6.e(7), 6.e(10), 8 | GO / NO-GO, T/P/U |
| Lane 3 — Ambush | T&EO 07-SQD-9010 steps 2.b(1)(a-b), 2.b(2)(b-e), 2.b(4), 2.b(7)(b)1-4, 2.b(7)(d-g), 2.b(7)(i-j), 5.g(8)(a-c), 5.g(9), 5.g(12), 5.h, 6.a, 6.b, 6.e, 7.e, 7.f(1), 7.f(3), 7.g(1-2), 7.g(4), 9.a(2)(a), 9.b(5-7), 10 | GO / NO-GO, T/P/U |

Every measure on every sheet is GO or NO-GO. A sheet's score is the percentage of its measures rated GO.

**Total (out of 100):** TLP 20%; the lanes split the other 80% equally (or by each lane's `weight`).
Sheets not yet graded count as zero.

## Changing rubrics, lanes, squads or weights

Everything lives in `public/rubrics.js` — the format is documented at the top of that file.
The server reads the same file, so a new lane needs no server change. Redeploy after editing.

**Objective metric.** Any lane can carry one objective number (time, casualties, etc.):

```js
metric: {label: "Time to complete", unit: "min", better: "low"}   // or better: "high"
```

The squad's value is scored against the best value saved for that lane (best = 100) and blended
with the rubric percentage at `METRIC_BLEND` (default 50/50). No value entered → rubric only.
No lane has a metric switched on yet.

## Deploy on Railway

1. On [railway.app](https://railway.app): **New Project → Deploy from GitHub repo** → pick this repo.
   Railway detects Node.js automatically and runs `npm start`. No configuration needed.
2. **Add a volume** (so scores survive redeploys): open the service → **Settings → Volumes →
   Add Volume** → mount path `/data`.
3. **Settings → Networking → Generate Domain** to get the public URL. Share that URL with
   the evaluators and squad leaders.

The console has no login: anyone with the URL can view and save scores.

## Local run

```bash
npm start
```

Then open http://localhost:3000. Without a `/data` volume scores are stored in `./data/state.json`.

## API

- `GET /api/state` — full score state (JSON)
- `POST /api/section` — save one grade sheet: `{squad: "1"-"7", section: "tlp"|"recon"|"attack"|"ambush", data: {...}}`.
  `data: null` clears that sheet (use it to wipe practice runs).
