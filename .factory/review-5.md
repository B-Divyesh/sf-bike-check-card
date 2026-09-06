# Record bike-fault evidence — strict review 5

**VERDICT: PASS — 0 findings and 0 untested claims.**

Reviewed on 2026-09-06 against <https://bike-check-card.sociobot.in>.
Product code was not changed.

- Implementation candidate reviewed: `77b3088fe79a5aa0abf5dc3f114842529c1c2e8a`
- Documentation baseline reviewed: `a5fbb60f90b249d7e54bb7cd175193fe1b206c55`
- Recorded deployment: `c6771a7b-83bc-45d7-b39d-9e03cc4b0b9d`

Commits after the implementation candidate contain reports only. A clean build
at the documentation baseline produced the same JavaScript, CSS, service
worker, manifest, and offline-page bytes as the live site.

## First screen

Fresh 390 × 844 phone and 1440 × 900 desktop contexts showed these items
before scrolling:

- Job: **Record bike-fault evidence**.
- Audience: cyclists making a clear record before asking a mechanic or cycling
  community for help.
- First action: **Try it with sample data**.
- Result of that action: **See a completed check card first**.
- Facts: **No account**, **Saved on this device**, and **Free to use**.

The job, audience, action, result, and facts were all inside each initial
viewport. There was no horizontal overflow.

Evidence: `/work/.evidence/review-5/phone-home.png` and
`/work/.evidence/review-5/desktop-home.png`.

## Sample and data isolation

The first action opened `/demo` in one click. The sample contains a steel
commuter, sensor/computer component, precise symptom, mileage, tyre pressure,
wheel and GPS readings, timeline, ride context, conditions, notes, rider next
step, and one marked photo. It reports all four sharing essentials as complete.

The persistent **Demo — sample data, nothing is saved** label, **Reset demo**,
and **Start for real** controls were present in both contexts. Reset restored
the original sample after an edit. A separate disposable context created a
real draft, edited and reset the demo, then returned to the unchanged real
draft. The context contained distinct `bike-check-card` and
`demo:bike-check-card` databases and was destroyed after the check. No visitor
or existing browser data was read or changed.

Evidence: `/work/.evidence/review-5/phone-demo.png` and
`/work/.evidence/review-5/desktop-demo.png`.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages installed; zero vulnerabilities. |
| `npm test` | Pass — 8/8. |
| `npm run lint` | Pass. |
| `npm run build` | Pass — `dist/index.html` created. |
| `npm audit --omit=dev` | Pass — zero vulnerabilities. |
| Every command in `.factory/claims.json` | Pass — 20/20 commands and 40/40 browser executions. |
| `npm run test:e2e` | Pass — 50/50 against the clean local build. |
| Live browser suite | Pass — 50/50 against the HTTPS origin. |

The registry contains 20 unique IDs and exactly 20 matching test tags. Each
claim has one tag, and there are no extra tags. Public product and README
statements were cross-checked with the registry. **Untested public claims: 0.**

## Declared claims

| Claim group | Observable result |
| --- | --- |
| `core-capture`, `demo-isolation`, `no-account`, `local-save` | Complete evidence capture, isolated sample, account-free use, and draft reload passed. |
| `saved-card-reload`, `offline-reload`, `photo-local`, `original-photo-unchanged` | Saved records persist, the sample reloads offline, photos remain local, and marking preserves the stored original. |
| `share-prerequisites`, `six-photo-limit`, `photo-formats`, `photo-size-limit` | The exact sharing minimum, six-photo boundary, JPG/PNG rule, and inclusive 10 MB limit passed with recovery. |
| `fragment-share`, `json-backup`, `print-photos`, `site-data-clear` | Fragment sharing excludes photos, backup restores the complete card, print retains photos, and site-data clearing removes records. |
| `same-origin`, `safety-boundary`, `free-use`, `print-card` | Requests stay same-origin, no diagnosis or safety verdict appears, no payment is required, and print is invoked. |

All 20 commands were run independently from the declared strings, not inferred
from the full-suite result.

## Normal, invalid, boundary, and recovery paths

- A complete card can be edited, saved, reloaded, shared, printed, backed up,
  reset, and restored.
- Sharing below the required four parts is blocked with a useful message. The
  exact minimum succeeds.
- Six photos succeed and a seventh fails. Removing one permits a replacement.
- Valid JPG and PNG files succeed. Unsupported files fail without partial
  mutation, and a later valid file succeeds.
- Exactly 10 MB succeeds. One byte more fails, and a later normal photo works.
- A damaged backup says to choose an exported Bike Check Card JSON file. A
  valid backup works afterward.
- A damaged shared link says to ask the sender for a new link. It exposes no
  parser text and its home action works.
- Empty saved cards, persisted saved cards, and browser site-data removal pass.

## Accessibility, privacy, offline use, and routes

- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: correct title,
  `lang=en`, one `h1`, one `main`, image alternatives, named buttons, and no
  console errors. Evidence is under
  `/work/.evidence/review-5/verify-home/` and `verify-demo/`.
- The live Playwright Axe checks found no serious or critical violations on
  home, demo, editor, saved cards, privacy, terms, or the missing page in phone
  and desktop projects.
- Keyboard skip navigation, route and history focus, dialog focus and Escape,
  mobile overflow, visible focus, and reduced motion passed.
- The wordmark, footer Privacy link, and footer Terms link meet the 44 × 44 px
  touch-target minimum.
- `/`, `/demo`, `/card`, `/cards`, `/privacy`, and `/terms` return 200 with
  route titles. `/missing-review-5` deliberately returns HTTP 404 and renders
  **Page not found** with a return-home action. This expected status is not a
  defect.
- The service worker supports editable offline reload after the first visit.
  The manifest has standalone display, versioned start URL, required icons,
  maskable support, and product palette colours.
- The full demo flow made only same-origin requests. No analytics, remote
  fonts, advertising, or tracking scripts loaded.
- HTML, service worker, and manifest revalidate. Hashed assets use one-year
  immutable caching. The manifest media type, CSP, framing denial, permissions
  policy, referrer policy, nosniff, and one-year HSTS are present.

## Candidate identity and performance

The clean build and live site use `index-DGjtvurA.js` and
`index-CcBWBdLs.css`. SHA-256 values match for those files, `sw.js`,
`manifest.webmanifest`, and `offline.html`.

Initial JavaScript is 34,320 bytes raw / 11.38 KB gzip. CSS is 18,813 bytes raw
and 4.80 KB gzip. The phone hero is 60,862 bytes, and no font payload ships.

Fresh Lighthouse 13 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 2.0 s |
| TBT | 0 ms |
| CLS | 0 |

Evidence: `/work/.evidence/review-5/lighthouse-live.json`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1 F-1-1 through F-1-10 | Fixed and rechecked: cold-read clarity, isolated sample, claims, routes and 404, removed dead payment action, metadata, focus, shared shell, plain copy, and sitemap pass. |
| Verification 1 deployment findings | Fixed and rechecked live: immutable asset caching, manifest media type, CSP, framing, permissions, referrer, nosniff, and HSTS pass. |
| Review 3 F-3-1 | Fixed: sharing prerequisites and photo count, format, and size claims each have passing registered outcome tests. |
| Verification 3 V3-1 | Fixed: saved-card reload, print photos, unchanged original, and site-data clearing each have a passing registered outcome test. |
| Verification 3 V3-2 | Fixed: repeated wordmark and legal links meet the touch-target minimum. |
| Verification 3 V3-3 | Fixed: malformed backup and shared-link errors give plain recovery instructions and recover normally. |
| Review 4 F-4-1 | Fixed: the editor says **Describe the symptom** and the missing page says **Page not found**. |

No AI feature is warranted. Generated diagnosis would conflict with the safety
boundary, while cloud sync would weaken the local-first privacy model. The
product has no backend, account, payment flow, or server-side tenant state, so
backend isolation, restart, health, and rate-limit checks do not apply.

## Result

There are no blocking, major, minor, or advisory findings. There are no
untested public claims.

**FINAL VERDICT: PASS — 0 findings and 0 untested claims.**
