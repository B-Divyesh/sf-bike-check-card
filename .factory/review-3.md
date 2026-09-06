# Record bike-fault evidence — review 3

**Date:** 2026-09-06  
**Live URL:** <https://bike-check-card.sociobot.in>  
**Verdict: FAIL**

This is an independent seven-day re-review. Product code was not changed.

## What the product does

Bike Check Card is for cyclists who need to record a bike fault before asking a mechanic or cycling community for help. Before scrolling, the first action is **Try it with sample data**. Its adjacent text says that it opens a completed check card first.

Fresh phone (iPhone 13, 390 px wide) and desktop (1440 px wide) Chromium contexts showed the same first screen: “Record bike-fault evidence,” the cyclist audience sentence, the sample action, and “No account,” “Saved on this device,” and “Free to use.” The primary action was visible without scrolling. Neither viewport overflowed or logged a product console error.

## Candidate and live output

The implementation reviewed is `efa09a720ec1cc777f54c8a788573bac464fc1d9` (`fix: complete isolated demo and release contract`). The documentation head is `c6474d69e2d31fa1ca13251606bf3c67d3e96dfd`; its changes after the implementation candidate are reports, evidence, and handoff text only.

After a clean `npm ci` and build, the local and live hashes matched for both deployed bundles:

| Asset | SHA-256 |
| --- | --- |
| `index-DyN-w7TF.js` | `171854c93c01ee9a93d72bc43e169807490bbadead9d00dbc46865f769d12ada` |
| `index-DCH8cAQq.css` | `78dd66ea0a9ca766117f533d6b7c8a5273798d1e82b9513f8e18f0e7dd1c9c80` |

## Demo and real data

From a fresh live phone browser context, I wrote a temporary real draft, opened the sample, changed its bike, reset it, then chose Start for real. The real draft returned unchanged. The browser showed separate `bike-check-card` and `demo:bike-check-card` databases.

The completed sample contains a steel commuter, Sensor / computer component, wheel/GPS mismatch, 6,420 km, tyre pressure, both speed readings, a timeline, ride context, a marked sensor photo, and 4 / 4 essentials. The persistent banner reads “Demo — sample data, nothing is saved,” and includes Reset demo and Start for real. The demo change was discarded on reset and did not alter the temporary real draft.

Normal, invalid, boundary, and recovery checks were exercised live. A normal PNG added a second local photo. A text file showed “not-image.txt is not an image.” Five more photos reached the six-photo total; a seventh showed “Choose no more than six photos in total.” Reset restored the one shipped sample photo.

## Runtime checks

| Check | Result |
| --- | --- |
| Offline demo reload after service-worker control | Pass — sample remained visible and an edited pressure value was accepted offline. |
| Privacy request log | Pass — observed requests used only `https://bike-check-card.sociobot.in`. |
| Accessibility | Pass — Axe reported no serious or critical issues on `/`, `/demo`, `/card`, `/cards`, `/privacy`, `/terms`, and the missing-page route at desktop and phone sizes. |
| Keyboard and focus | Pass — Tab reached the visible skip link first; Enter focused `#main`; route navigation focused the new `h1`. |
| Reduced motion | Pass — button transition measured `0.00001s`. |
| Routes and links | Pass — public routes returned 200, legal pages had their own titles, and `/missing-review-3` returned a designed HTTP 404 with a way home. The browser console’s network message for that deliberate 404 is expected, not a product error. |
| PWA and security | Pass — manifest has standalone display and required icons; live CSP, referrer policy, nosniff, and 404 response headers are present. |
| Bundle budget | Pass — JavaScript is 34,234 bytes raw / 11.32 KB gzip; CSS is 18,675 bytes raw / 4.77 KB gzip. |

## Declared claims

From the clean checkout, `npm test` passed 8/8, `npm run lint` passed, and `npm run build` produced `dist/`. Every command declared in `.factory/claims.json` was run independently, then `npm run test:e2e` passed 30/30 across mobile and desktop. Each registered id has exactly one matching `@claim:` test.

| Registered claim ids | Result |
| --- | --- |
| `core-capture`, `demo-isolation`, `no-account`, `local-save` | Pass |
| `offline-reload`, `photo-local`, `fragment-share`, `json-backup` | Pass |
| `same-origin`, `safety-boundary`, `free-use`, `print-card` | Pass |

## Finding

### Major F-3-1 — Four public promises have no registered claim or tagged sandbox test

The editor states four observable promises that are absent from `.factory/claims.json` and have no `@claim:` test:

1. “Add the bike, component, symptom, and one measurement before sharing.”
2. “Up to six photos.”
3. “JPG, PNG, HEIC where supported.”
4. “10 MB each.”

The live checks above support the photo-count behavior, and source inspection shows enforcement for the share prerequisites and 10 MB limit. That is not a substitute for the required registered sandbox evidence. The format wording also needs a browser fixture or narrower copy. Add one claim per promise with an observable normal, invalid, boundary, and recovery assertion, or remove/narrow the public wording. Until then the public-claims contract has four untested claims.

## Earlier findings

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1 F-1-1 through F-1-2: first-read copy and isolated one-click demo | Fixed and rechecked live on phone and desktop. |
| Review 1 F-1-3: registry and tagged claims | Fixed for the original 12 claims; superseded by new F-3-1 for later-uncovered public promises. |
| Review 1 F-1-4 through F-1-10: demo route, 404, paid link, metadata, focus, navigation/footer, plain copy, sitemap | Fixed and rechecked live. |
| Verification 1: immutable asset cache, manifest MIME type, security headers | Fixed; live headers and asset responses meet the documented policy. |
| Verification 2, polish 1, and review 2: no remaining defects | Rechecked. Their tested paths remain sound; F-3-1 is a claims-coverage gap not identified in those reports. |

## Result

**FAIL — 1 finding and 4 untested public claims.** The real user path, demo isolation, offline behavior, privacy boundary, accessibility, routes, legal pages, and registered claims passed. A PASS is not valid until F-3-1 is repaired and independently rerun.
