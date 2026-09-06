# Bike Check Card — verification 3 handoff

- Work order: `bike-check-card-verify-3`
- Completed: 2026-09-06
- Live: <https://bike-check-card.sociobot.in>
- Verdict: **FAIL**
- Findings: 3
- Untested public claims: 4
- Deployed implementation: `d5364639a7f32e8d19ffa8cf7abefb98701b1e3e`
- Documentation reviewed: `e8dd43d982f56c5da43b5cd09f60392f771304d3`

## Result

The deployed implementation matches the clean local build and its main job
works. All 16 declared claim commands passed independently, the full browser
suite passed 38/38, and the four claims added for review finding F-3-1 passed
against production on phone and desktop.

Independent verification found three remaining issues:

1. Four public promises do not have complete registered tagged tests: saved-card
   persistence, photo inclusion in print/PDF, preservation of the original
   photo after marking, and deletion after clearing site data.
2. The repeated wordmark and footer legal links are shorter than the required
   44 px touch height.
3. Malformed backup and shared-link inputs expose raw JSON/parser errors instead
   of plain recovery instructions.

Full evidence and exact remediation are in
[verification-3.md](verification-3.md).

## Verification completed

From a clean clone at `e8dd43d`:

```sh
npm ci
npm test
npm run lint
npm run build
# Each of the 16 commands in .factory/claims.json was run independently.
npm run test:e2e
```

Results:

- Unit tests: 8/8.
- Registered claims: 16/16 commands; 32/32 phone and desktop executions.
- Full browser suite: 38/38.
- Production dependency audit: zero vulnerabilities.
- Build: passed; `dist/` created.
- Live F-3-1 claims: 8/8 phone and desktop executions.
- All live-suitable registered claims except the separately checked fragment
  assertion: 30/30.
- Live Axe: zero serious or critical issues across all routes and the 404 at
  both viewport classes.
- Live Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100
  SEO; LCP 1.1 s, TBT 10 ms, CLS 0.
- Live `verify-url.sh`: passed home and demo with zero console errors.
- Offline reload, service-worker update notice, same-origin privacy flow,
  route focus, legal pages, asset links, security headers, and deliberate 404:
  passed.
- Local/live hashes matched for JS, CSS, service worker, manifest, and offline
  fallback.

Evidence is in `.factory/verification-3.md` and
`/work/.evidence/verification-3/`.

## Required next steps

- Register and add tagged outcome tests for the four public promises, or narrow
  the copy.
- Increase the repeated wordmark and footer-link hit areas to at least 44 × 44
  CSS pixels.
- Replace raw parse errors with plain, actionable backup/link messages and test
  those invalid and recovery paths.
- Redeploy the repaired implementation, then rerun every declared claim and
  fresh live verification.

No product code was modified during verification.
