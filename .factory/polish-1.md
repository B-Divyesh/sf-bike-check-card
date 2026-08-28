# Bike Check Card — polish round 1

Work order: `bike-check-card-polish-1`

Base review commit: `8bd0136406f59eaac82337c700c6bd6e8bcebd9e`

Verified repair commit: `efa09a720ec1cc777f54c8a788573bac464fc1d9`

Deployment: `6f38cf0a-3d77-4100-a2d9-bec1204df083`
Live site: <https://bike-check-card.sociobot.in>

## Finding map

| Finding | Change made | Test evidence | Screenshot | Live check |
| --- | --- | --- | --- | --- |
| F-1-1 | Replaced the mood headline with “Record bike-fault evidence.” The first sentence names cyclists and the help-seeking situation. Added the sample action, outcome text, real start, and three plain facts. | `@claim:core-capture`, `@claim:no-account`, `@claim:free-use`; full copy inventory in `.factory/copy-audit.md`. | `.factory/evidence/live-home-mobile.png`, `.factory/evidence/home-desktop.png` | `/` shows the required first screen at 390 × 844 and 1440 × 900. Cold live audit passed exact copy and zero mobile overflow. |
| F-1-2 | Added `/demo` and `?demo=1` with a completed commuter sensor/GPS card, marked sample photo, persistent banner, Reset demo, and Start for real. Demo uses `demo:bike-check-card`; real data uses `bike-check-card`. | `@claim:demo-isolation`, `@claim:core-capture`, `@claim:offline-reload`; clean-clone runs passed in both browser projects. | `.factory/evidence/live-demo-mobile.png`, `.factory/evidence/demo-desktop.png` | Cold live isolation check created a real draft, opened `?demo=1`, reset it, returned to `/card`, and recovered the unchanged real value. Both database names were confirmed. |
| F-1-3 | Added `.factory/claims.json` with 12 observable promises and exactly one tagged test for each. Removed unsupported or duplicated marketing claims. Rewrote README around the registered claims. | Every listed command ran from a clean clone at `efa09a7`; 24/24 browser executions passed. Full suite: 30/30. | `.factory/evidence/verify-live-demo/screenshot-desktop.png` | Whole live demo flow recorded zero cross-origin requests. Live offline reload, privacy, print, and storage checks passed. |
| F-1-4 | Added direct static documents for `/demo`, `/card`, `/cards`, `/privacy`, and `/terms`. Removed the catch-all 200 fallback. Added product-styled `404.html` plus `responseOverrides.404`. | Unit: “uses direct route documents and a real not-found response”; routing browser test covers direct URLs. | `.factory/evidence/verify-live-home/screenshot-mobile.png` | `/demo` returns 200. `/404-test-missing` returns HTTP 404 and renders “This page is not on the workbench.” |
| F-1-5 | Removed the unregistered checkout link, $9 offer, license restore UI, license network code, and history paywall. The full local workflow is free. | `@claim:free-use` checks all product routes for checkout, payment, purchase, and subscription prompts. | `.factory/evidence/live-home-mobile.png` | Cold live crawl found no checkout link or `api.sociobot.in` link. CSP now limits connections to self. |
| F-1-6 | Added route-specific titles, descriptions, canonicals, Open Graph, Twitter cards, and a 1200 × 630 product-art preview. Static entry documents and client navigation both set metadata. | Browser: “routes set titles, metadata, focus, history, and direct URLs.” Build confirms static route documents. | `.factory/evidence/home-desktop.png` | Live `/privacy` returns “Privacy — Bike Check Card” in its HTML; `/terms` returns “Terms — Bike Check Card.” Social image returns 200. |
| F-1-7 | Route navigation now stores scroll position, restores it on Back/Forward, focuses the new `h1`, and updates a polite route announcer. Initial load still leaves the skip link first in tab order. | Browser routing test covers click, Back, Forward, focus, and deep links. Keyboard/mobile/reduced-motion test covers skip navigation. | `.factory/evidence/verify-live-home/screenshot-desktop.png` | Cold live click from `/` to `/demo` focused the demo `h1`; Back and Forward passed in the full suite. |
| F-1-8 | Header now provides Try demo, Open draft, Saved cards, and Privacy. Footer provides the product sentence, Privacy, Terms, Param Factory credit, version, build id, and artwork note. Mobile header becomes a two-column navigation grid. | Full accessibility/link tests; live internal-link crawl returned 200 for all six public routes. | `.factory/evidence/live-home-mobile.png`, `.factory/evidence/home-desktop.png` | Header and footer were present on the live home, demo, card, cards, privacy, terms, and 404 views. |
| F-1-9 | Applied every requested landing rewrite, removed workshop metaphors from headings and buttons, split legal/README sentences, and standardized check card, draft, saved cards, demo, backup, shared text link, and photos. | `.factory/copy-audit.md` records every landing string and word count; no line exceeds 22 words or uses a banned term. | `.factory/evidence/live-home-mobile.png` | Cold first-read confirms the user, job, first action, and sample outcome fit on the phone’s first screen. |
| F-1-10 | Added `/demo`, `/card`, and `/cards` to the sitemap beside home and legal routes. | Build artifact inspection and live sitemap fetch. | `.factory/evidence/verify-live-home/screenshot-desktop.png` | Live `/sitemap.xml` returns 200 and lists all six public routes. |

## Earlier verification findings

The earlier cache, manifest media type, and browser-policy fixes remain intact. The unit response-policy suite passed. Live headers confirm zero-age HTML, one-year immutable hashed assets, manifest MIME configuration, self-only CSP, frame denial, permissions policy, strict referrer policy, nosniff, and one-year HSTS.

## Final evidence

- Clean clone: `npm ci` passed with zero vulnerabilities; `npm test` passed 8/8; `npm run build` produced `dist/`.
- Registered claims: all 12 commands passed independently, twice each for mobile and desktop.
- Full Playwright suite: 30/30 passed.
- Axe integration: zero serious or critical findings across home, demo, card, saved cards, privacy, terms, and missing-page views.
- `verify-url.sh`: live home and demo passed with one `h1`, one `main`, `lang=en`, complete alt text, labeled buttons, and zero console errors.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- Payload: initial JS 34,234 bytes raw / 11.32 KB gzip; CSS 18,675 bytes raw / 4.77 KB gzip; mobile hero 60,862 bytes.
- Privacy/offline: live representative flow made zero cross-origin requests; live `/demo` reloaded and remained editable offline.

No finding remains open.
