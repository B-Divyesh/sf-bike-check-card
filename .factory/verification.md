# Bike Check Card — independent verification

**VERDICT: FAIL (deployment release gate)**

Verified on 2026-08-27 against candidate commit
`6a31bffecd9818a4aff89b98ded12e5776e76b87` and
<https://bike-check-card.sociobot.in>. The product implementation is functional
and the live application is the candidate build, but the deployed cache policy
does not meet the required PWA/static-asset policy. This is a deployment-only
failure, not a code/artifact mismatch.

## Candidate and deployment identity

Built locally from a clean `npm ci` checkout at the commit above. SHA-256 matched
between `dist/` and production for `index.html`, the hashed JavaScript and CSS,
`sw.js`, `manifest.webmanifest`, `offline.html`, `/privacy`, and `/terms`.
Production returned HTTP 200 for each route and asset checked. The live browser
session (390 x 844) activated the service worker with scope
`https://bike-check-card.sociobot.in/`, completed the representative check-card
flow, and emitted no console or page errors.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 60 packages audited, 0 vulnerabilities. |
| `npm test` | Passed: 5/5 Vitest assertions. |
| `npm run build` | Passed (`tsc --noEmit` plus Vite); `dist/` created. No separate lint script is defined. |
| `npm run test:e2e` | Passed: 8/8 Playwright checks on desktop Chromium and Pixel 5. |
| Lighthouse 13, local production preview, mobile | Passed: Performance 93, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.4 s, TBT 230 ms, CLS 0. |
| Initial production assets | JS 33,582 B (11,490 B gzip), CSS 17,495 B (4,690 B gzip); no font payload; mobile hero 60,862 B. All budgets pass. |

## Independent product exercise

- Created a normal card with bike, Sensor / computer component, exact
  sensor-vs-GPS symptom, mileage, pressure, wheel/GPS readings, and timeline;
  completion reached 4/4 and survived refresh via IndexedDB.
- Copied a share link and opened it. It contained a URL fragment, rendered the
  evidence and no-safety-verdict notice, and contained no image data. A PDF was
  produced from the print stylesheet (40,317 B in the test run). JSON backup
  downloaded and restored the original draft after a changed draft was replaced.
- Added and annotated a local photo; the annotation dialog opens with focus on
  its close control. Save, history snapshot, history deletion confirmation, and
  free-history limit were exercised.
- Invalid/recovery checks passed: incomplete share shows the four required
  evidence fields; a non-image upload reports `hosts is not an image.`; seven
  photos reports the six-photo limit; invalid JSON reports a readable parse
  error; a valid backup restores after explicit confirmation.
- At 390 px, home and editor horizontal overflow were 0 px. Desktop and mobile
  suites passed. Keyboard testing found the skip link first in tab order with a
  visible solid focus outline; native dialog focus remained in the photo marker.
- Axe serious/critical findings were zero on `/`, editor, privacy, terms,
  history, and supporter pages. Each had one `h1` and one `main`. With reduced
  motion, control transition duration was `0.01ms` and document scrolling was
  `auto`.
- After first load and service-worker control, offline reload retained the
  draft and allowed edits. A controlled service-worker update simulation changed
  the worker response, called `registration.update()`, and observed the in-app
  `A new field sheet is ready. Update` toast.

## Privacy and browser-policy checks

- The live representative flow made requests only to
  `bike-check-card.sociobot.in`; no analytics, CDN font, tracker, or other
  third-party request was observed. Source/artifact review found only the
  optional Sociobot checkout/license verification endpoints, used when the user
  starts that optional license flow.
- The app stores drafts/photos locally in IndexedDB. Share links omit photos and
  place text only after `#`, so the fragment is not sent in the HTTP request.
- The live response has HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
  and `X-Content-Type-Options: nosniff`. It does not send CSP, frame-ancestors/
  `X-Frame-Options`, or `Permissions-Policy` headers.

## Defects

### Medium — hashed static files are not cached immutably (release blocker)

**Evidence:** On the live deployment, `/assets/index-UomB33hX.js`,
`/assets/index-kiKF1L1N.css`, and `/assets/hero-zine-720.webp` each return
`Cache-Control: public, must-revalidate, max-age=30`. The service worker also
returns that policy. These filenames are content-hashed and the acceptance
contract requires long-lived immutable caching for hashed PWA assets.

**Impact:** Browsers must revalidate the application shell after 30 seconds,
contrary to the offline/PWA performance and caching contract. This is a hosting
configuration issue; the deployed bytes do match the candidate.

**Required release action:** Configure immutable, long-lived caching for hashed
`/assets/*` (for example, `public, max-age=31536000, immutable`); retain a short
or revalidated policy for `index.html` and `sw.js` so updates remain discoverable.

### Low — manifest is served with the wrong media type

**Evidence:** `GET /manifest.webmanifest` returns
`Content-Type: application/octet-stream`, not `application/manifest+json`.

**Impact:** Chromium accepted the manifest/service worker in this audit, but
the response is not the normal manifest media type and can impair installation
or tooling on other user agents.

**Required release action:** Configure `.webmanifest` as
`application/manifest+json; charset=utf-8`.

### Low — security response policies are incomplete

**Evidence:** Production sends HSTS, Referrer-Policy, and nosniff, but no CSP,
clickjacking protection, or Permissions-Policy. HSTS is only `max-age=10886400`
(126 days) despite including `preload`, which does not satisfy preload criteria.

**Impact:** Not a functional fault in this local-first static app, but it leaves
an avoidable browser-policy gap.

**Required release action:** Add a restrictive CSP suitable for this app,
`frame-ancestors 'none'` (or `X-Frame-Options: DENY`), a restrictive
Permissions-Policy, and raise HSTS to at least one year if preload is intended.

## What is not blocking

The product meets the researched job: it captures component-aware fault evidence
locally, makes the no-safety-advice boundary explicit, keeps photos local until
an explicit export, supports text sharing/PDF/JSON, and operates offline after
first load. No product-code defect, console/page error, serious/critical axe
finding, bundle-budget failure, or candidate/live byte mismatch was found.
