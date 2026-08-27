# Bike Check Card — visual thesis

## Direction: cassette-era workshop zine

Bike faults are usually documented in a garage, at a kerb, or on a phone with greasy hands—not in a polished training dashboard. The interface borrows the useful parts of a photocopied 1980s workshop zine: cream stock, registration-red marks, black ink, yellow measurement tape, clipped corners, and stamped status labels. The roughness lives in the edges and illustration; the form itself stays calm, legible, and exact.

This is an intentionally single-mode, light-paper experience. It avoids a dark theme because the printed-card metaphor and print export are core to the product. The background is explicitly painted warm paper rather than relying on browser defaults.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F3ECD8` | page background |
| Sheet | `#FFFDF5` | working surfaces |
| Ink | `#171713` | primary text, 16.5:1 on paper |
| Muted ink | `#5B594F` | supporting copy, 6.2:1 on paper |
| Signal red | `#B92D24` | primary action, annotation, danger boundary |
| Signal red dark | `#7C1E19` | hover/pressed and accessible text |
| Tape yellow | `#F2CA52` | measurement cues and selected state |
| Workshop green | `#2F604A` | saved/success states |
| Rule | `#CAC0A5` | separators and input outlines |

Red is used as a grease-pencil mark, never as the only carrier of meaning. Status always includes words or an icon. Focus uses a double ink/yellow ring with at least 3:1 contrast.

## Type and spacing

- Display: `Arial Black`, `Arial Narrow Bold`, sans-serif. Tight, uppercase, poster-like, only for short headings.
- Working text: `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, `Roboto Mono`, monospace. System-hosted so the app works offline without font payload or third-party requests.
- Scale: 14 / 16 / 20 / 28 / clamp(40–72) px. Body stays 16px or larger.
- Rhythm: 4px base; main gaps 8, 12, 16, 24, 32, 48, and 64px. Reading measure is capped around 68 characters.
- Corners are mostly 0–4px. Selected cards can use a clipped top-right corner, echoing hand-cut paper scraps.

## Composition and interaction grammar

- The start page behaves like a workbench: one unmistakable “Start a check card” action, a compact four-step strip, and an editorial cutaway of the evidence-gathering kit.
- The editor is a numbered field sheet: identify, record, compare, attach. Completion is visible as a plain-language count, not an opaque score.
- Inputs look like typed entries on a paper form, but retain generous touch targets and strong labels.
- Measurements are optional and component-aware; pressure and wheel/GPS comparison stay available without implying a diagnosis.
- Photos are local “contact prints.” Opening one reveals a grease-pencil canvas. The user draws directly, undoes, clears, then saves the marked copy.
- The safety boundary appears beside the decision moment and again on exports: the card records evidence, it does not decide whether a bike is safe.
- Confirmation and update messages resemble stamped labels but are announced through live regions.

## Motion policy

Motion is sparse and physical: sections enter with a 180ms opacity/4px lift; pressed controls translate 1px; the save stamp scales once over 220ms. No looping animation. Under `prefers-reduced-motion: reduce`, all movement and smooth scrolling are removed; state changes remain visible through color, text, and borders.

## Original asset plan

The hero is a generated still-life collage: a bicycle wheel rim, pocket pressure gauge, hand-marked evidence card, and instant-photo frames arranged on a cream workshop bench. It explains the capture-and-handoff job without pretending to diagnose. PWA icons are hand-authored SVG/PNG: a red evidence-card silhouette crossed by a black bicycle spoke.

### Hero prompt sheet

- Use case: `stylized-concept`
- Asset: landing-page editorial illustration, landscape crop
- Subject: top-down bicycle fault evidence kit—partial wheel rim and tyre sidewall, compact pressure gauge, two blank instant-photo frames, pencil marks and arrows on an unbranded paper checklist
- World/materials: 1980s photocopied cycling workshop zine, torn cream paper, black ink, coarse halftone, red grease-pencil accents, a small strip of yellow workshop tape
- Light/lens: flat overhead workbench light, top-down 50mm equivalent, crisp cut-paper shadows, no glossy advertising finish
- Palette words: warm cream, carbon black, registration red, faded mustard yellow, muted workshop green
- Composition: landscape, objects grouped on the right and centre, breathing room around the silhouette; crop-safe; no readable lettering
- Avoid: people, hands, brands, logos, legible text, watermarks, safety verdict symbols, gradients, neon, polished 3D UI, distorted wheel geometry

Generated imagery is original to this product. Generation model: factory image deployment (`factory-image`, Azure OpenAI image generation), generated 2026-08-27. Production derivatives are optimized locally to WebP/AVIF and kept below the 300 KB mobile hero budget. Prompt sidecar lives beside the source asset.

## Accessibility and print

At 390px the decorative hero compresses below the primary copy and the editor becomes a single column. Desktop retains a narrow completion rail; phone keeps actions in document order with no fixed bar. All controls are at least 44px high, keyboard focus is explicit, and annotation has a text caption fallback. Print removes navigation and actions, retains the evidence/photos and safety boundary, and uses black on white to make a dependable PDF.
