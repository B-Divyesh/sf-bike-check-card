# Bike Check Card — repair handoff

Work order: `bike-check-card-polish-1`

Completed: 2026-08-28

Verified implementation: `efa09a720ec1cc777f54c8a788573bac464fc1d9`
Live: <https://bike-check-card.sociobot.in>

## Result

All F-1-1 through F-1-10 findings are fixed and independently rechecked on the live site. The exact finding-to-evidence map is in [`.factory/polish-1.md`](polish-1.md).

The product remains a static offline PWA with its cassette-workshop-zine design. The repair adds a real isolated demo, claim registry, direct routes, real 404 response, complete metadata, route focus handling, plain first-screen copy, mobile navigation, and updated legal pages.

The broken paid offer was removed because its checkout was not registered. No purchase or license prompt remains. All card, history, export, print, privacy, and accessibility features are free.

## Demo

- Direct URL: <https://bike-check-card.sociobot.in/demo>
- Query URL: <https://bike-check-card.sociobot.in/?demo=1>
- Demo database: `demo:bike-check-card`
- Real database: `bike-check-card`
- Sample: completed steel commuter sensor/GPS mismatch with measurements, context, timeline, notes, and marked photo.
- Reset demo replaces only demo data. Start for real opens the untouched real draft.

## Verification

From a clean clone at `efa09a7`:

- `npm ci` — passed; 61 packages; zero vulnerabilities.
- `npm test` — passed; 8/8 unit assertions.
- `npm run build` — passed; `dist/` contains root, demo, card, cards, privacy, terms, and 404 documents.
- Every command in `.factory/claims.json` — passed; 12 claims × 2 browser projects = 24/24.
- `npm run test:e2e` — passed; 30/30 mobile and desktop checks.
- `npm audit --omit=dev` — zero vulnerabilities.

Live checks after deployment `6f38cf0a-3d77-4100-a2d9-bec1204df083`:

- `verify-url.sh` passed for `/` and `/demo`; zero console errors.
- Cold live demo isolation/reset/start-real check passed.
- Live offline reload of `/demo` passed and remained editable.
- Whole representative flow made zero cross-origin requests.
- Axe reported zero serious or critical issues on the checked routes.
- Internal link crawl returned 200 for `/`, `/demo`, `/card`, `/cards`, `/privacy`, and `/terms`.
- Unknown route returned HTTP 404 with the designed not-found screen.
- Live Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- Metrics: FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- Initial payload: 34,234-byte JS, 18,675-byte CSS, no font payload, 60,862-byte mobile hero.

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Run one registered claim with its `.factory/claims.json` command. Example:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
```

## Known gaps and next steps

None. The product intentionally records evidence and does not diagnose safety, ingest telemetry, or decide warranty eligibility.

## Review 2 handoff

Work order: `bike-check-card-review-2`
Completed: 2026-08-29
Result: **PASS** with zero findings. No product code was changed. See
[review-2.md](review-2.md) for the complete adversarial review.

This reviewer used fresh live Chromium contexts at 390 × 844 and 1440 × 900;
checked the one-click demo, reset, start-for-real, isolated storage, offline
reload, and live request log; and verified every declared claim from a clean
clone at `/tmp/bike-check-card-review-wlgCUz`. `npm ci`, `npm test`, and
`npm run build` passed. Every claims command passed in both Playwright projects
and the full suite passed 30/30. Route metadata, focus/back behavior,
header/footer, sitemap, link crawl, HTTP 404, and all F-1 findings were
rechecked live and in source.

Known gaps: none. Future features should keep the isolated demo namespace and
add a registered observable claim test for each new visitor-reliance statement.
