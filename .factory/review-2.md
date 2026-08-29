# Adversarial first-read review 2 — Bike Check Card

**Date:** 2026-08-29
**Target:** <https://bike-check-card.sociobot.in>
**Verdict:** **PASS**

This was a fresh review of the live site at 390 × 844 and 1440 × 900, plus a
clean clone of `fc077313c8094dff9e3013f5302f89e92c548596`. Product code was
not changed.

## First 30 seconds

| Question | Cold-read answer | Exact first-screen evidence |
| --- | --- | --- |
| What does it do? | It records evidence about a bike fault. | “Record bike-fault evidence” |
| Who is it for? | Cyclists preparing to ask a mechanic or cycling community for help. | “For cyclists who need a clear record before asking a mechanic or cycling community for help.” |
| What should I click first? | Try the completed, safe sample. | “Try it with sample data” and “See a completed check card first.” |

The same first screen gives the usable facts “No account,” “Saved on this
device,” and “Free to use.” At 390 px there was no horizontal overflow; the
action and its outcome remained above the first scroll.

## Findings

None. There are zero blocking, major, or minor findings.

## Demo and sandbox

`/demo` and `/?demo=1` open a completed steel-commuter card immediately. The
first screen after entry has the completed bike, Sensor / computer component,
wheel/GPS symptom, 4 / 4 essentials, and a marked sample photo.

The persistent banner says “Demo — sample data, nothing is saved,” explains
that changes use a separate demo workspace, and provides both “Reset demo” and
“Start for real.” A fresh live context confirmed the two browser databases:
`bike-check-card` and `demo:bike-check-card`. Reset restored the sample only;
Start for real restored the untouched real draft. A five-run rapid reset then
start-real check also preserved each real draft.

A live request log covering real-card entry, demo entry, reset, and return to
the real card contained only `https://bike-check-card.sociobot.in`. After the
service worker controlled `/demo`, an offline reload retained the sample and
accepted an edited pressure value. No product-route page or console error
occurred. An unknown URL correctly returned HTTP 404 and rendered the designed
not-found page.

## Claims

`.factory/claims.json` contains 12 claims. Source inspection found exactly one
matching `@claim:<id>` test for each id. From a clean clone in
`/tmp/bike-check-card-review-wlgCUz`, `npm ci`, `npm test`, and `npm run build`
passed; the build produced `dist/`.

Every listed command passed in both configured Playwright projects:

| Claim id | Result |
| --- | --- |
| `core-capture` | Pass |
| `demo-isolation` | Pass |
| `no-account` | Pass |
| `local-save` | Pass |
| `offline-reload` | Pass |
| `photo-local` | Pass |
| `fragment-share` | Pass |
| `json-backup` | Pass |
| `same-origin` | Pass |
| `safety-boundary` | Pass |
| `free-use` | Pass |
| `print-card` | Pass |

The full browser suite then passed **30/30**. The live landing page and README
were cross-checked against the registry. Their visitor-reliance statements map
to the registered capture, isolation, account, local-save, offline, photo,
share, backup, privacy, safety, free-use, or print claims. No unlisted product
claim remains.

## Copy audit

Counts treat hyphenated words as separate readable words. Labels, headings,
buttons, and meaningful alt text are included because visitors and assistive
technology encounter them independently. No item exceeds 22 words. No jargon,
marketing adjective, unexplained heading, mood slogan, inconsistent product
term, or non-result-naming button was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Bike Check Card | 3 | Pass |
| Try demo | 2 | Pass |
| Open draft | 2 | Pass |
| Saved cards | 2 | Pass |
| Privacy | 1 | Pass |
| Bike fault record | 3 | Pass |
| Record bike-fault evidence | 4 | Pass |
| For cyclists who need a clear record before asking a mechanic or cycling community for help. | 15 | Pass |
| Try it with sample data | 6 | Pass |
| See a completed check card first. | 6 | Pass |
| Start a blank card | 4 | Pass |
| No account | 2 | Pass |
| Saved on this device | 4 | Pass |
| Free to use | 3 | Pass |
| Zine-style workbench with a bicycle wheel, pressure gauge, fault photos and a marked evidence sheet | 16 | Pass — useful alt text |
| Original artwork for Bike Check Card. | 6 | Pass — provenance caption |
| How to make a check card | 7 | Pass |
| Add bike and component | 4 | Pass |
| Name the bike and exact part. | 6 | Pass |
| Describe the symptom | 3 | Pass |
| Record what happened and when. | 5 | Pass |
| Add measurements | 2 | Pass |
| Record pressure, distance, wheel, or GPS readings. | 7 | Pass |
| Mark photos | 2 | Pass |
| Circle the evidence on a photo. | 6 | Pass |
| This card is not safety advice | 6 | Pass |
| It records evidence. | 3 | Pass |
| It does not diagnose faults or tell you a bike is safe to ride. | 13 | Pass |
| If you are unsure, pause and ask a qualified mechanic. | 10 | Pass |
| Your data and photos | 4 | Pass |
| Photos stay on this device | 5 | Pass |
| Your card stays in this browser until you export it. | 10 | Pass |
| Shared text links leave photos out. | 6 | Pass |
| Record bike-fault evidence for a mechanic or cycling community. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v1.1.0 · polish-1 | 2 | Pass — build identifier |
| Original generated artwork. | 3 | Pass — provenance |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Bike Check Card | 3 | Pass |
| Record bike-fault evidence before asking a mechanic or cycling community for help. | 13 | Pass |
| Bike Check Card records the bike, component, symptom, ride context, measurements, timeline, and marked photos. | 15 | Pass |
| It does not diagnose faults or decide whether a bike is safe. | 12 | Pass |
| Try the isolated sample: | 4 | Pass |
| Who it is for | 4 | Pass |
| It is for cyclists who want a clear record before asking for help. | 13 | Pass |
| No account is required, and the app is free to use. | 11 | Pass |
| What it does | 4 | Pass |
| Real drafts and saved cards stay in this browser. | 9 | Pass |
| Demo changes use a separate browser database and never alter the real draft. | 13 | Pass |
| Photos can be added and marked without uploading them. | 9 | Pass |
| Shared text links use the URL fragment and leave photos out. | 10 | Pass |
| JSON backup exports and restores the complete card. | 8 | Pass |
| The print action sends the completed card to the browser print dialog. | 12 | Pass |
| The app works offline after the first visit. | 8 | Pass |
| The app loads no analytics, remote fonts, ads, or tracking scripts. | 10 | Pass |
| Every statement above has a tagged browser test in `.factory/claims.json`. | 11 | Pass |
| Run and test | 3 | Pass |
| Use a current Node.js release. | 6 | Pass |
| `npm run build` creates `dist/` with `index.html` at its root. | 11 | Pass |
| The browser suite uses Playwright 1.58.2 and its installed Chromium. | 10 | Pass |
| Run one claim by its id: | 7 | Pass |
| Routes | 1 | Pass |
| `/` explains the product and offers the sample. | 8 | Pass |
| `/demo` opens the isolated completed sample. | 5 | Pass |
| `/card` opens the real draft. | 4 | Pass |
| `/cards` opens saved cards. | 4 | Pass |
| `/privacy` and `/terms` explain data handling and use. | 8 | Pass |
| Unknown paths use the product-specific 404 page. | 7 | Pass |
| Build and deployment | 3 | Pass |
| The app uses Vite and strict TypeScript. | 7 | Pass |
| Browser storage holds cards, and a service worker provides offline reloads. | 11 | Pass |
| Publish the contents of `dist/` as a static site. | 9 | Pass |
| The included hosting configuration sets caching, content types, security headers, and the 404 response. | 14 | Pass |
| The factory owns DNS and deployment. | 6 | Pass |
| This repository does not change infrastructure, billing, or DNS. | 8 | Pass |
| Product records | 2 | Pass |
| Opportunity brief | 2 | Pass |
| Visual design and artwork provenance | 5 | Pass |
| Demo sandbox | 2 | Pass |
| Repair evidence | 2 | Pass |
| Handoff | 1 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

Code samples and URLs are executable references rather than reader-facing
sentences; they were checked by the clean-clone commands above.

## Earlier findings and history

All earlier `.factory/review-*.md`, `.factory/polish-*.md`, verification
reports, and handoff notes were read. Each prior finding was checked on the
live site and in source, not accepted on documentation alone.

| Earlier id | Live and code confirmation | Status |
| --- | --- | --- |
| F-1-1 | Plain job headline, cyclist audience, sample action, outcome text, and three facts appear above the fold. | Fixed |
| F-1-2 | `/demo` / `?demo=1` show a completed isolated sample, banner, reset, and start-real controls. | Fixed |
| F-1-3 | Twelve registered claims each have one tagged test; all passed from the clean clone. | Fixed |
| F-1-4 | `/demo` returns 200; an unknown route returns HTTP 404 and renders the product-specific not-found page. | Fixed |
| F-1-5 | No checkout, payment, or supporter prompt remains; the free-use claim passed. | Fixed |
| F-1-6 | Each route has a route-specific title, description, canonical, OG/Twitter metadata, and social image. | Fixed |
| F-1-7 | Client navigation and Back move focus to the new h1 and update the polite announcement. | Fixed |
| F-1-8 | Header has Demo, draft, saved-card, and Privacy navigation; footer has legal links, factory credit, and build id. | Fixed |
| F-1-9 | The full copy inventory above is plain, consistent, and within the word limit. | Fixed |
| F-1-10 | Live sitemap lists `/`, `/demo`, `/card`, `/cards`, `/privacy`, and `/terms`. | Fixed |
| Earlier verification: caching, manifest MIME, and browser policies | Live headers show revalidated HTML, immutable assets, manifest MIME, CSP/frame denial, permissions policy, nosniff, strict referrer policy, and one-year HSTS. | Fixed |

## Structure, routing, and identity

The live link crawl returned 200 for every product link (`/`, `/demo`,
`/card`, `/cards`, `/privacy`, `/terms`) and correctly treated the email link
and skip hashes as explicit non-HTTP links. Every checked route had one `h1`,
one `main`, a description, canonical, OG image, and no product console error.
Navigation to Demo focused its `h1` and set the route announcement; browser
Back returned focus and announcement to Home.

The cassette-era workshop-zine identity is distinct in both viewport checks:
paper texture, black-ink forms, red annotation/action marks, yellow tape, and
original bicycle-workbench art support evidence capture without presenting a
generic SaaS-template hero. It matches the documented design direction.

## Missed leverage

No omitted feature is indicated by the brief. The expected private handoff
features are present: text-link sharing, print/PDF, and JSON backup/restore.
Cloud sync would weaken the stated local-first privacy model. AI diagnosis or
an AI embellishment would conflict with the explicit non-diagnosis boundary,
so no Sociobot-gateway AI feature is required.

## What would make this perfect

Nothing actionable remains within the stated product contract. Maintain the
same first-screen clarity, isolated sample checks, and claim coverage when
future features are added.
