# Bike Check Card

Record bike-fault evidence before asking a mechanic or cycling community for help.

Bike Check Card records the bike, component, symptom, ride context, measurements, timeline, and marked photos. It does not diagnose faults or decide whether a bike is safe.

Try the isolated sample: <https://bike-check-card.sociobot.in/demo>

## Who it is for

It is for cyclists who want a clear record before asking for help. No account is required, and the app is free to use.

## What it does

- Real drafts and saved cards stay in this browser.
- Demo changes use a separate browser database and never alter the real draft.
- Photos can be added and marked without uploading them.
- Shared text links use the URL fragment and leave photos out.
- JSON backup exports and restores the complete card.
- The print action sends the completed card to the browser print dialog.
- The app works offline after the first visit.
- The app loads no analytics, remote fonts, ads, or tracking scripts.

Every statement above has a tagged browser test in [`.factory/claims.json`](.factory/claims.json).

## Run and test

Use a current Node.js release.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run test:e2e
```

`npm run build` creates `dist/` with `index.html` at its root. The browser suite uses Playwright 1.58.2 and its installed Chromium.

Run one claim by its id:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
```

## Routes

- `/` explains the product and offers the sample.
- `/demo` opens the isolated completed sample.
- `/card` opens the real draft.
- `/cards` opens saved cards.
- `/privacy` and `/terms` explain data handling and use.
- Unknown paths use the product-specific 404 page.

## Build and deployment

The app uses Vite and strict TypeScript. Browser storage holds cards, and a service worker provides offline reloads.

Publish the contents of `dist/` as a static site. The included hosting configuration sets caching, content types, security headers, and the 404 response.

The factory owns DNS and deployment. This repository does not change infrastructure, billing, or DNS.

## Product records

- [Opportunity brief](.factory/brief.json)
- [Visual design and artwork provenance](.factory/design.md)
- [Demo sandbox](.factory/demo.md)
- [Repair evidence](.factory/polish-1.md)
- [Handoff](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
