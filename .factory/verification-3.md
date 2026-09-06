# Record bike-fault evidence — independent verification 3

**VERDICT: FAIL — 3 findings, including 4 untested public claims.**

Verified on 2026-09-06 against deployed implementation
`d5364639a7f32e8d19ffa8cf7abefb98701b1e3e` and documentation HEAD
`e8dd43d982f56c5da43b5cd09f60392f771304d3` at
<https://bike-check-card.sociobot.in>. Product code was not changed.

## First screen and primary job

Fresh 390 × 844 phone and 1440 × 900 desktop profiles showed all required
information before scrolling:

- Job: **Record bike-fault evidence**.
- Audience: cyclists making a clear record before asking a mechanic or cycling
  community for help.
- First action: **Try it with sample data**.
- Expected result: a completed check card opens first.
- Facts: no account, saved on this device, and free to use.

The one-click sample contained a steel commuter, sensor/computer component,
wheel-speed and GPS mismatch, mileage, pressure, timeline, ride context,
conditions, notes, and one marked photo. The demo label stayed visible after an
edit and reset. Reset restored the shipped sample. In each fresh profile, a
temporary real draft survived entering and resetting the demo. IndexedDB showed
the distinct `bike-check-card` and `demo:bike-check-card` databases. These
temporary browser profiles did not touch existing user data.

Evidence: `/work/.evidence/verification-3/home-phone.png`,
`home-desktop.png`, `demo-phone.png`, and `demo-desktop.png`.

## Candidate and live identity

The implementation candidate remains `d536463`. Later commits through
`e8dd43d` change only tests and documentation. A clean build produced the same
asset names as production. Local and live SHA-256 hashes matched for:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-BxrlItAw.js` | `8e96db6df300dde351d512fc57dbf83a9b03089f6e6d9af6700c1c3499b2f064` |
| `assets/index-DCH8cAQq.css` | `78dd66ea0a9ca766117f533d6b7c8a5273798d1e82b9513f8e18f0e7dd1c9c80` |
| `sw.js` | `67f783dc92810b40b599c397a127eecbebcef8acf66408c36efbba70bc92696d` |
| `manifest.webmanifest` | `cf30648e9b6de347677a1e105b51b28ba118417a92214945630a21024ec3443a` |
| `offline.html` | `81d05db774fcf9f47bc1b04fb4edf9c9d9368b2e774646572f88c0022f6408f9` |

## Clean-checkout gates and declared claims

A fresh local clone at documentation HEAD was installed with `npm ci`.

| Check | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages installed; zero vulnerabilities |
| `npm test` | Pass — 8/8 |
| `npm run lint` | Pass |
| `npm run build` | Pass — `dist/` created |
| Every command in `.factory/claims.json`, run independently | Pass — 16/16 commands; 32/32 phone and desktop executions |
| `npm run test:e2e` | Pass — 38/38 |
| `npm audit --omit=dev` | Pass — zero vulnerabilities |

The registry has 16 unique IDs and exactly one matching `@claim:<id>` tag per
ID. The four claims added for review finding F-3-1 passed locally and against
production in phone and desktop projects: sharing prerequisites, six-photo
limit, JPG/PNG formats, and the inclusive 10 MB limit. Their live runs covered
normal, invalid, exact-boundary, and recovery outcomes.

Fifteen live-suitable registered claims passed against production in 30/30
executions. The fragment-link claim was also exercised manually in both live
profiles: the copied URL used `/#card=`, omitted photo data, requested only `/`
without the fragment, opened the shared card, and reported the omitted photo.

## Live behavior and recovery

- A complete sample could be edited, saved, shared, printed, exported, reset,
  and restored without an account.
- A blank card could not be shared. Bike, component, and symptom alone still
  failed; adding a `0 km` measurement reached the exact four-part minimum.
- Exactly six photos were accepted, a seventh was rejected, and a replacement
  worked after removal.
- Valid JPG and PNG files worked. WebP, text, and mixed invalid batches were
  rejected atomically. A valid photo worked afterward.
- A 10 MiB JPG worked. A 10 MiB plus one-byte JPG failed. A normal photo worked
  after the error.
- The saved-card empty state, save, open listing, and confirmed deletion worked
  in a fresh live context.
- The photo dialog focused its close control, kept keyboard focus inside the
  native modal, and closed with Escape.
- Invalid JSON and malformed shared links recovered without a crash, but their
  displayed wording is finding V3-3 below.

## Accessibility, routes, privacy, and PWA

- `/opt/fleet/lib/verify-url.sh` passed `/` and `/demo`: title, `lang=en`, one
  h1, main landmark, image alternatives, button names, and zero console errors.
- Live Axe checks on `/`, `/demo`, `/card`, `/cards`, `/privacy`, `/terms`, and
  the missing route found zero serious or critical issues in phone and desktop
  profiles.
- Tab reached the skip link first. Its focus treatment was a 3 px ink outline
  with a 6 px yellow ring. Enter focused main. Client navigation and Back
  focused the new h1.
- Reduced motion changed transitions to `0.00001s` and scrolling to `auto`.
- All normal product requests observed during the sample and real-draft flows
  were same-origin. No analytics, trackers, remote fonts, ads, or third-party
  scripts loaded.
- Offline reload passed live in both projects after service-worker control.
  The completed sample remained editable.
- A controlled update of the clean built artifact showed “A new field sheet is
  ready.” with an **Update** action and no console errors.
- All six public routes returned 200 with their exact titles, descriptions,
  canonicals, header, footer, one h1, and one main. Internal route links and
  product assets returned 200. Privacy exposes the documented mail address.
- `/missing-verification-3` intentionally returned HTTP 404 and rendered the
  designed page, correct title, standard shell, and a route home. Its expected
  404 network message is not a defect.
- The manifest has standalone display, a versioned start URL, 192/512 and
  maskable icons, and product palette colors. Sitemap and robots files are
  correct.
- HTML, service worker, and manifest revalidate. Hashed JS/CSS use a one-year
  immutable cache. Manifest MIME type and required CSP, framing, permissions,
  referrer, nosniff, and HSTS headers are live.

## Performance

Fresh live Lighthouse 13 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 1.0 s |
| LCP | 1.1 s |
| TBT | 10 ms |
| CLS | 0 |

The initial JavaScript is 34,301 bytes raw, CSS is 18,675 bytes raw, the mobile
hero is 60,862 bytes, and no font payload ships. Evidence is
`/work/.evidence/verification-3/lighthouse-live.json`.

## Findings

### Major V3-1 — Four public promises lack complete registered claim tests

The 16 declared commands pass, but the public copy contains four further
observable promises that no claim row and tagged test fully assert:

1. README: “Real drafts and saved cards stay in this browser.” The
   `local-save` claim verifies a draft, not a saved card that survives reload.
2. Editor: “Print/PDF and backup include photos.” Backup photos are tested;
   `print-card` only records that `window.print()` was called and does not assert
   photo inclusion under print media.
3. Photo marker: “Your original stays untouched.” The photo test checks stored
   original and annotated data URLs exist, but never compares the original
   before and after marking.
4. Privacy: “Clearing site data removes these records.” No registered test
   clears site data and proves the records are gone.

Ad hoc live checks support the saved-card behavior, and source/print inspection
suggests the other statements are true. That does not satisfy the required
one-claim/one-tagged-outcome contract. Add one observable claim test for each
promise or narrow/remove the public wording.

### Minor V3-2 — Repeated links are below the 44 px touch-target requirement

At 390 px on the live demo, the wordmark link measured 181 × 34 px. Footer
Privacy measured 53 × 19 px, and Terms measured 38 × 19 px. These links repeat
across routes. Header navigation and task controls meet the target size, but the
three repeated links do not meet the attached accessibility and site-structure
minimum of 44 × 44 CSS pixels.

Increase the clickable block or padding without changing the visible identity.

### Minor V3-3 — Malformed inputs expose parser errors instead of plain recovery text

Importing malformed JSON displayed:

> Expected property name or '}' in JSON at position 1 (line 1 column 2)

Opening a malformed shared fragment displayed an `Unexpected token` message
with replacement characters. The page stayed usable and the bad-link screen
offered a home action, but these messages expose parser detail and do not tell a
cyclist what to choose or request next.

Replace them with product-specific text such as “This is not a Bike Check Card
backup. Choose an exported Bike Check Card JSON file.” and “This shared card
link is damaged. Ask the sender to copy a new link.”

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1 F-1-1, first-screen job and audience | Fixed; rechecked above the fold on phone and desktop |
| Review 1 F-1-2, one-click isolated demo | Fixed; sample, persistent label, reset, namespaces, and real-data isolation passed |
| Review 1 F-1-3, absent claim registry | Original gap fixed; 16 IDs/tags pass, but new V3-1 records four remaining public-coverage gaps |
| Review 1 F-1-4, demo and real 404 | Fixed; `/demo` is 200 and the designed missing page is a deliberate 404 |
| Review 1 F-1-5, dead paid action | Fixed; no checkout, purchase, subscription, or payment prompt is present |
| Review 1 F-1-6, route metadata | Fixed on every route |
| Review 1 F-1-7, route focus | Fixed for navigation, Back, and skip link |
| Review 1 F-1-8, shared navigation/footer | Functionally fixed; V3-2 identifies a separate touch-size defect in repeated links |
| Review 1 F-1-9, landing/README plain words | Fixed for audited copy; V3-3 identifies separate invalid-input messages |
| Review 1 F-1-10, sitemap | Fixed; all six routes are listed |
| Verification 1 cache, manifest MIME, and security headers | Fixed and rechecked live |
| Review 3 F-3-1, four boundary claims | Fixed; all four pass locally and live in both projects |

## Result

**FAIL — 3 findings and 4 untested public claims.** The deployed candidate is
correctly identified and its primary workflow, registered claims, offline
behavior, privacy boundary, routes, accessibility automation, and performance
all pass. Acceptance still requires resolving V3-1 through V3-3 and rerunning
independent verification.
