# Record bike-fault evidence — independent verification 4

**VERDICT: PASS — 0 findings and 0 untested claims.**

Verified on 2026-09-06 against <https://bike-check-card.sociobot.in>.
Product code was not changed.

- Implementation candidate: `6dafa460185582dff7e7d6e044e50fffd057e2bc`
- Post-deploy test revision: `d9a35c910ad6cf4741aac06efcf85650ab58db83`
- Documentation baseline reviewed: `893ecb827756fe33d1b6435e617a716bc86f0468`

Commits after the implementation candidate change tests and reports only. A
clean build at the documentation baseline produced the same JavaScript, CSS,
service worker, manifest, and offline-page bytes as the live deployment.

## First screen and sample

Fresh 390 × 844 phone and 1440 × 900 desktop contexts showed the required
information before scrolling:

- Job: **Record bike-fault evidence**.
- Audience: cyclists making a clear record before asking a mechanic or cycling
  community for help.
- First action: **Try it with sample data**.
- Expected result: **See a completed check card first**.
- Facts: no account, saved on this device, and free to use.

The action opened a populated steel-commuter card with component, symptom,
mileage, pressure, wheel and GPS readings, timeline, context, notes, next step,
and a marked photo. The **Demo — sample data, nothing is saved** label remained
after editing. Reset restored the shipped sample. Starting for real restored a
temporary real draft unchanged. The fresh profile contained separate
`bike-check-card` and `demo:bike-check-card` databases, and closing it removed
the temporary test state.

Evidence: `/work/.evidence/verification-4/home-phone.png`,
`home-desktop.png`, `demo-phone.png`, `demo-desktop.png`, and
`manual-live-corrected.json`.

## Clean-checkout gates

A fresh clone of `main` at the documentation baseline was used.

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

The registry has 20 unique ids and exactly one matching `@claim:<id>` test for
each id. No unregistered claim tag exists.

## Declared claims

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `core-capture` | Pass | Completed sample contains every promised evidence type and a marked photo. |
| `demo-isolation` | Pass | Reset affects only demo storage; the real draft returns unchanged. |
| `no-account` | Pass | The sample workflow is usable without sign-in or credential fields. |
| `local-save` | Pass | A real draft survives reload. |
| `saved-card-reload` | Pass | A named saved card remains listed after reload. |
| `offline-reload` | Pass | After service-worker control, the sample reloads and remains editable offline. |
| `photo-local` | Pass | A photo is added and marked in IndexedDB with same-origin requests only. |
| `share-prerequisites` | Pass | Sharing fails below the four-part minimum and succeeds with a `0 km` measurement. |
| `six-photo-limit` | Pass | Six photos work, a seventh fails, and a replacement works after removal. |
| `photo-formats` | Pass | JPG and PNG work; WebP, text, and a mixed invalid batch fail without mutation; recovery works. |
| `photo-size-limit` | Pass | Exactly 10 MiB works, 10 MiB plus one byte fails, and a later valid photo works. |
| `fragment-share` | Pass | Shared data stays after `#`, the document request omits it, and photos are omitted. |
| `json-backup` | Pass | Export, reset, and import restore text and photo content. |
| `print-photos` | Pass | The completed sample photo remains visible under print media. |
| `original-photo-unchanged` | Pass | The stored original is byte-for-byte unchanged after marking; the marked copy is separate. |
| `site-data-clear` | Pass | Browser site-data clearing removes the real draft and saved card. |
| `same-origin` | Pass | The full sample reset/edit/save flow makes only same-origin requests. |
| `safety-boundary` | Pass | Landing and editor state the boundary and expose no diagnosis or safe-to-ride action. |
| `free-use` | Pass | Product routes contain no checkout, purchase, payment, or subscription prompt. |
| `print-card` | Pass | The print action invokes the browser print function. |

The live product and README were cross-checked against this registry. All
public outcome, privacy, limit, persistence, export, and offline statements map
to the claims above. **Untested public claims: 0.**

## Normal, invalid, boundary, and recovery paths

- A complete card can be edited, saved, reopened after reload, shared, printed,
  backed up, reset, and restored.
- An incomplete card names the missing sharing requirements. The exact minimum
  succeeds.
- Valid photo types and size/count boundaries behave as stated. Invalid input
  is rejected atomically and a later valid upload succeeds.
- A malformed backup says: “This is not a Bike Check Card backup. Choose an
  exported Bike Check Card JSON file.” A valid backup works afterward.
- A malformed shared link says: “This shared card link is damaged. Ask the
  sender to copy a new link.” The home action works. No parser detail appears.
- The empty saved-card state, persisted saved card, and site-data removal path
  pass.

## Accessibility, privacy, PWA, and structure

- The Playwright Axe integration found zero serious or critical issues on
  home, demo, editor, saved cards, privacy, terms, and the missing page in both
  browser projects.
- `/opt/fleet/lib/verify-url.sh` passed home and demo: title, `lang=en`, one
  `h1`, one `main`, image alternatives, named buttons, and zero console errors.
- Tab reaches the skip link first. Its 3 px ink outline and 6 px yellow ring are
  visible. Enter moves focus to `main`. Route navigation and browser history
  focus the new `h1`.
- The photo dialog opens with focus on its close button and closes with Escape.
  Native modal behavior keeps background controls unavailable.
- Reduced motion changes transitions to `0.00001s` and scrolling to `auto`.
- At phone width, controls remain usable. The repaired wordmark is 181.30 × 44
  px, footer Privacy is 52.56 × 44 px, and Terms is 44 × 44 px. The only
  smaller DOM controls are visually hidden file inputs with 44+ px labelled
  controls; the privacy email is an inline-text exception.
- All six public routes return 200 with route-specific titles, one `h1`, one
  `main`, and `lang=en`. All crawled internal links return 200.
- `/missing-verification-4` deliberately returns HTTP 404 and renders the
  designed not-found page with a route home. This expected 404 is not a defect.
- Normal product flows request only `bike-check-card.sociobot.in`; no analytics,
  trackers, remote fonts, ads, or third-party scripts load.
- Offline reload works after the first visit. The manifest provides standalone
  display, a versioned start URL, palette colors, 192/512 icons, and a maskable
  icon. The service worker precaches the shell and implements an update prompt.
- HTML, service worker, and manifest revalidate. Hashed assets use one-year
  immutable caching. The manifest MIME type and CSP, frame, permissions,
  referrer, nosniff, and one-year HSTS policies are present.

## Candidate identity and performance

Local and live SHA-256 values match:

| Asset | SHA-256 |
| --- | --- |
| `assets/index-IHLJCNw3.js` | `14267e158346cdd0e32ffb409a85d8b6fef21f47d70c90a4885e5ff49db03689` |
| `assets/index-CcBWBdLs.css` | `e4ee82794d533dfbb8bddf5db8201d57023894019a6716812036e39f3a221920` |
| `sw.js` | `d9f966a30cae649e9f6d99f1d2b5917ad4c408fdc1eb694992c59124cc709779` |
| `manifest.webmanifest` | `cf30648e9b6de347677a1e105b51b28ba118417a92214945630a21024ec3443a` |
| `offline.html` | `81d05db774fcf9f47bc1b04fb4edf9c9d9368b2e774646572f88c0022f6408f9` |

Initial JavaScript is 34,339 bytes raw / 11.38 KB gzip, CSS is 18,813
bytes raw / 4.79 KB gzip, and the phone hero is 60,862 bytes. No font payload
ships.

Fresh Lighthouse 13 mobile results:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 2.1 s |
| TBT | 10 ms |
| CLS | 0 |

## Earlier finding disposition

| Earlier finding | Disposition |
| --- | --- |
| Review 1 F-1-1 through F-1-10 | Fixed and rechecked: first-read clarity, isolated demo, claim registry, routes/404, removed paid action, metadata, route focus, shared shell, plain copy, and sitemap all pass. |
| Verification 1 deployment findings | Fixed and rechecked: cache policy, manifest MIME type, and browser security headers pass live. |
| Review 3 F-3-1 | Fixed: the four share/photo boundary claims pass locally and live. |
| Verification 3 V3-1 | Fixed: saved-card reload, print photos, unchanged originals, and site-data clearing each have one registered outcome test and pass. |
| Verification 3 V3-2 | Fixed: wordmark and footer legal targets measure at least 44 × 44 px in phone and desktop contexts. |
| Verification 3 V3-3 | Fixed: malformed backup and shared-link paths show plain recovery text, hide parser details, and recover normally. |

No missed AI feature is warranted. The product's job is structured evidence
capture, and generated diagnosis would conflict with its explicit safety
boundary. Cloud sync would also weaken the stated local-first design.

## Findings and result

No blocking, major, minor, or advisory finding remains. There are no untested
claims.

**FINAL VERDICT: PASS — 0 findings and 0 untested claims.**

Machine-readable and screenshot evidence is under
`/work/.evidence/verification-4/`.
