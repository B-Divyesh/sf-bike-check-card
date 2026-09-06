# Bike Check Card — repair 2

- Work order: `bike-check-card-repair-2`
- Completed: 2026-09-06
- Base: `777ec51217a33df9c7e3492eeacf658fbe337089`
- Deployed implementation: `d5364639a7f32e8d19ffa8cf7abefb98701b1e3e`
- Documentation evidence: `f223629f6c1f36141d1f43b5d00de01883014765`
- Live deployment: `b436a739-5f9d-473f-b90d-66d0f6b69001`

## Result

Review 3 finding F-3-1 is fixed. The four public promises now have one registered claim and one observable browser test each. The complete registry has 16 unique ids and exactly one matching `@claim:` test per id.

| Promise | Repair and outcome evidence |
| --- | --- |
| Share prerequisite | A blank card cannot share. Bike, component, and symptom alone still cannot share. Adding one measurement reaches 4 / 4, copies a fragment link, and the link opens the record. |
| Six-photo limit | The sample reaches exactly six photos. A seventh is rejected without changing the count. Removing one and adding a replacement succeeds. |
| Accepted formats | The picker and runtime now accept only JPG and PNG. Real fixtures decode. WebP and text are rejected, mixed batches are atomic, and a later valid photo succeeds. |
| 10 MB limit | A JPG of exactly 10 MiB is accepted. The same fixture at 10 MiB plus one byte is rejected. A normal photo succeeds afterward. |

The old “HEIC where supported” wording was narrowed to the formats the app can prove. Runtime MIME validation now matches the picker. The Playwright server no longer reuses an unknown process on port 4173, preventing claims from silently exercising a stale build.

## Clean local verification

- `npm ci` — passed; 61 packages installed, zero vulnerabilities.
- `npm test` — passed; 8/8.
- `npm run lint` — passed.
- `npm run build` — passed; `dist/` created.
- All 16 commands in `.factory/claims.json` — passed independently in phone and desktop projects, 32/32 executions.
- `npm run test:e2e` — passed; 38/38 after the final test-harness change.
- `npm audit --omit=dev` — zero vulnerabilities.
- Final initial bundle: 34,301-byte JavaScript / 11.37 KB gzip and 18,675-byte CSS / 4.77 KB gzip.

## Cold live verification

- Local and live SHA-256 match for `index-BxrlItAw.js` and `index-DCH8cAQq.css`.
- Fresh 390 × 844 phone and 1440 × 900 desktop contexts show the job, cyclist audience, sample action, outcome text, and three facts before scrolling.
- The one-click sample is populated, keeps its demo label, resets, and leaves a temporary real draft unchanged.
- The four repaired claims passed against the live origin in both Playwright projects.
- Live offline reload retained the sample and accepted an edit.
- Live requests stayed on `bike-check-card.sociobot.in`.
- Axe found no serious or critical issue on all product routes in phone or desktop checks. Keyboard focus and reduced motion passed.
- `verify-url.sh` passed `/` and `/demo` with zero console errors.
- Public routes return 200. The designed missing route returns the expected HTTP 404 with a home action.
- Route titles and h1 focus passed on Demo, Back, Privacy, Terms, and the 404 page.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.1 s, TBT 0 ms, CLS 0.
- Live HTML revalidates, hashed assets use one-year immutable caching, and the manifest has the correct media type.

Evidence is under `/work/.evidence/repair-2-live-*` and `/work/.evidence/lighthouse-repair-2.json`.

## Earlier findings

Review 1 F-1-1 through F-1-10 remain fixed. The earlier immutable-cache, manifest MIME, and security-header findings remain fixed. Review 3 F-3-1 is now fixed by the four claim rows above.

## Billing and scope

The base product has no advertised paid offer or checkout. This repair did not add, remove, or alter a paid deliverable, so no billing-offer evidence is required. The product remains an evidence recorder, not a diagnosis or safety decision tool.

## Remaining gaps

None found within the researched product scope.
