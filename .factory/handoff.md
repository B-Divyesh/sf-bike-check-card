# Bike Check Card — repair handoff

- Work order: `bike-check-card-repair-2`
- Completed: 2026-09-06
- Live: <https://bike-check-card.sociobot.in>

## Result

Review 3 finding F-3-1 is fixed. Sharing prerequisites, the six-photo limit, accepted JPG/PNG formats, and the inclusive 10 MB limit each have a registered outcome test covering normal, invalid, boundary, and recovery behavior.

The deployed product behavior is `d5364639a7f32e8d19ffa8cf7abefb98701b1e3e`. The later `c59ee32f7f76dd17ca3c5655ee388420a9ad1b3a` commit changes verification code only; it adds live-base support and correctly classifies the deliberate 404 console message.

The repair report and handoff evidence are recorded at documentation commit `f223629f6c1f36141d1f43b5d00de01883014765`.

Deployment `b436a739-5f9d-473f-b90d-66d0f6b69001` succeeded. The live JavaScript and CSS hashes match the implementation build.

## What changed

- Added four entries to `.factory/claims.json`, bringing the registry to 16 claims.
- Added one browser test per new claim with observable results.
- Narrowed the photo promise to JPG and PNG and enforced those MIME types at runtime.
- Made mixed photo batches atomic so a rejected file cannot leave an unseen partial change.
- Prevented Playwright from reusing a stale local preview server.
- Added an optional `PLAYWRIGHT_BASE_URL` path for cold live checks.
- Kept deliberate HTTP 404 navigation from being misclassified as a console defect.

Full finding evidence is in [repair-2.md](repair-2.md). Earlier review and verification reports remain in `.factory/`.

## Verify locally

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```

Run every `test` command in `.factory/claims.json` independently. To run suitable browser checks against production, set `PLAYWRIGHT_BASE_URL=https://bike-check-card.sociobot.in`.

## Verified results

- Unit: 8/8 passed.
- Registered claims: 16/16 commands passed; 32/32 phone and desktop executions.
- Full browser suite: 38/38 passed.
- Build: passed; `dist/` is the deployable root.
- Production dependency audit: zero vulnerabilities.
- Live `verify-url.sh`: passed on home and demo with zero console errors.
- Live Axe: zero serious or critical findings.
- Live offline, isolation, privacy, route focus, legal pages, links, and expected 404: passed.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- Payload: 34,301-byte JS, 18,675-byte CSS, no font payload, 60,862-byte mobile hero.

## Demo

- URL: <https://bike-check-card.sociobot.in/demo>
- Demo database: `demo:bike-check-card`
- Real database: `bike-check-card`
- Reset replaces only sample data. Start for real returns to the untouched real draft.

## Known gaps

None found within scope. Bike Check Card intentionally records evidence without diagnosing faults, deciding ride safety, ingesting telemetry, or claiming warranty compatibility.
