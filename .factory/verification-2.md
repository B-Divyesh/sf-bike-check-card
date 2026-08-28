# Bike Check Card — independent verification 2

**VERDICT: PASS**

Verified on 2026-08-28 from a clean checkout at
`60a17a65f2cb4970df223b0928fc502666d5a17c` against
<https://bike-check-card.sociobot.in>. This supersedes the cache/header
deployment failure in `verification.md`: fresh live response and byte evidence
show the repair is deployed with the candidate.

## Quality gates

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 61 packages installed, 0 vulnerabilities. |
| `npm test` | Passed: 7/7 Vitest assertions. |
| `npm run typecheck` and `npm run lint` | Passed (`tsc --noEmit`). |
| `npm run build` | Passed; production `dist/` created. |
| `npm run test:e2e` | Passed: 10/10 on desktop Chromium and Pixel 5. |
| `npm audit --omit=dev` | 0 vulnerabilities. |

SHA-256 matched local `dist/` to production for `index.html`, direct privacy
and terms entry documents, `sw.js`, manifest, offline fallback, both bundles,
and both hero WebP assets. Example: local and live
`/assets/index-DBGM03TC.js` both hash to
`1dcdbc152bf59f4fdbee37845c61a68da40a5198dbbf612a50184f75e4358455`.

## Product and recovery exercise

- Created a complete component-aware card with a bike, sensor/GPS discrepancy,
  mileage, pressure, timeline, ride context, and next step. Completion reached
  4/4 and data survived reload in IndexedDB.
- Added a local evidence photo. A private share URL used `#card=`, contained no
  image data, stated that the local photo was omitted, and rendered the
  no-safety-verdict boundary. Print/PDF capture produced 52,685 B.
- Exported JSON, confirmed a replacement blank card, then imported the backup
  after confirmation and restored its bike value.
- Invalid/recovery feedback was correct: incomplete share listed all four
  essentials; a text file was rejected as non-image; seven files triggered the
  six-photo limit; and malformed JSON surfaced a parse error.

## PWA, accessibility, and privacy

- A live 390 x 844 session had a controlling service worker. Offline reload
  retained the draft and allowed further editing. A controlled local serving
  of the built artifact changed only a temporary worker byte variant:
  `registration.update()` observed `updatefound`, an installed waiting worker,
  and the toast “A new field sheet is ready. Update.”
- Axe had zero serious/critical findings on home, editor, privacy, and terms.
  Each checked route had one `h1` and a `main`; home had `lang=en`, a title,
  and no images without `alt`.
- Keyboard Tab reached the skip link first; it had a 3 px solid outline and
  yellow ring, and Enter focused `#main`. At 390 px horizontal overflow was
  0. Reduced motion set transitions to `0.01ms` and scrolling to `auto`.
- Normal-flow live requests were same-origin only; there were no page or
  console errors, trackers, analytics, runtime CDN fonts, or third-party
  assets. Source review found only the optional user-initiated Sociobot license
  endpoint allowed by CSP. Drafts/photos are local in IndexedDB; share
  fragments omit photos and are not sent in HTTP requests.

## Deployment, caching, and budgets

Fresh live responses confirm the prior release blocker is fixed:

| Resource | Result |
| --- | --- |
| HTML, `sw.js`, manifest, offline fallback | `Cache-Control: public, max-age=0, must-revalidate` |
| Hashed JS/CSS and both WebP assets | `Cache-Control: public, max-age=31536000, immutable` |
| Manifest | `application/manifest+json; charset=utf-8` |
| Browser policies | CSP with `frame-ancestors 'none'`, DENY framing, Permissions-Policy, nosniff, strict referrer policy, and one-year preload HSTS |

Initial JS is 33,868 B (11,550 B gzip), CSS 17,495 B (4,580 B gzip), no font
payload ships, and the mobile hero is 60,862 B. Lighthouse 13.4.1 mobile on
the live URL: Performance 99, Accessibility 100, Best Practices 100, SEO 100;
FCP 1.0 s, LCP 2.2 s, interactive 2.2 s, TBT 0 ms, CLS 0.

## Defects

None found: no release-blocking, high, medium, or low defects.

Intentional constraints remain: evidence capture is not a safety diagnosis or
warranty decision; browser print supplies PDF; photos remain outside private
text links; the factory must register the optional Sociobot checkout before
payments can complete.
