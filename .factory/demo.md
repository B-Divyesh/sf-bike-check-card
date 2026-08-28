# Bike Check Card demo

Demo URL: <https://bike-check-card.sociobot.in/demo>

The query URL <https://bike-check-card.sociobot.in/?demo=1> opens the same isolated sample.

## Sample data

The demo opens a completed steel-commuter card. It records an intermittent wheel-sensor and GPS mismatch after a wet ride.

The sample includes mileage, tyre pressure, both speed readings, a timeline, ride context, conditions, notes, and a marked sensor photo.

## Isolation and reset

Demo reads and writes use the IndexedDB database `demo:bike-check-card`. Real drafts and saved cards use `bike-check-card`.

“Reset demo” replaces only the demo draft with the shipped sample. “Start for real” opens `/card` and reads only the real database.

Leaving demo mode never copies sample data into the real database.

## Verification

Run the isolation claim from a fresh browser context:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
```

Run the offline sample check:

```sh
npm run test:e2e -- --grep @claim:offline-reload
```
