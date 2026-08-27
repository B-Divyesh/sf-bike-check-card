# Bike Check Card — build handoff

Work order: `bike-check-card-build-1`

Completed: 2026-08-27

## What shipped

- Responsive cassette-era workshop-zine landing page and field-sheet editor, built in strict vanilla TypeScript with Vite.
- Local-first draft persistence and saved-card history in IndexedDB; last local write is visible through the “Saving…” / “Saved locally” state.
- Bike, component, mileage, pressure, exact symptom, timeline, ride context, conditions, wheel-sensor/GPS comparison, observations, and rider-selected next step.
- Six-photo evidence capture with browser-side resizing, captions, pointer/touch grease-pencil annotation, undo, clear, and preservation of the original image.
- Completion checklist for bike, component, symptom, and one measurement.
- Text-only private share links encoded in a URL fragment; photos deliberately remain local. Shared-card view includes the safety boundary and photo-omission notice.
- Print stylesheet for browser “Save as PDF,” plus complete JSON backup/import so users own their data.
- One live draft and one saved snapshot remain free. The optional $9 one-time Sociobot supporter unlock enables unlimited local saved-card history. Checkout, callback capture, daily cached verification, optimistic offline unlock, invalid-license notice, and paste-to-restore are implemented without a product ID.
- Installable PWA manifest, 192/512/maskable original icons, a versioned service worker, cached offline shell, direct offline navigation fallback, update toast, and offline status strip.
- Static `/privacy` and `/terms` entry points, plain-language legal copy, MIT license, full README, robots and sitemap files.
- Original generated hero collage with prompt/provenance sidecars and a documented visual system. Production WebP variants are 60 KB (720 px) and 216 KB (1280 px).

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Results on 2026-08-27:

- `npm test`: 5/5 Vitest tests passed.
- `npm run build`: passed; output in `dist/` with root `index.html`, plus `privacy/index.html` and `terms/index.html`.
- Initial production payload: 33.58 KB JavaScript and 17.50 KB CSS uncompressed (11.49 KB and 4.58 KB gzip); no font payload; mobile hero 60 KB.
- Playwright 1.58.2: 8/8 checks passed across Pixel 5 and desktop Chromium. Covered draft persistence, form completion, image attachment/annotation, phone and desktop layouts, serious/critical axe checks, and `context.setOffline(true)` reload with continued editing.
- Factory `verify-url.sh`: HTTP 200; no console/page errors; `lang=en`; exactly one `h1`; main landmark present; no missing image alt text; no unlabeled buttons.
- Lighthouse 13 mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 2.4 s, CLS 0, total blocking time 0 ms, interactive 2.4 s.
- `npm audit`: 0 vulnerabilities.

## Known gaps and release steps

- The factory must register `bike-check-card` with the Sociobot billing engine and configure its return URL before checkout can complete in production. No provider or product ID is embedded here.
- Browser print is the PDF implementation, so pagination controls depend on the browser. The dedicated print stylesheet retains form evidence and photos.
- Photo links are intentionally not implemented: embedding images would create oversized URLs and uploading them would violate the local-photo constraint. Use print/PDF or JSON when photos must travel.
- HEIC decoding depends on browser support; unsupported files produce an actionable local error.
- No diagnosis, safety recommendation, warranty workflow, telemetry ingestion, cloud sync, analytics, or social feed is included, by design.
