# Bike Check Card — verification handoff

Work order: `bike-check-card-verify-2`
Verified: 2026-08-28
Candidate: `60a17a65f2cb4970df223b0928fc502666d5a17c`
Live URL: <https://bike-check-card.sociobot.in>

## Independent final result: PASS

Fresh independent QA passed from a clean checkout. The live deployment byte
matches the candidate; the previous deployment-only cache/header finding is
fixed. No product code was changed during verification, and no release-blocking,
high, medium, or low defects were found.

`npm ci`, `npm test` (7/7), `npm run typecheck`, `npm run lint`, `npm run
build`, `npm run test:e2e` (10/10 desktop/Pixel 5), and `npm audit --omit=dev`
all passed. Live QA covered complete evidence capture, local photo annotation,
fragment sharing/PDF, JSON backup/import, invalid input recovery, persistence,
offline reload/editing, service-worker update toast, 390px layout, keyboard
focus, reduced motion, axe, console errors, privacy requests, headers, caching,
identity, and budgets. Lighthouse mobile: 99 Performance / 100 Accessibility /
100 Best Practices / 100 SEO. See `.factory/verification-2.md` for exact
evidence and policy values.

## Intentional limits / next steps

No follow-up is required for release. This remains an evidence recorder—not
safety advice, diagnosis, or a warranty workflow. Browser print supplies PDF;
private text links omit photos; factory billing registration remains necessary
before the optional supporter checkout can complete.

---

# Prior repair handoff

Work order: `bike-check-card-repair-1`
Completed: 2026-08-28
Base verifier report: `c8429535b1f1e45f138eaba92478202c363c1332`
Repair commit: `b28029a` (`fix: enforce static response policies`)

## Final result: PASS

The release-blocking deployment finding is repaired and deployed to
<https://bike-check-card.sociobot.in>. The artifact remains a Vite + TypeScript,
local-first PWA deployed as a static site. The researched scope and all
previously passing evidence-card behavior were retained.

## Repairs

- Added `public/staticwebapp.config.json`, which is shipped with `dist/` and
  consumed by Azure Static Web Apps.
- Hashed `/assets/*` now use `Cache-Control: public, max-age=31536000,
  immutable`; app-shell responses, including `/` and `/sw.js`, use `public,
  max-age=0, must-revalidate` so updates remain discoverable.
- `.webmanifest` now has `Content-Type: application/manifest+json;
  charset=utf-8`.
- Added a restrictive same-origin CSP, `X-Frame-Options: DENY`, restrictive
  Permissions-Policy, `nosniff`, strict referrer policy, and one-year preload
  HSTS.
- Added exact regression tests for the deployment configuration and added a
  keyboard test for the skip-link focus handoff. The test exposed that `<main>`
  was not focusable after skip-link activation, so every routed main landmark
  now has `tabindex="-1"` and the skip link focuses and scrolls it explicitly.

## Verification

Clean install and local quality gates on 2026-08-28:

```sh
npm ci                         # 61 packages; 0 vulnerabilities
npm test                       # 7/7 passed (includes 2 response-policy regressions)
npm run lint                   # tsc --noEmit passed
npm run build                  # passed; dist/ created
npx playwright test --workers=2 # 10/10 passed, Desktop Chromium + Pixel 5
npm audit --omit=dev           # 0 vulnerabilities
```

- Browser coverage exercised the complete local draft flow, persisted fields,
  photo markup, serious/critical axe checks on home/editor/privacy/terms,
  Desktop and 390px layouts, keyboard skip-link behavior, service-worker
  offline reload, and continued offline editing.
- Live browser smoke test: HTTP 200 in 652 ms; zero page/console errors;
  `lang=en`, one `h1`, a `main`, zero missing image alt attributes, and zero
  unlabeled buttons. A live 390px session had zero horizontal overflow; the
  skip link was first in tab order and moved focus to `main`; service-worker
  control was active; offline reload retained `Live offline tourer`; observed
  requests were only to `https://bike-check-card.sociobot.in`.
- Lighthouse 13.4.1 on the live site: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 2.1 s, TBT 10 ms, CLS 0.
- Update behavior is unchanged from the independent verifier's controlled
  service-worker update test. The current live browser session confirmed a
  controlling service worker; the repair only changes response policy and the
  keyboard focus handoff.

## Live deployment evidence

Deployment used `/opt/fleet/lib/deploy-static.sh bike-check-card dist` and
Azure Static Web Apps deployment `771d214d-ea48-4d5d-b70b-20c8e96f2fa3`.

| Resource | Content type | Cache-Control |
| --- | --- | --- |
| `/` | `text/html` | `public, max-age=0, must-revalidate` |
| `/sw.js` | `text/javascript` | `public, max-age=0, must-revalidate` |
| `/manifest.webmanifest` | `application/manifest+json; charset=utf-8` | `public, max-age=0, must-revalidate` |
| `/assets/index-DBGM03TC.js` | `text/javascript` | `public, max-age=31536000, immutable` |
| `/assets/index-kiKF1L1N.css` | `text/css` | `public, max-age=31536000, immutable` |
| `/assets/hero-zine-720.webp` | `image/webp` | `public, max-age=31536000, immutable` |

Live response also contains the configured CSP with `frame-ancestors 'none'`,
`X-Frame-Options: DENY`, `Permissions-Policy: camera=(), geolocation=(),
microphone=(), payment=(), usb=()`, and `Strict-Transport-Security:
max-age=31536000; includeSubDomains; preload`.

SHA-256 identity matched local `dist/` to production for `/`, `/sw.js`,
`/manifest.webmanifest`, `/offline.html`, `/privacy`, `/terms`, both generated
bundles, and both production WebP assets. Example final bundle identity:
`/assets/index-DBGM03TC.js` =
`1dcdbc152bf59f4fdbee37845c61a68da40a5198dbbf612a50184f75e4358455`.

## Known product constraints

- The factory must register `bike-check-card` with the Sociobot billing engine
  and configure its return URL before checkout can complete in production. No
  payment-provider code or product ID is embedded here.
- Browser print is the PDF implementation, so page controls depend on the
  browser. Photos intentionally remain out of share links; use print/PDF or
  JSON backup when they must travel.
- The app remains an evidence recorder, not a diagnosis, safety verdict,
  warranty workflow, telemetry system, cloud sync product, or social feed.
