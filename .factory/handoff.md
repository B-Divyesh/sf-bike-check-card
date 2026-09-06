# Bike Check Card — verification 4 handoff

- Work order: `bike-check-card-verify-4`
- Independently verified: 2026-09-06
- Live: <https://bike-check-card.sociobot.in>
- Result: **PASS — 0 findings and 0 untested claims**
- Deployed implementation: `6dafa460185582dff7e7d6e044e50fffd057e2bc`
- Post-deploy test revision: `d9a35c910ad6cf4741aac06efcf85650ab58db83`
- Documentation baseline reviewed: `893ecb827756fe33d1b6435e617a716bc86f0468`
- Deployment: `5f048cda-19ab-4324-81bb-914297866fb6`

Independent verification 4 used fresh phone and desktop browser contexts and a
clean clone. It found no product defect. All 20 registered claims passed as
independent commands (40 browser executions), and the full local and HTTPS
suites each passed 50/50. Fresh Lighthouse mobile scores were 99 Performance,
100 Accessibility, 100 Best Practices, and 100 SEO. The detailed evidence is
in [verification-4.md](verification-4.md).

No product code changed during verification 4.

## Repair reviewed

| Verification finding | Repair | Outcome evidence |
| --- | --- | --- |
| V3-1: saved cards lacked reload coverage | Added the `saved-card-reload` claim. | Saves a named real card, reloads Saved cards, and finds that card. |
| V3-1: print/PDF photo coverage was incomplete | Added the `print-photos` claim. | The completed sample photo remains visible under browser print media. |
| V3-1: marked originals lacked a comparison | Added the `original-photo-unchanged` claim. | Compares IndexedDB photo data before and after marking; the original is byte-for-byte unchanged and the marked copy is separate. |
| V3-1: site-data clearing lacked coverage | Added the `site-data-clear` claim. | Browser site-data protocol clears the origin IndexedDB; saved card and draft are absent after reload. |
| V3-2: repeated touch targets were undersized | Made the wordmark and footer Privacy/Terms links at least 44 × 44 CSS px. | Phone and desktop browser check measures all three targets. |
| V3-3: damaged inputs exposed parser details | Replaced raw backup and shared-link errors with plain recovery messages. | Invalid backup and invalid fragment tests assert the messages, no parser text, and a successful recovery path. |

The post-deploy revision only makes browser assertions origin-aware so the same
suite can run against HTTPS; it changes no product runtime. The deployed
artifact is the implementation SHA above.

## Verification 4 clean checks

From the documented clean setup:

```sh
npm ci
npm test
npm run lint
npm run build
# Run every command in .factory/claims.json independently.
npm run test:e2e
```

- `npm ci`: passed; 61 packages installed and audit reported zero vulnerabilities.
- Unit tests: 8/8 passed.
- Type/lint check: passed.
- Build: passed; `dist/` contains the static site root.
- Registered claims: 20/20 commands passed independently, each in phone and desktop projects (40/40 executions).
- Full local browser suite: 50/50 passed.
- Browser Axe integration found zero serious or critical issues across home, demo, editor, saved cards, legal routes, and the designed 404 in both viewports.
- `/opt/fleet/lib/verify-url.sh` passed live home and demo with one h1, one main landmark, `lang=en`, complete image alternatives, labeled buttons, and no console errors.

## Verification 4 live checks

- `PLAYWRIGHT_BASE_URL=https://bike-check-card.sociobot.in npm run test:e2e`: 50/50 passed in fresh phone and desktop contexts.
- Fresh first screen states the job (“Record bike-fault evidence”), audience (cyclists preparing to ask for help), and first action (“Try it with sample data”) before scrolling.
- The one-click sample is complete, keeps its demo label after editing, resets to shipped data, and does not alter a real draft.
- Live `verify-url.sh` passed `/` and `/demo` with no console errors.
- Public routes return 200; the designed missing route returns the expected HTTP 404.
- Local and live JS/CSS SHA-256 match. HTML revalidates, hashed assets are one-year immutable, the manifest has the right media type, and CSP/HSTS/referrer/nosniff/frame/permissions headers are live.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.1 s, TBT 10 ms, CLS 0.

Evidence is under `/work/.evidence/verification-4/`. The catalog description remains copied to `/work/.evidence/catalog-description.txt`.

## Earlier history

- Review 1 findings F-1-1 through F-1-10 remain fixed: first-screen clarity, isolated demo, routes, metadata, focus, shared navigation, plain copy, real 404, and sitemap.
- Earlier cache, manifest MIME, and security-header findings remain fixed and were rechecked on HTTPS.
- Review 3 F-3-1 remains fixed; its four earlier boundary claims still pass.
- Verification 3 V3-1, V3-2, and V3-3 are fixed by this repair.

## Scope and remaining gaps

The free, local-first core remains intact. There is no advertised paid offer or
checkout, so no billing registration file is needed. The product records
evidence; it does not diagnose faults or decide whether a bike is safe.

No known gaps remain within the researched scope. Clearing browser site data is
intentionally destructive to local records; the app tells riders to export a
backup first.
