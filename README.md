# Bike Check Card

Bike Check Card is a private, offline field sheet for cyclists who need to document a fault before asking a mechanic or community for help. It captures the bike and component, symptoms and timeline, ride context, pressure/mileage, wheel-sensor versus GPS readings, and locally annotated photos.

It organizes evidence; it does not diagnose a fault, recommend replacement, confirm warranty eligibility, or tell anyone a bicycle is safe to ride.

Live site: <https://bike-check-card.sociobot.in>

## Product behavior

- The live draft and saved snapshots use IndexedDB and survive refreshes.
- Photos are resized in the browser and stay on the device.
- “Copy private link” puts text in a URL fragment, which is not sent to the server. Photos are deliberately excluded; anyone with the link can read its contents.
- “Print / save PDF” uses the browser print dialog and can include photos.
- JSON backup/import moves the complete card, including photos, without a service account.
- The installed PWA works offline after its first successful load.
- The free edition includes the full workflow, all exports, and one saved snapshot. The optional $9 one-time supporter license unlocks unlimited local history through the Sociobot billing API.

## Develop and verify

Requires a current Node.js release.

```sh
npm install
npm run dev
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It creates `dist/` with `index.html` at its root and direct static entry points for `/privacy` and `/terms`. The Playwright suite uses the preinstalled Chromium build and checks phone/desktop workflows, IndexedDB persistence, photo annotation, serious/critical axe findings, and an explicit offline reload.

## Architecture

Vite and strict vanilla TypeScript keep the initial app bundle small. IndexedDB stores records, Canvas provides photo markup, and a hand-written service worker precaches the versioned shell. There are no runtime CDN resources, third-party fonts, analytics, accounts, or telemetry ingestion.

The researched scope is in [`.factory/brief.json`](.factory/brief.json), the cassette-era visual system and artwork provenance are in [`.factory/design.md`](.factory/design.md), and verification notes are in [`.factory/handoff.md`](.factory/handoff.md).

## Deployment

Publish the contents of `dist/` as a static site. The factory owns DNS, infrastructure, and registration of the Sociobot product slug; this repository does not provision them.

## License

MIT. See [LICENSE](LICENSE).
