# Advanced Squad STX Scorecard

Live grading console for the advanced squad situational training exercise — D Co, 2-506 IN (White Currahee).
Modeled on the Squad LFX Scorecard: same server, same console, same look.

External evaluators grade the squad leader's TLP/OPORD and each tactical task on their phones.
Scores save to the server instantly and the squad rankings update live for everyone.

## What is graded

Evaluators work from three grading tabs. Each task is scored, saved, ranked and reported on its own;
the tabs only group the sheets, and one Save sends every sheet on the tab that was changed.

| Tab | Task | Source | Measures | Timed |
|---|---|---|---|---|
| DOG1 Grader | Conduct a Zone Reconnaissance | 171-123-1301 steps 1.f, 3.a, 3.c, 3.d, 3.e(10), 8, 9 | 7 | yes |
| DOG1 Grader | Conduct a Linkup | T&EO 07-PLT-1063 steps 2.b(1)(a), 2.b(2), 2.b(3), 2.b(4)(b-k), 2.b(8), applied at squad level | 14 | no |
| DOG1 Grader | TLP | Squad Leader OPORD evaluation sheet | 24 (8 critical) | no |
| DOG3 Grader | Conduct an Attack | T&EO 07-SQD-1092 steps 1, 2, 2.b(2), 2.b(3), 2.b(9), 2.b(10), 6.c, 6.d, 6.d(2), 6.d(4), 6.d(5), 6.e(4), 6.e(5), 6.e(6), 6.e(7), 6.e(10), 8 | 17 | yes |
| DOG3 Grader | Conduct an Ambush | T&EO 07-SQD-9010 steps 2.b(1)(a-b), 2.b(2)(b-e), 2.b(4), 2.b(7)(b)1-4, 2.b(7)(d-g), 2.b(7)(i-j), 5.g(8)(a-c), 5.g(9), 5.g(12), 5.h, 6.a, 6.b, 6.e, 7.e, 7.f(1), 7.f(3), 7.g(1-2), 7.g(4), 9.a(2)(a), 9.b(5-7), 10 | 37 | yes |
| DOG CMD Grader | Report Tactical Information | T&EO 34-CO-0010 step 3.a–g (SALUTE) | 7 | no |

Every measure is GO or NO-GO. A task's GO % is the share of its measures rated GO.
TLP and the T&EO tasks also show a T/P/U rating.

## Scoring — lowest score wins

```
Score = total time × (1 + NO-GO share)
```

- **Total time** is the minutes on recon, attack and ambush added together. A timed sheet cannot be
  saved without its time.
- **NO-GO share** is `1 − weighted GO %`. GO % is weighted TLP 20%, the other five tasks 16% each
  (or by each task's `weight`).
- A squad that is all GO keeps its raw time; every NO-GO inflates it, up to double.
  Example: 160 minutes at 92.1% GO scores 160 × 1.079 = 172.7.
- A squad is ranked once all three times are saved. Sheets not yet saved count as NO-GO; a score
  marked `*` is still missing a sheet.

## Changing rubrics, tasks, tabs, squads or weights

Everything lives in `public/rubrics.js` — the format is documented at the top of that file.
`TASKS` defines what is graded; `GRADE_TABS` says which tab each task sits on.
The server reads the same file, so a new task needs no server change. Redeploy after editing.

**Timed tasks.** A task is timed when it carries `metric: {label: "Total time on the lane", unit: "min"}`.
Set `metric: null` to make a task untimed; its time then drops out of the total.

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
- `POST /api/section` — save one grade sheet: `{squad: "1"-"7", section: "tlp"|"linkup"|"recon"|"attack"|"ambush"|"report", data: {...}}`.
  `data: null` clears that sheet (use it to wipe practice runs).
