# Record bike-fault evidence — independent verification 5

**VERDICT: PASS — 0 findings and 0 untested claims.**

Verified on 2026-09-06 against <https://bike-check-card.sociobot.in>. Product
code was not changed during this work order.

- Implementation candidate reviewed: `77b3088fe79a5aa0abf5dc3f114842529c1c2e8a`
- Documentation baseline: `aca5a970992643bc033516fa03298d3486f84202`
- Deployment recorded by the product: `c6771a7b-83bc-45d7-b39d-9e03cc4b0b9d`

The clean local build and the live runtime have identical JavaScript, CSS,
service-worker, manifest, and offline-page hashes. The current live shell
loads `index-DGjtvurA.js` and `index-CcBWBdLs.css`, produced by the reviewed
implementation.

## First screen and realistic sample

Fresh Pixel 5 (390 × 844) and desktop (1440 × 900) browser contexts showed,
before scrolling:

- Job: **Record bike-fault evidence**.
- Audience: cyclists preparing a clear record before asking a mechanic or
  cycling community for help.
- First action: **Try it with sample data**.
- Immediate result: **See a completed check card first**.
- Facts: **No account**, **Saved on this device**, and **Free to use**.

The first action opened a populated steel-commuter record with a sensor/GPS
mismatch, mileage, tyre pressure, symptom and timeline, ride context,
conditions, notes, rider next step, and a marked photo. The persistent
**Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start
for real** controls were visible in both contexts. Reset restored the shipped
sample. The live suite separately proves that demo changes never alter the
real draft.

Evidence: `/work/.evidence/verification-5/phone-demo.png` and
`/work/.evidence/verification-5/desktop-demo.png`.

## Clean-checkout quality gates

`npm ci` was run at the documentation baseline, followed by the commands
below. The local preview used the freshly built `dist/` output.

| Check | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages installed; zero vulnerabilities. |
| `npm test` | Pass — 8/8. |
| `npm run lint` | Pass. |
| `npm run build` | Pass — creates `dist/index.html`. |
| `npm audit --omit=dev` | Pass — zero vulnerabilities. |
| Every command declared in `.factory/claims.json` | Pass — 20/20 commands, 40/40 fresh phone/desktop executions. |
| Full local browser suite | Pass — 50/50. |
| Full live browser suite | Pass — 50/50. |

The claim registry has 20 unique IDs and exactly 20 corresponding
`@claim:<id>` tests: no missing, duplicate, or extra tags. Public product and
README outcome statements were cross-checked against that registry. **Untested
public claims: 0.**

## Declared claims

| Claim | Result |
| --- | --- |
| `core-capture`, `demo-isolation`, `no-account`, `local-save` | Pass — completed evidence capture, isolated sample, account-free use, and draft reload. |
| `saved-card-reload`, `offline-reload`, `photo-local`, `original-photo-unchanged` | Pass — saved records persist, sample edits survive an offline reload, requests remain same-origin, and marking does not alter the stored original. |
| `share-prerequisites`, `six-photo-limit`, `photo-formats`, `photo-size-limit` | Pass — incomplete share blocks, exact share minimum works, six-photo and JPG/PNG limits hold, and invalid inputs recover. |
| `fragment-share`, `json-backup`, `print-photos`, `site-data-clear` | Pass — text-only fragments omit photos, backup restores a complete card, print media retains photos, and browser site-data clearing removes drafts and saved cards. |
| `same-origin`, `safety-boundary`, `free-use`, `print-card` | Pass — no third-party requests, no diagnosis/safety verdict, no payment prompt, and print invokes browser print. |

The invalid and recovery coverage also passed: malformed backup input now says
“This is not a Bike Check Card backup. Choose an exported Bike Check Card JSON
file.” A damaged share link says “This shared card link is damaged. Ask the
sender to copy a new link.” Neither exposes parser details, and valid recovery
works after each error.

## Accessibility, privacy, PWA, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: titles,
  `lang=en`, exactly one `h1`, a main landmark, complete image alternatives,
  named buttons, and no console errors.
- The live Playwright Axe integration found no serious or critical violations
  on home, demo, editor, saved cards, privacy, terms, and the missing page in
  both browser projects. The standalone Axe CLI could not locate a Chrome
  binary in this container; this does not leave an accessibility path untested
  because the same Axe engine ran inside the successful live suite.
- Keyboard, focus, history focus restoration, reduced-motion behaviour, native
  photo-dialog Escape handling, mobile overflow, and the 44 × 44 px wordmark
  and legal-link targets passed live browser tests.
- `/`, `/demo`, `/card`, `/cards`, `/privacy`, and `/terms` return 200 with
  route titles. `/missing-verification-5` deliberately returns HTTP 404 and
  renders **Page not found** with a home action; this expected status is not a
  defect.
- The service worker supports an editable demo after first-load offline reload.
  The live manifest has standalone display, versioned start URL, required
  icons, and product palette colours. Headers provide revalidation for HTML,
  service worker, and manifest; immutable caching for hashed assets; correct
  manifest media type; CSP framing denial; permissions policy; strict referrer
  policy; nosniff; and HSTS.
- Fresh live Lighthouse mobile: **100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO**; FCP 0.9 s, LCP 0.9 s, TBT 0 ms, CLS 0. Initial
  JavaScript is 34,320 bytes raw / 11.37 KB gzip; CSS is 18,813 bytes raw /
  4.79 KB gzip; the mobile hero is 60,862 bytes.

Evidence is under `/work/.evidence/verification-5/`, including the valid
Lighthouse result in `lighthouse-live-valid.json`.

## Earlier finding disposition

| Earlier finding | Disposition in this verification |
| --- | --- |
| Review 1 F-1-1 through F-1-10 | Fixed and rechecked: plain first-read job, isolated sample, registered claims, routes/404, no dead paid action, route metadata and focus, shared shell, plain copy, and sitemap all pass. |
| Verification 1 deployment findings | Fixed and rechecked live: immutable asset caching, manifest MIME type, and browser security headers pass. |
| Review 3 F-3-1 | Fixed: the four sharing/photo boundary promises retain passing registered tests. |
| Verification 3 V3-1 | Fixed: saved-card reload, print photos, unchanged original, and site-data clearing each retain an observable registered test. |
| Verification 3 V3-2 | Fixed: repeated wordmark and legal links meet the 44 × 44 px minimum. |
| Verification 3 V3-3 | Fixed: damaged backup and shared-link states use plain recovery wording and recover normally. |
| Review 4 F-4-1 | Fixed: the rendered editor heading is **Describe the symptom** and the rendered missing-page heading is **Page not found**. |

## Result

There are no blocking, major, minor, or advisory findings. There are no
untested public claims.

**FINAL VERDICT: PASS — 0 findings and 0 untested claims.**
