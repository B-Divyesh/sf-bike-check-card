# Record bike-fault evidence — strict review 4

**VERDICT: FAIL — 1 finding and 0 untested claims.**

Reviewed on 2026-09-06 against
<https://bike-check-card.sociobot.in>. Product code was not changed.

- Implementation candidate: `6dafa460185582dff7e7d6e044e50fffd057e2bc`
- Post-deploy test revision: `d9a35c910ad6cf4741aac06efcf85650ab58db83`
- Documentation baseline reviewed: `520ba4e51f2d55fffd9d9997ddef9a96695893a4`

Commits after the implementation candidate change tests and reports only. A
clean build at the documentation baseline matched the deployed JavaScript,
CSS, service worker, manifest, and offline fallback byte for byte.

## First screen

Fresh phone and desktop browser contexts showed the required information before
scrolling:

- Job: **Record bike-fault evidence**.
- Audience: cyclists making a clear record before asking a mechanic or cycling
  community for help.
- First action: **Try it with sample data**.
- Expected result: **See a completed check card first**.
- Facts: no account, saved on this device, and free to use.

The phone viewport was 393 × 727 and the desktop viewport was 1280 × 720. The
job, audience, sample action, and expected result all fit inside each initial
viewport. Neither context logged a console or page error.

Evidence: `/work/.evidence/review-4/home-phone.png`, `home-desktop.png`, and
`manual-live.json`.

## Sample and data isolation

The one-click sample opened a completed steel-commuter card. It contained the
component, symptom, mileage, pressure, wheel and GPS readings, timeline, ride
context, conditions, notes, next step, and one marked photo.

The **Demo — sample data, nothing is saved** label remained visible after an
edit. Reset restored the shipped sample. Starting for real restored a temporary
real draft unchanged after a demo reset. Each fresh context contained separate
`bike-check-card` and `demo:bike-check-card` databases. Closing the contexts
removed the review state and did not touch an existing browser profile.

Evidence: `/work/.evidence/review-4/demo-phone.png`, `demo-desktop.png`, and
`manual-live.json`.

## Clean-checkout checks

A fresh clone of `520ba4e` was installed and tested.

| Check | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages installed; zero vulnerabilities |
| `npm test` | Pass — 8/8 |
| `npm run lint` | Pass |
| `npm run build` | Pass — `dist/` created with `index.html` at its root |
| Every command in `.factory/claims.json`, run independently | Pass — 20/20 commands; 40/40 phone and desktop executions |
| `npm run test:e2e` | Pass — 50/50 locally |
| `PLAYWRIGHT_BASE_URL=https://bike-check-card.sociobot.in npm run test:e2e` | Pass — 50/50 live |
| `npm audit --omit=dev` | Pass — zero vulnerabilities |

The claim registry contains 20 unique ids. Each id has exactly one matching
`@claim:<id>` test, and no unregistered claim tag exists.

Evidence: `/work/.evidence/review-4/clean-gates.log`, `claims-local.log`,
`claims-registry.json`, and `full-suites.log`.

## Declared claims

| Claim | Result | Observable result |
| --- | --- | --- |
| `core-capture` | Pass | The completed sample contains every stated evidence type and a marked photo. |
| `demo-isolation` | Pass | Reset changes only demo storage; the temporary real draft returns unchanged. |
| `no-account` | Pass | The sample works without sign-in or credential fields. |
| `local-save` | Pass | A real draft survives reload. |
| `saved-card-reload` | Pass | A named saved card remains after reload. |
| `offline-reload` | Pass | The controlled sample reloads and remains editable offline. |
| `photo-local` | Pass | A photo is added and marked locally with same-origin requests only. |
| `share-prerequisites` | Pass | Sharing fails below the minimum and succeeds with the exact minimum. |
| `six-photo-limit` | Pass | Six photos work, a seventh fails, and a replacement works after removal. |
| `photo-formats` | Pass | JPG and PNG work; unsupported and mixed batches fail without mutation; recovery works. |
| `photo-size-limit` | Pass | Exactly 10 MiB works, one byte more fails, and a later valid photo works. |
| `fragment-share` | Pass | Shared text stays in the URL fragment and omits photos and request data. |
| `json-backup` | Pass | Export, reset, and import restore text and photo content. |
| `print-photos` | Pass | The completed sample photo remains visible under print media. |
| `original-photo-unchanged` | Pass | The stored original is unchanged after marking; the marked copy is separate. |
| `site-data-clear` | Pass | Browser site-data clearing removes the real draft and saved card. |
| `same-origin` | Pass | The sample reset, edit, and save flow makes only same-origin requests. |
| `safety-boundary` | Pass | The landing page and editor state the boundary and offer no diagnosis action. |
| `free-use` | Pass | Product routes contain no checkout, purchase, payment, or subscription prompt. |
| `print-card` | Pass | The print action invokes the browser print function. |

The live copy and README were checked against the registry. All public product
promises map to the claims above. **Untested public claims: 0.**

## Normal, invalid, boundary, and recovery paths

- A complete card can be edited, saved, reopened after reload, shared, printed,
  backed up, reset, and restored.
- An incomplete card names every sharing requirement. A `0 km` measurement
  satisfies the exact minimum.
- Valid photo types and exact size and count boundaries work. Invalid input is
  rejected without a partial change, and a later valid upload succeeds.
- A malformed backup tells the rider to choose an exported Bike Check Card JSON
  file. A valid backup works afterward.
- A malformed shared link tells the rider to ask for a new link. It exposes no
  parser detail, and its home action works.
- The empty saved-card state, saved-card reload, deletion, and site-data removal
  paths work.

## Accessibility, privacy, offline use, and routes

- Playwright Axe found zero serious or critical issues on home, demo, editor,
  saved cards, privacy, terms, and the missing page in both projects.
- `/opt/fleet/lib/verify-url.sh` passed home and demo with correct titles,
  `lang=en`, one `h1`, one `main`, image alternatives, named buttons, and zero
  console errors.
- Tab reaches the skip link first. Its focus style uses a 3 px ink outline and
  a 6 px yellow ring. Enter moves focus to `main`.
- Client navigation and browser Back move focus to the new `h1`.
- The photo dialog focuses its close button, closes with Escape, and restores
  focus to the photo action.
- Reduced motion changes control transitions to `0.00001s`.
- The wordmark and footer legal links measure at least 44 × 44 CSS pixels.
- All six public routes return 200 with route-specific titles, descriptions,
  canonicals, one `h1`, one `main`, and `lang=en`. Every crawled internal link
  returns 200.
- `/missing-review-4` deliberately returns HTTP 404 and provides a home action.
  The expected status is not a defect. Finding F-4-1 concerns only its wording.
- The sample and real-draft flows request only the product origin. No analytics,
  trackers, remote fonts, ads, or third-party scripts load.
- Offline reload works after the first visit. The manifest and service worker
  provide the required standalone shell, icons, caching, and update handling.
- Privacy and Terms are complete product routes. The privacy route explains
  local storage, exports, links, site-data clearing, and contact details.

Evidence: `/work/.evidence/review-4/verify-url.log`, `keyboard-dialog.json`,
`routes-links.json`, and `runtime-identity.log`.

## Candidate identity and performance

Local and live SHA-256 values match:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-IHLJCNw3.js` | `14267e158346cdd0e32ffb409a85d8b6fef21f47d70c90a4885e5ff49db03689` |
| `assets/index-CcBWBdLs.css` | `e4ee82794d533dfbb8bddf5db8201d57023894019a6716812036e39f3a221920` |
| `sw.js` | `d9f966a30cae649e9f6d99f1d2b5917ad4c408fdc1eb694992c59124cc709779` |
| `manifest.webmanifest` | `cf30648e9b6de347677a1e105b51b28ba118417a92214945630a21024ec3443a` |
| `offline.html` | `81d05db774fcf9f47bc1b04fb4edf9c9d9368b2e774646572f88c0022f6408f9` |

Initial JavaScript is 34,339 bytes raw and 11,394 bytes gzip. CSS is 18,813
bytes raw and 4,801 bytes gzip. The phone hero is 60,862 bytes, and no font
payload ships.

Fresh Lighthouse 13.0.1 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.0 s |
| TBT | 0 ms |
| CLS | 0 |

HTML, the service worker, and the manifest revalidate. Hashed assets use a
one-year immutable cache. The manifest MIME type, CSP, frame denial,
permissions policy, referrer policy, nosniff, and one-year HSTS are live.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1 F-1-1 | Fixed — the job, cyclist audience, sample action, expected result, and three facts appear before scrolling. |
| Review 1 F-1-2 | Fixed — `/demo` and `?demo=1` provide a completed isolated sample, persistent label, reset, and start-real action. |
| Review 1 F-1-3 | Fixed — 20 registered claims each have one tagged outcome test, and all commands pass independently. |
| Review 1 F-1-4 | Fixed — demo returns 200 and a missing route returns the deliberate designed 404. |
| Review 1 F-1-5 | Fixed — no paid offer or dead checkout remains. |
| Review 1 F-1-6 | Fixed — route titles and metadata are correct. |
| Review 1 F-1-7 | Fixed — route changes and browser history move focus and announce the new heading. |
| Review 1 F-1-8 | Fixed — the shared header and footer contain required navigation, legal links, credit, and build id. |
| Review 1 F-1-9 | Partly superseded — the audited landing and README copy pass; F-4-1 identifies two remaining metaphorical headings outside that inventory. |
| Review 1 F-1-10 | Fixed — the sitemap includes all six public routes. |
| Verification 1 deployment findings | Fixed — immutable asset caching, manifest MIME, CSP, framing, permissions, referrer, nosniff, and HSTS pass live. |
| Review 3 F-3-1 | Fixed — sharing prerequisites and the photo count, formats, and size boundaries have registered passing tests. |
| Verification 3 V3-1 | Fixed — saved-card reload, print photos, unchanged originals, and site-data clearing have registered passing tests. |
| Verification 3 V3-2 | Fixed — the wordmark and legal links measure at least 44 × 44 pixels. |
| Verification 3 V3-3 | Fixed — malformed backup and shared-link errors use plain recovery instructions and recover normally. |

No AI feature is warranted. Generated diagnosis would conflict with the safety
boundary, and cloud sync would weaken the local-first design. The product has
no backend or active paid offer, so backend isolation, restart, rate-limit, and
payment checks do not apply.

## Finding

### Minor F-4-1 — Two headings use workshop metaphors

**Evidence:** The editor uses the h2 **“Pin down the symptom.”** The designed
404 uses the h1 **“This page is not on the workbench.”** The second phrase is
also visible in `/work/.evidence/review-4/404.png`.

**Why this fails:** The attached plain-words contract prohibits metaphor and
mood headings. A heading must name the section or state directly. Both phrases
are understandable, but they make the rider interpret workshop language before
getting the literal meaning. The 404 status, explanation, and recovery action
all work; the deliberate HTTP 404 is not the defect.

**Required repair:** Change the editor heading to **“Describe the symptom”**
and the missing-page h1 to **“Page not found.”** Keep the current supporting
text, status code, visual treatment, and home action.

## Result

All functional and registered-claim checks pass, and there are zero untested
claims. F-4-1 remains a minor copy defect.

**FINAL VERDICT: FAIL — 1 finding and 0 untested claims.**
