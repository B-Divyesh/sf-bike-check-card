# Bike Check Card — reviewer handoff

Work order: `bike-check-card-review-1`
Completed: 2026-08-28
Role: reviewer

## Result

Wrote and committed `.factory/review-1.md`. The review verdict is **FAIL**.
No product source, assets, configuration, or tests were modified.

Release-blocking findings are: an unclear first screen, no isolated one-click
sample-data demo, no claims registry or tagged claim tests, a broken `/demo`
route and non-404 error handling, and a visible supporter checkout URL that
returns HTTP 404.

## How verified

- Used fresh live Chromium contexts at 390 × 844 and 1440 × 900.
- Exercised `/?demo=1`, `/demo`, `/privacy`, `/terms`, a missing route, the
  blank-card start action, and in-app routing/focus behavior.
- Recorded same-origin normal-load requests; demo isolation could not be
  verified because demo mode is absent.
- Checked all earlier verification findings against live headers/configuration.
- Ran `npm ci`, `npm test` (7 passed), `npm run build` (passed, produces
  `dist/`), and `npm run test:e2e` (10 passed).
- Read the brief, design thesis, README, current handoff, and both prior
  verification reports. There were no earlier review/polish reports.

## Remaining work

Implement every finding in `.factory/review-1.md`, beginning with the demo and
claims contract. Re-run the full cold review rather than treating this as a
diff-only check.
