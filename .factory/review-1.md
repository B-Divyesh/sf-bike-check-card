# Adversarial first-read review 1 — Bike Check Card

**Date:** 2026-08-28
**Target:** <https://bike-check-card.sociobot.in>
**Verdict:** **FAIL**

This review used fresh Chromium contexts on the live URL at 390 × 844 and
1440 × 900, then checked the repository at the supplied base and the built
artifact. Product code was not changed.

## First 30 seconds

Before scrolling, I can infer that this is a form for recording a bike fault,
and the apparent first action is **“Start a check card.”** I cannot answer
clearly *for whom* it is built from the first screen: it names “a mechanic or
community reply,” but never names the cyclist/rider who is meant to use it.
The headline also describes a mood rather than the job.

Exact first-screen text that failed the cold-read check:

> “CATCH THE FAULT BEFORE IT DISAPPEARS.”

> “Record the bike, exact symptom, measurements, ride context and marked-up
> photos in one check card—ready for a mechanic or community reply.”

The latter is 23 words, over the 22-word limit, and does not say that the
visitor is a cyclist making a record before asking for help. The primary
action creates a blank real draft, not a safe sample. Findings F-1-1 and
F-1-2 are therefore release-blocking.

## Findings

### Blocking

#### F-1-1 — The first screen does not state the job and user in plain words

**Location / evidence:** landing hero at both tested viewports. The exact
quotes are above. “Catch the fault before it disappears” is a metaphor/mood
headline, not the job. “Mechanic or community” identifies a possible recipient,
not the cyclist using the tool.

**Why this fails:** A visitor deciding in seconds cannot reliably identify
whether this is for recording their own bike issue, receiving a mechanic's
report, or diagnosing a fault. The first-screen rule requires the job, the
user, and the first action to be clear at once.

**Concrete fix:** Replace the headline with **“Record bike-fault evidence”**.
Use the supporting sentence **“For cyclists who need a clear record before
asking a mechanic or cycling community for help.”** Put **“Try it with sample
data”** beside **“See a completed check card first.”** Add three concise facts:
“No account,” “Saved on this device,” and “Free core card.”

#### F-1-2 — There is no one-click, isolated sample-data demo

**Location / evidence:** the landing page has no “Try it with sample data”
action. In a fresh live context:

- `/?demo=1` rendered the ordinary landing page with zero demo banner, zero
  Reset control, and zero Start-for-real control.
- `/demo` rendered the generic error page with h1 “THIS CARD COULD NOT BE
  OPENED.”
- Clicking “START A CHECK CARD” opened `/?edit=1` with `bike`, `component`,
  and `symptom` all empty. No demo banner was present.
- Source search found no demo route, seed data, `demo:` storage namespace, or
  `@claim:` demo test.

**Why this fails:** The visitor must provide real information before seeing the
product's value. There is no demonstrable storage isolation, reset operation,
or way to confirm that sample work cannot touch real data. This violates the
required demo and makes the required demo-mode offline/privacy check
impossible.

**Concrete fix:** Add `/demo` (and `?demo=1`) that immediately opens a
completed, realistic card—e.g. a steel commuter with an intermittent
wheel-sensor/GPS mismatch, mileage, pressure, timeline, ride context, and an
annotated sample photo. Show a persistent **“Demo — sample data, nothing is
saved”** banner with **“Reset demo”** and **“Start for real.”** Keep all demo
reads/writes under a separate `demo:` IndexedDB namespace, never read the real
draft while it is active, document it in `.factory/demo.md`, and test it from a
fresh context.

#### F-1-3 — Claims are neither registered nor testable

**Location / evidence:** `.factory/claims.json` does not exist. `rg` found no
`@claim:` test tags. Consequently there were zero listed claim commands to run;
the required per-claim clean-sandbox verification cannot occur. `npm test`
passed 7 unit assertions and `npm run test:e2e` passed 10 checks, but neither
is a claim test.

**Unlisted live/README claims:** each of the following is a visitor-relevant
promise with no claims entry or tagged observable test:

- Landing: “Offline field sheet”; “No account”; “Saves locally as you type”;
  “Circle the evidence directly on your photos”; “Bike Check Card does not
  diagnose faults or tell you a bike is safe to ride”; “Everything lives on
  this device until you choose an export”; “Text links use the URL fragment,
  which is not sent to our server, and deliberately leave photos out”; “Works
  offline”; and “no stock imagery or tracking scripts.”
- README introduction: the stated capture fields and the no-diagnosis,
  no-warranty, and no-safety-verdict boundaries.
- README Product behavior: every one of its eight bullets, including
  IndexedDB persistence, local photo processing, private-link behavior,
  print/PDF, JSON backup/import, offline PWA, free-workflow scope, and the $9
  unlock.
- README Architecture/Deployment: small bundle, local IndexedDB/canvas/service
  worker behavior, no CDN/fonts/analytics/accounts/telemetry, immutable asset
  caching, and browser response policies.

**Why this fails:** The claims contract requires exactly one clean-sandbox
test per listed claim, not a generic suite that happens to exercise some
features. Privacy and offline claims specifically require request/offline
evidence through the demo entry point, which does not exist.

**Concrete fix:** Create `.factory/claims.json`; either remove every promise
that cannot be observed or add one tagged test per claim. At minimum cover
offline reload after first demo visit, same-origin-only requests during the
whole demo flow, local photo isolation, fragment links omitting photos, JSON
export/import, and the stated free/paid history limits. Run every `test` value
from a clean checkout and retain the output in handoff.

#### F-1-4 — `/demo` is broken and the required 404 is not a real 404

**Location / evidence:** live `GET /demo` and `GET /missing-page` both return
HTTP 200 with the SPA shell. After JavaScript they show “THIS CARD COULD NOT
BE OPENED.” The route code has no `/demo` branch and maps every non-root,
non-legal path to `invalidShareTemplate('This page does not exist.')`. There
is no `404.html` or Static Web Apps `responseOverrides` configuration.

**Why this fails:** `/demo` is a promised product URL and is broken. A missing
page is reported as a malformed card rather than a designed not-found page,
and search engines/clients receive success instead of 404. This is broken
routing, which is blocking under the site-structure contract.

**Concrete fix:** Implement `/demo` as specified in F-1-2. Add a styled
`/404.html` with a home action and configure `responseOverrides.404` to return
status 404 without using a conflicting routes rewrite. Preserve the SPA
fallback for known application routes only. Add route/status tests for both.

#### F-1-5 — The visible paid action is a dead link

**Location / evidence:** on `/?view=pro`, “BUY SUPPORTER UNLOCK” targets
`https://api.sociobot.in/api/v1/products/bike-check-card/checkout`. A live
followed request returned HTTP 404 JSON. `.factory/handoff.md` also says the
product still requires billing registration before checkout can complete.

**Why this fails:** A visitor is offered a $9 purchase that cannot start. This
is a dead link and an incomplete one-time monetization flow.

**Concrete fix:** Register the product and return URL with the Sociobot billing
API, then add a browser check that the link opens the expected checkout. Until
that exists, remove the buy action and the $9 offer from the public product.

### Major

#### F-1-6 — Route titles and route metadata do not meet the required pattern

**Location / evidence:** after rendering, the landing title is “Catch the
fault before it disappears. — Bike Check Card”; editor is “Build a check card.
— Bike Check Card”; privacy is “Privacy, in plain language. — Bike Check
Card”; and terms is “Terms of use. — Bike Check Card.” None follows
`Product — what it does`; Privacy and Terms are not `Privacy — Product` and
`Terms — Product`. The only meta description is the landing description on all
routes. All checked routes had no canonical link, no Open Graph metadata, and
no Twitter-card metadata.

**Why this fails:** The route location is unclear in browser history, previews
are incomplete, and metadata does not represent individual pages.

**Concrete fix:** Set explicit titles and per-route descriptions, e.g. “Bike
Check Card — record bike-fault evidence”, “Demo — Bike Check Card”, “Privacy
— Bike Check Card”, and “Terms — Bike Check Card”. Add canonical, OG, and
Twitter title/description/image metadata; ship a 1200 × 630 image derived from
the existing original artwork. Test them after every route change.

#### F-1-7 — Route changes do not move focus to the new h1 or announce it

**Location / evidence:** after an in-app navigation to `/?view=history`, the
live page rendered “MY CHECK CARDS.” but `document.activeElement` was `BODY`.
The only `aria-live` region was the empty toast. Back navigation also left
focus on `BODY`. `navigate()` calls `renderRoute()` and scrolls, but no code
focuses the new h1 or announces navigation.

**Why this fails:** Screen-reader and keyboard users receive neither a focus
handoff nor a route announcement. It also makes the page change less obvious
after Back/Forward.

**Concrete fix:** After each route render, focus the new h1 (with
`tabindex="-1"`) and set a dedicated polite route-announcer to its text. Test
click, Back, Forward, deep link, and scroll restoration.

#### F-1-8 — The shared header/footer does not provide the required navigation
and factory handoff information

**Location / evidence:** the shared header contains “Draft,” “My cards,” and
“Unlock,” but no Demo or Privacy link. The footer has Privacy and Terms but no
“Built by Param Factory” or version/build identifier. The header labels are
nouns, not result-naming actions.

**Why this fails:** Visitors cannot find the required try-before-entering-data
route or the privacy information from the primary navigation. The required
consistent skeleton is incomplete.

**Concrete fix:** Use header links “Try demo,” “Open draft,” “Saved cards,” and
“Privacy.” Keep the wordmark home link. Add the product one-line description,
Privacy, Terms, “Built by Param Factory,” and a build/version identifier in
every footer.

#### F-1-9 — The landing and README contain first-read copy failures

**Location / evidence and concrete rewrites:** See the complete audited
inventory below. The flagged text has one of: a 22-word-limit breach, jargon,
an inconsistent term, a metaphor/mood heading, or a non-result button.

- “CATCH THE FAULT BEFORE IT DISAPPEARS.” → “Record bike-fault evidence.”
- The 23-word hero sentence → “For cyclists who need a clear fault record
  before asking for help.”
- “Draft” → “Open draft”; “My cards” → “View saved cards”; “Unlock” → “Unlock
  unlimited history.”
- “OFFLINE FIELD SHEET” → “Offline bike-fault record”; “Evidence kit,
  assembled.” → delete; “Original generated collage.” → “Original artwork for
  Bike Check Card.”
- “FOUR MOVES. ONE USEFUL HANDOFF.” → “How to make a check card”; “Name it,”
  “Describe it,” “Measure it,” and “Mark it” → “Add bike and component,”
  “Describe the symptom,” “Add measurements,” and “Mark photos.”
- “A RECORD, NOT A GREEN LIGHT.” → “This card is not safety advice.”
- “PRIVATE BY CONSTRUCTION” → “Your data and photos”; “YOUR PHOTOS STAY IN
  YOUR POCKET.” → “Photos stay on this device.”
- “Made for clear handoffs, not safety verdicts.” → “Record bike-fault
  evidence for a mechanic or cycling community.”
- Split the README 25-, 23-, 26-, 38-, and 42-word sentences at the natural
  clause boundaries; replace “field sheet,” “PWA,” “IndexedDB,” “Sociobot
  billing API,” and “static entry points” with plain-language explanations or
  reserve them for technical documentation.

**Why this fails:** The copied phrases either do not explain the section out of
context, make the reader decode workshop metaphors, or make an unverified
promise. This conflicts directly with the first-read brief.

### Minor

#### F-1-10 — The sitemap omits the required demo route

**Location / evidence:** `public/sitemap.xml` lists only `/`, `/privacy`, and
`/terms`.

**Why this fails:** Once `/demo` exists it will be a real public route but will
not be discoverable from the sitemap.

**Concrete fix:** Add `/demo` when implementing it and test the sitemap URL
list against all public routes.

## Complete copy audit

Word counts treat hyphenated and slash-separated terms as separate readable
words. Labels/headings are included because a screen reader exposes them as
standalone content. A dash means no plain-words flag beyond the unlisted-claim
finding F-1-3.

### Landing page

| Text | Words | Audit note |
| --- | ---: | --- |
| Bike Check Card | 3 | Product name. |
| Draft | 1 | F-1-9: noun button; use “Open draft.” |
| My cards | 2 | F-1-9: noun button; use “View saved cards.” |
| Unlock | 1 | F-1-9: unclear action; use “Unlock unlimited history.” |
| Offline field sheet | 3 | F-1-9: jargon; use “Offline bike-fault record.” |
| No account | 2 | Plain fact; F-1-3 unlisted claim. |
| Catch the fault before it disappears. | 6 | F-1-1/F-1-9: metaphor; use “Record bike-fault evidence.” |
| Record the bike, exact symptom, measurements, ride context and marked-up photos in one check card—ready for a mechanic or community reply. | 23 | F-1-1/F-1-9: over 22 words and user unnamed; use proposed hero sentence. |
| Start a check card | 4 | Result-naming, but F-1-2: opens a blank real card rather than a demo. |
| Saves locally as you type | 5 | F-1-3: unlisted storage claim. |
| Evidence kit, assembled. | 3 | F-1-9: mood caption; delete. |
| Original generated collage. | 3 | F-1-9: incomplete provenance; use “Original artwork for Bike Check Card.” |
| Four moves. | 2 | F-1-9: no section meaning; use “How to make a check card.” |
| One useful handoff. | 3 | F-1-9: mood slogan; remove. |
| Name it | 2 | F-1-9: vague heading; use “Add bike and component.” |
| Bike and exact component. | 4 | Usable description. |
| Describe it | 2 | F-1-9: vague heading; use “Describe the symptom.” |
| What happened, when, and under what load. | 7 | Usable description. |
| Measure it | 2 | F-1-9: vague heading; use “Add measurements.” |
| Pressure, distance, wheel and GPS readings. | 6 | Usable description. |
| Mark it | 2 | F-1-9: vague heading; use “Mark photos.” |
| Circle the evidence directly on your photos. | 7 | F-1-3: unlisted feature claim. |
| A record, not a green light. | 6 | F-1-9: metaphor; use “This card is not safety advice.” |
| Bike Check Card does not diagnose faults or tell you a bike is safe to ride. | 16 | F-1-3: unlisted safety-boundary claim. |
| If you are unsure, pause and ask a qualified mechanic. | 10 | Usable safety instruction. |
| Private by construction | 3 | F-1-9: jargon; use “Your data and photos.” |
| Your photos stay in your pocket. | 6 | F-1-9: metaphor; use “Photos stay on this device.” |
| Everything lives on this device until you choose an export. | 10 | F-1-3: unlisted privacy claim. |
| Text links use the URL fragment, which is not sent to our server, and deliberately leave photos out. | 18 | F-1-3: unlisted privacy/export claim. |
| Made for clear handoffs, not safety verdicts. | 7 | F-1-9: slogan; use the concrete footer one-liner above. |
| Works offline. | 2 | F-1-3: unlisted offline claim. |
| Privacy | 1 | Clear legal link. |
| Terms | 1 | Clear legal link. |
| Hero artwork was generated for this product; no stock imagery or tracking scripts. | 13 | F-1-3: unlisted provenance/privacy claim. |

### README

| Text | Words | Audit note |
| --- | ---: | --- |
| Bike Check Card | 3 | Product name; add a plain job subtitle. |
| Bike Check Card is a private, offline field sheet for cyclists who need to document a fault before asking a mechanic or community for help. | 25 | F-1-9: over 22 words and “field sheet” jargon; split and use “record.” |
| It captures the bike and component, symptoms and timeline, ride context, pressure/mileage, wheel-sensor versus GPS readings, and locally annotated photos. | 22 | At cap; F-1-3 unlisted capability claim. |
| It organizes evidence; it does not diagnose a fault, recommend replacement, confirm warranty eligibility, or tell anyone a bicycle is safe to ride. | 23 | F-1-9: over 22 words; split after “evidence.” Also F-1-3. |
| Product behavior | 2 | Clear section heading. |
| The live draft and saved snapshots use IndexedDB and survive refreshes. | 11 | F-1-3; technical term needs a plain-language gloss. |
| Photos are resized in the browser and stay on the device. | 11 | F-1-3. |
| “Copy private link” puts text in a URL fragment, which is not sent to the server. | 16 | F-1-3; explain “fragment” as “the part after #.” |
| Photos are deliberately excluded; anyone with the link can read its contents. | 12 | F-1-3. |
| “Print / save PDF” uses the browser print dialog and can include photos. | 12 | F-1-3. |
| JSON backup/import moves the complete card, including photos, without a service account. | 13 | F-1-3; replace “JSON” with “downloadable backup” first. |
| The installed PWA works offline after its first successful load. | 10 | F-1-3; “PWA” is jargon. |
| The free edition includes the full workflow, all exports, and one saved snapshot. | 13 | F-1-3. |
| The optional $9 one-time supporter license unlocks unlimited local history through the Sociobot billing API. | 16 | F-1-3 and F-1-5; live purchase fails. |
| Develop and verify | 3 | Clear section heading. |
| Requires a current Node.js release. | 6 | Clear technical instruction. |
| `npm run build` is the deployment command. | 7 | Clear technical instruction. |
| It creates `dist/` with `index.html` at its root and direct static entry points for `/privacy` and `/terms`. | 18 | F-1-9: “static entry points” is jargon; simplify. |
| The Playwright suite uses the preinstalled Chromium build and checks phone/desktop workflows, IndexedDB persistence, photo annotation, serious/critical axe findings, and an explicit offline reload. | 26 | F-1-9: over 22 words and technical jargon; split by test area. |
| Architecture | 1 | Clear section heading. |
| Vite and strict vanilla TypeScript keep the initial app bundle small. | 11 | F-1-3; technical claim belongs in architecture note. |
| IndexedDB stores records, Canvas provides photo markup, and a hand-written service worker precaches the versioned shell. | 17 | F-1-3; technical jargon, split/explain. |
| There are no runtime CDN resources, third-party fonts, analytics, accounts, or telemetry ingestion. | 14 | F-1-3; plain enough but untested promise. |
| The researched scope is in `.factory/brief.json`, the cassette-era visual system and artwork provenance are in `.factory/design.md`, and verification notes are in `.factory/handoff.md`. | 38 | F-1-9: over 22 words; use three bullets. |
| Deployment | 1 | Clear section heading. |
| Publish the contents of `dist/` as a static site. | 9 | Clear technical instruction. |
| `staticwebapp.config.json` is included in the build for Azure Static Web Apps: content-hashed `/assets/*` receive one-year immutable caching, while HTML and `sw.js` revalidate so updates remain discoverable; it also declares the manifest media type and browser response policies. | 42 | F-1-9: over 22 words and technical jargon; split into short operational bullets. Also F-1-3. |
| The factory owns DNS, infrastructure, and registration of the Sociobot product slug; this repository does not provision them. | 18 | F-1-9: “product slug” jargon; say “The factory registers the product for billing.” |
| License | 1 | Clear section heading. |
| MIT. | 1 | Clear legal label. |
| See [LICENSE](LICENSE). | 3 | Clear instruction. |

## Demo, privacy, and sandbox result

The normal, fresh landing-page request log contained only same-origin requests
for `/`, the JavaScript and CSS bundles, and the hero WebP. This is useful
normal-mode evidence, but it does **not** verify the required demo privacy
claim because there is no demo entry point. No assertion can be made about
demo storage isolation, reset behavior, or demo offline operation; all are
blocked by F-1-2.

## Claims test result

There is no `.factory/claims.json`, so no listed command existed to execute.
For general regression context only, these commands passed from a clean
dependency installation:

```sh
npm ci
npm test          # 7 passed
npm run build     # passed; dist/ produced
npm run test:e2e  # 10 passed
```

Those results do not clear F-1-3 because none is tagged `@claim:<id>` and none
uses a demo sandbox.

## Earlier-review and history check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The earlier verification reports did contain three deployment findings. I
rechecked each against live responses and repository configuration:

| Earlier finding | Live/code confirmation | Status |
| --- | --- | --- |
| Hashed assets were not immutable | `/assets/index-DBGM03TC.js` returns `Cache-Control: public, max-age=31536000, immutable`; matching `/assets/*` policy is in `public/staticwebapp.config.json`. | Fixed. |
| Manifest had the wrong media type | `/manifest.webmanifest` returns `application/manifest+json; charset=utf-8`; matching `mimeTypes` setting is present. | Fixed. |
| Security response policies were incomplete | Live response has CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions-Policy, nosniff, strict referrer policy, and one-year HSTS. | Fixed. |

No prior finding was merely accepted without verification. These repaired
deployment findings do not offset the new failures above.

## Structure and visual identity check

- `lang`, one `h1`, a `main`, favicon, Apple touch icon, robots file, and the
  basic description are present. Privacy and Terms load successfully.
- The original cassette-workshop-zine visual language is distinct and matches
  `.factory/design.md`; it is not a generic SaaS template.
- The missing canonical/OG/Twitter metadata, wrong dynamic title pattern,
  missing demo route, generic HTTP-200 not-found response, missing focus
  handoff, incomplete navigation/footer, and omitted demo sitemap route remain
  findings F-1-4 and F-1-6 through F-1-10.

## Missed leverage check

No additional AI feature is required by the brief: this is deliberately an
evidence recorder, not a diagnostic tool. Export/import already exists, and
cloud sync would conflict with the local-first privacy direction. The expected
valuable try-before-entering-data feature is the missing isolated demo in
F-1-2, not decorative AI.

## What would make this perfect

Make the opening screen say exactly who records what and why, then let that
person open a completed sample card in one click without touching any real
data. Prove each promise with a clean-demo claim test, restore a working paid
checkout or remove it, and finish the public route/metadata/focus/404 skeleton.
With those changes, the strong local-first evidence-capture interaction and
distinct workshop-zine identity would have a clear, honest first-time path.
