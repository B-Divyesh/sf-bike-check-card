import './styles.css';
import { completion, isShareReady, newCard, type CheckCard, type PhotoEvidence, type SharedCard } from './model';
import { deleteHistory, listHistory, loadDraft, replaceDraft, saveDraft, saveHistory } from './db';
import { decodeCard, makeShareUrl } from './share';
import { captureLicenseFromUrl, checkoutUrl, hasOptimisticUnlock, hasStoredLicense, storeLicense, verifyLicense } from './license';

const app = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
if (!app) throw new Error('App root is missing.');

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector<HTMLElement>('#main');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
});

let draft: CheckCard | null = null;
let unlocked = hasOptimisticUnlock();
let licenseInactive = hasStoredLicense() && !unlocked;
let saveTimer = 0;

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character] ?? character);

const selected = (actual: string, value: string) => actual === value ? ' selected' : '';

function navigate(href: string) {
  history.pushState({}, '', href);
  void renderRoute();
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function shell(content: string, active = '') {
  return `
    <header class="site-header">
      <a class="brand" href="/" data-nav aria-label="Bike Check Card home">
        <span class="brand-mark" aria-hidden="true">/</span><span>Bike Check Card</span>
      </a>
      <nav aria-label="Primary">
        <a href="/?edit=1" data-nav${active === 'edit' ? ' aria-current="page"' : ''}>Draft</a>
        <a href="/?view=history" data-nav${active === 'history' ? ' aria-current="page"' : ''}>My cards</a>
        <a href="/?view=pro" data-nav${active === 'pro' ? ' aria-current="page"' : ''}>${unlocked ? 'Supporter ✓' : 'Unlock'}</a>
      </nav>
    </header>
    <div class="offline-strip" id="offline-strip" role="status" ${navigator.onLine ? 'hidden' : ''}>Offline — your draft still saves on this device.</div>
    ${licenseInactive ? `<div class="license-strip" role="status">License no longer active. <a href="/?view=pro" data-nav>Review the supporter unlock</a>.</div>` : ''}
    ${content}
    <footer>
      <p>Made for clear handoffs, not safety verdicts. <span aria-hidden="true">●</span> Works offline.</p>
      <nav aria-label="Legal"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a></nav>
      <p class="generated-note">Hero artwork was generated for this product; no stock imagery or tracking scripts.</p>
    </footer>
    <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
}

function showToast(message: string, action?: { label: string; run: () => void }) {
  const toast = document.querySelector<HTMLDivElement>('#toast');
  if (!toast) return;
  toast.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button" class="toast-action">${esc(action.label)}</button>` : ''}`;
  toast.classList.add('is-visible');
  if (action) toast.querySelector('button')?.addEventListener('click', action.run, { once: true });
  window.setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

function homeTemplate(savedCount: number) {
  return shell(`
    <main id="main" tabindex="-1">
      <section class="hero">
        <div class="hero-copy">
          <p class="kicker"><span>Offline field sheet</span> / No account</p>
          <h1>Catch the fault <br><em>before</em> it disappears.</h1>
          <p class="lede">Record the bike, exact symptom, measurements, ride context and marked-up photos in one check card—ready for a mechanic or community reply.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/?edit=1" data-nav>Start a check card <span aria-hidden="true">→</span></a>
            ${savedCount ? `<a class="text-link" href="/?view=history" data-nav>Open ${savedCount} saved ${savedCount === 1 ? 'card' : 'cards'}</a>` : '<span class="local-note">Saves locally as you type</span>'}
          </div>
        </div>
        <figure class="hero-art">
          <picture>
            <source srcset="/assets/hero-zine-720.webp 720w, /assets/hero-zine-1280.webp 1280w" sizes="(max-width: 800px) 100vw, 46vw" type="image/webp">
            <img src="/assets/hero-zine-1280.webp" alt="Zine-style workbench with a bicycle wheel, pressure gauge, fault photos and a marked evidence sheet" width="1280" height="853" fetchpriority="high" decoding="async">
          </picture>
          <figcaption>Evidence kit, assembled. Original generated collage.</figcaption>
        </figure>
      </section>
      <section class="workflow" aria-labelledby="workflow-title">
        <div><p class="section-number">01—04</p><h2 id="workflow-title">Four moves. One useful handoff.</h2></div>
        <ol class="steps">
          <li><span>01</span><strong>Name it</strong><p>Bike and exact component.</p></li>
          <li><span>02</span><strong>Describe it</strong><p>What happened, when, and under what load.</p></li>
          <li><span>03</span><strong>Measure it</strong><p>Pressure, distance, wheel and GPS readings.</p></li>
          <li><span>04</span><strong>Mark it</strong><p>Circle the evidence directly on your photos.</p></li>
        </ol>
      </section>
      <aside class="safety-boundary" aria-labelledby="boundary-title">
        <span class="boundary-mark" aria-hidden="true">!</span>
        <div><h2 id="boundary-title">A record, not a green light.</h2><p>Bike Check Card does not diagnose faults or tell you a bike is safe to ride. If you are unsure, pause and ask a qualified mechanic.</p></div>
      </aside>
      <section class="privacy-promise" aria-labelledby="private-title">
        <p class="tape">Private by construction</p>
        <h2 id="private-title">Your photos stay in your pocket.</h2>
        <p>Everything lives on this device until you choose an export. Text links use the URL fragment, which is not sent to our server, and deliberately leave photos out.</p>
      </section>
    </main>`);
}

function field(label: string, name: keyof CheckCard, value: string, options: { hint?: string; type?: string; inputmode?: string; required?: boolean } = {}) {
  const id = `field-${name}`;
  return `<label class="field" for="${id}"><span>${label}${options.required ? ' <b aria-hidden="true">*</b>' : ''}</span>${options.hint ? `<small id="${id}-hint">${options.hint}</small>` : ''}<input id="${id}" name="${name}" value="${esc(value)}" type="${options.type ?? 'text'}" ${options.inputmode ? `inputmode="${options.inputmode}"` : ''} ${options.hint ? `aria-describedby="${id}-hint"` : ''} ${options.required ? 'required' : ''} maxlength="120"></label>`;
}

function textarea(label: string, name: keyof CheckCard, value: string, hint = '', required = false) {
  const id = `field-${name}`;
  return `<label class="field field-wide" for="${id}"><span>${label}${required ? ' <b aria-hidden="true">*</b>' : ''}</span>${hint ? `<small id="${id}-hint">${hint}</small>` : ''}<textarea id="${id}" name="${name}" rows="4" maxlength="1200" ${hint ? `aria-describedby="${id}-hint"` : ''} ${required ? 'required' : ''}>${esc(value)}</textarea></label>`;
}

function photoTemplate(photo: PhotoEvidence, index: number) {
  return `<li class="photo-card" data-photo-id="${esc(photo.id)}">
    <img src="${photo.annotatedDataUrl || photo.dataUrl}" alt="Fault evidence photo ${index + 1}${photo.caption ? `: ${esc(photo.caption)}` : ''}" width="320" height="240">
    <label for="caption-${esc(photo.id)}">Photo ${index + 1} note<input id="caption-${esc(photo.id)}" data-photo-caption="${esc(photo.id)}" value="${esc(photo.caption)}" maxlength="160"></label>
    <div class="photo-actions"><button type="button" class="button button-small" data-photo-action="annotate" data-id="${esc(photo.id)}">Mark photo</button><button type="button" class="button button-quiet button-small" data-photo-action="remove" data-id="${esc(photo.id)}">Remove</button></div>
  </li>`;
}

function editorTemplate(card: CheckCard) {
  const done = completion(card);
  const labels = ['bike', 'component', 'symptom', 'one measurement'];
  return shell(`
    <main id="main" tabindex="-1" class="editor-main">
      <div class="editor-heading">
        <div><p class="kicker">Field sheet / <span id="save-state">Saved locally</span></p><h1>Build a check card.</h1><p>Required for a useful handoff: bike, component, symptom and one measurement.</p></div>
        <aside class="completion" aria-label="Card completeness"><strong><span id="complete-count">${done.complete}</span> / ${done.total}</strong><span>essentials captured</span><ul id="completion-list">${labels.map((label, index) => `<li class="${done.checks[index] ? 'done' : ''}">${done.checks[index] ? '✓' : '○'} ${label}</li>`).join('')}</ul></aside>
      </div>
      <form id="card-form" novalidate>
        <section class="form-section" aria-labelledby="identify-title"><div class="section-head"><span>01</span><div><h2 id="identify-title">Identify the setup</h2><p>Enough detail to picture the bike and part.</p></div></div><div class="field-grid">
          ${field('Bike', 'bike', card.bike, { hint: 'Example: steel commuter, 700c', required: true })}
          <label class="field" for="field-component"><span>Component <b aria-hidden="true">*</b></span><small id="component-hint">Choose the closest area</small><select id="field-component" name="component" aria-describedby="component-hint" required><option value="">Choose component</option>${['Tyre / tube', 'Wheel / rim / spokes', 'Brakes', 'Drivetrain', 'Steering / headset', 'Frame / fork', 'Pedals / cranks', 'Sensor / computer', 'Other'].map(option => `<option${selected(card.component, option)}>${option}</option>`).join('')}</select></label>
          ${field('Bike distance / mileage', 'mileage', card.mileage, { hint: 'Value and unit, if known', inputmode: 'decimal' })}
          ${field('Tyre pressure', 'pressure', card.pressure, { hint: 'Example: 65 psi / 4.5 bar', inputmode: 'decimal' })}
        </div></section>
        <section class="form-section" aria-labelledby="symptom-title"><div class="section-head"><span>02</span><div><h2 id="symptom-title">Pin down the symptom</h2><p>Describe what changed, not what you think the diagnosis is.</p></div></div><div class="field-grid">
          ${textarea('Exact symptom', 'symptom', card.symptom, 'What can you see, hear, feel, or reproduce?', true)}
          ${field('First noticed', 'started', card.started, { hint: 'Date/time or point in the ride' })}
          ${textarea('Symptom timeline', 'timeline', card.timeline, 'Example: intermittent for 10 km, then constant under load')}
          ${textarea('Ride context', 'rideContext', card.rideContext, 'Surface, speed, load, recent impact or maintenance')}
          ${field('Conditions', 'conditions', card.conditions, { hint: 'Dry/wet, temperature, terrain' })}
        </div></section>
        <section class="form-section" aria-labelledby="compare-title"><div class="section-head"><span>03</span><div><h2 id="compare-title">Compare readings</h2><p>Optional. Record both values from the same moment where possible.</p></div></div><div class="field-grid two-up">
          ${field('Wheel-sensor speed', 'wheelSpeed', card.wheelSpeed, { hint: 'Value and unit', inputmode: 'decimal' })}
          ${field('GPS speed', 'gpsSpeed', card.gpsSpeed, { hint: 'Value and unit', inputmode: 'decimal' })}
          ${textarea('Other observations', 'notes', card.notes, 'Reproduction steps, wear, visible fibres, noises, looseness, or error messages')}
        </div></section>
        <section class="form-section" aria-labelledby="photo-title"><div class="section-head"><span>04</span><div><h2 id="photo-title">Attach and mark evidence</h2><p>Up to six photos. They stay on this device unless included in an export or print.</p></div></div>
          <div class="photo-upload"><label class="button button-secondary" for="photo-input">Add photos</label><input class="visually-hidden" id="photo-input" type="file" accept="image/*" capture="environment" multiple><span>JPG, PNG, HEIC where supported · 10 MB each</span></div>
          <p class="form-error" id="photo-error" role="alert"></p>
          ${card.photos.length ? `<ul class="photo-grid">${card.photos.map(photoTemplate).join('')}</ul>` : '<div class="empty-inline"><strong>No photos yet.</strong><p>A clear overview plus one close-up usually makes the handoff easier.</p></div>'}
        </section>
        <section class="decision-section" aria-labelledby="next-title"><div><p class="tape">Your decision—not ours</p><h2 id="next-title">What will you do next?</h2><p>Recording a choice does not make it a safety assessment.</p></div><label class="field" for="field-nextStep"><span>Rider’s next step</span><select id="field-nextStep" name="nextStep"><option value="">Not recorded</option>${['Pause riding until reviewed', 'Ask a mechanic', 'Ask a cycling community', 'Continue monitoring'].map(option => `<option${selected(card.nextStep, option)}>${option}</option>`).join('')}</select></label></section>
        <aside class="safety-boundary compact"><span class="boundary-mark" aria-hidden="true">!</span><div><h2>This card cannot tell you the bike is safe.</h2><p>It organizes evidence for a person who can help. If you are unsure, pause and consult a qualified mechanic.</p></div></aside>
        <div class="export-bar" aria-label="Card actions">
          <div><button type="button" class="button button-primary" id="share-card">Copy private link</button><button type="button" class="button button-secondary" id="print-card">Print / save PDF</button></div>
          <div><button type="button" class="button button-quiet" id="save-card">Save to my cards</button><button type="button" class="button button-quiet" id="new-card">New blank card</button><button type="button" class="button button-quiet" id="export-json">Export backup</button><label class="button button-quiet" for="import-json">Import backup</label><input class="visually-hidden" id="import-json" type="file" accept="application/json"></div>
          <p class="action-help">Private links include text only. Print/PDF and backup include photos.</p>
          <p id="action-error" class="form-error" role="alert"></p>
        </div>
      </form>
      <dialog id="annotator" aria-labelledby="annotator-title"><div class="dialog-head"><div><p class="kicker">Grease pencil</p><h2 id="annotator-title">Mark the evidence</h2></div><button type="button" class="icon-button" id="close-annotator" aria-label="Close photo marker">×</button></div><p>Draw a red circle or arrow around the fault. Your original stays untouched.</p><div class="canvas-wrap"><canvas id="annotation-canvas"></canvas></div><div class="dialog-actions"><button type="button" class="button button-quiet" id="undo-mark">Undo</button><button type="button" class="button button-quiet" id="clear-mark">Clear marks</button><button type="button" class="button button-primary" id="save-mark">Save marked photo</button></div></dialog>
    </main>`, 'edit');
}

function dataRows(card: CheckCard | SharedCard) {
  const pairs = [
    ['Bike', card.bike], ['Component', card.component], ['Mileage / distance', card.mileage], ['Pressure', card.pressure],
    ['First noticed', card.started], ['Symptom timeline', card.timeline], ['Ride context', card.rideContext], ['Conditions', card.conditions],
    ['Wheel-sensor speed', card.wheelSpeed], ['GPS speed', card.gpsSpeed], ['Other observations', card.notes], ['Rider’s next step', card.nextStep]
  ];
  return pairs.filter(([, value]) => value).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
}

function sharedTemplate(card: SharedCard) {
  return shell(`<main id="main" tabindex="-1" class="shared-main"><article class="print-card"><header><p class="kicker">Shared evidence card</p><h1>${esc(card.title || `${card.component || 'Bike'} check`)}</h1><p class="card-date">Updated ${new Date(card.updatedAt).toLocaleString()}</p></header><section aria-labelledby="reported-symptom"><h2 id="reported-symptom">Reported symptom</h2><p class="symptom-callout">${esc(card.symptom)}</p></section><dl class="evidence-list">${dataRows(card)}</dl>${card.photoCount ? `<p class="photo-omission"><strong>${card.photoCount} local ${card.photoCount === 1 ? 'photo was' : 'photos were'} not included.</strong> Ask the sender for the PDF or image export if needed.</p>` : ''}<aside class="safety-boundary compact"><span class="boundary-mark" aria-hidden="true">!</span><div><h2>Evidence, not a safety verdict</h2><p>This card documents what the rider observed. It does not diagnose the fault or confirm the bike is safe to ride.</p></div></aside><div class="shared-actions"><button type="button" class="button button-secondary" id="print-card">Print / save PDF</button><a class="button button-primary" href="/?edit=1" data-nav>Make my own card</a></div></article></main>`);
}

function invalidShareTemplate(message: string) {
  return shell(`<main id="main" tabindex="-1" class="message-page"><p class="stamp stamp-danger">Link error</p><h1>This card could not be opened.</h1><p>${esc(message)}</p><a class="button button-primary" href="/" data-nav>Go to Bike Check Card</a></main>`);
}

async function historyTemplate() {
  const cards = await listHistory();
  return shell(`<main id="main" tabindex="-1" class="list-main"><div class="page-heading"><p class="kicker">Local archive</p><h1>My check cards.</h1><p>Stored only in this browser. Export a backup before clearing site data or changing devices.</p></div>${cards.length ? `<ul class="history-list">${cards.map(card => `<li><div><p class="stamp">${esc(card.component || 'Unsorted')}</p><h2>${esc(card.title || card.bike || 'Untitled bike check')}</h2><p>${esc(card.symptom || 'No symptom recorded')}</p><small>Saved ${new Date(card.updatedAt).toLocaleString()} · ${completion(card).complete}/4 essentials</small></div><div class="history-actions"><button class="button button-secondary" type="button" data-open-card="${esc(card.id)}">Open copy</button><button class="button button-quiet" type="button" data-delete-card="${esc(card.id)}">Delete</button></div></li>`).join('')}</ul>` : `<section class="empty-state"><span aria-hidden="true">○</span><h2>No saved cards yet.</h2><p>Your live draft saves automatically. Save a snapshot when it is ready to keep.</p><a class="button button-primary" href="/?edit=1" data-nav>Start a check card</a></section>`}</main>`, 'history');
}

function proTemplate() {
  return shell(`<main id="main" tabindex="-1" class="pro-main"><div class="page-heading"><p class="kicker">One-time supporter unlock</p><h1>Keep the workshop light on.</h1><p>The complete check-card workflow stays free. A one-time <strong>$9 USD</strong> purchase unlocks unlimited saved-card history on this device and supports the privacy-first utility.</p></div><section class="price-sheet"><div><p class="stamp ${unlocked ? 'stamp-success' : ''}">${unlocked ? 'Unlocked' : 'Supporter edition'}</p><h2>${unlocked ? 'Thanks for backing useful tools.' : '$9 once. No subscription.'}</h2><ul><li>Unlimited saved card snapshots</li><li>Move the license between your devices</li><li>Core link, PDF and data exports remain free</li></ul>${unlocked ? '<p>Your cached license is active on this device.</p>' : `<a class="button button-primary" href="${checkoutUrl()}">Buy supporter unlock</a><p class="fine-print">Secure hosted checkout. Sociobot / Dodo is the merchant of record; refunds are handled there and revoke the license.</p>`}</div><form id="restore-form"><h2>Have a license?</h2><label class="field" for="license-token"><span>Paste license token</span><input id="license-token" name="license" autocomplete="off" spellcheck="false" required></label><button class="button button-secondary" type="submit">Verify and restore</button><p id="license-status" role="status"></p></form></section></main>`, 'pro');
}

function privacyTemplate() {
  return shell(`<main id="main" tabindex="-1" class="legal-main"><p class="kicker">Effective 27 August 2026</p><h1>Privacy, in plain language.</h1><h2>Your bike data stays local</h2><p>Drafts, saved cards, measurements, notes and photos are stored in your browser’s IndexedDB. We do not receive them. Removing site data removes these records, so export a backup first.</p><h2>Exports are your choice</h2><p>A private link encodes text in the URL fragment and excludes photos. Fragments are not sent to our server, but anyone you give the link to can read it. Print/PDF and JSON exports are created on your device and may include photos.</p><h2>Payments and licenses</h2><p>If you buy the supporter unlock, checkout is hosted by Sociobot with Dodo as merchant of record. This app stores your license token locally and sends it to the Sociobot verification endpoint at most once per day. We do not add analytics, advertising cookies or third-party fonts.</p><h2>Questions</h2><p>Contact <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>. This policy may change when the service changes; the date above identifies this version.</p></main>`);
}

function termsTemplate() {
  return shell(`<main id="main" tabindex="-1" class="legal-main"><p class="kicker">Effective 27 August 2026</p><h1>Terms of use.</h1><h2>Evidence tool, not professional advice</h2><p>Bike Check Card helps you record observations. It does not inspect your bicycle, diagnose faults, recommend replacement, confirm warranty eligibility, or determine whether riding is safe. Stop riding and consult a qualified mechanic whenever you are uncertain.</p><h2>Your records</h2><p>You are responsible for the accuracy of your records, your exports, and who receives a shared link. Do not rely on browser storage as your only long-term copy.</p><h2>Supporter purchase</h2><p>The supporter unlock is a one-time $9 USD purchase, subject to the price shown at checkout. It unlocks unlimited local saved-card history. Sociobot / Dodo is the merchant of record and handles payment and refunds; a refund revokes the license.</p><h2>Availability and warranty</h2><p>The software is provided “as is” under the MIT License. Offline behavior depends on a successful first load and browser support. We may improve or discontinue the hosted app, but JSON export remains available in the app.</p></main>`);
}

async function renderRoute() {
  const url = new URL(location.href);
  const shared = location.hash.startsWith('#card=') ? location.hash.slice(6) : '';
  if (shared) {
    try { app.innerHTML = sharedTemplate(decodeCard(shared)); } catch (error) { app.innerHTML = invalidShareTemplate(error instanceof Error ? error.message : 'The link is invalid.'); }
  } else if (url.pathname === '/privacy') app.innerHTML = privacyTemplate();
  else if (url.pathname === '/terms') app.innerHTML = termsTemplate();
  else if (url.pathname !== '/') app.innerHTML = invalidShareTemplate('This page does not exist.');
  else if (url.searchParams.get('edit') === '1') {
    draft = draft ?? await loadDraft() ?? newCard();
    await saveDraft(draft);
    app.innerHTML = editorTemplate(draft);
    bindEditor();
  } else if (url.searchParams.get('view') === 'history') app.innerHTML = await historyTemplate();
  else if (url.searchParams.get('view') === 'pro') { app.innerHTML = proTemplate(); bindRestore(); }
  else app.innerHTML = homeTemplate((await listHistory()).length);
  document.title = document.querySelector('h1')?.textContent?.trim() ? `${document.querySelector('h1')?.textContent?.trim()} — Bike Check Card` : 'Bike Check Card';
  bindPageActions();
}

function updateCompletion() {
  if (!draft) return;
  const result = completion(draft);
  const count = document.querySelector('#complete-count');
  if (count) count.textContent = String(result.complete);
  const labels = ['bike', 'component', 'symptom', 'one measurement'];
  const list = document.querySelector('#completion-list');
  if (list) list.innerHTML = labels.map((label, index) => `<li class="${result.checks[index] ? 'done' : ''}">${result.checks[index] ? '✓' : '○'} ${label}</li>`).join('');
}

function queueSave() {
  const state = document.querySelector('#save-state');
  if (state) state.textContent = 'Saving…';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    if (!draft) return;
    draft.updatedAt = new Date().toISOString();
    try { await saveDraft(draft); if (state) state.textContent = 'Saved locally'; }
    catch { if (state) state.textContent = 'Save failed — export a backup'; }
  }, 250);
}

function setActionError(message: string) {
  const element = document.querySelector<HTMLParagraphElement>('#action-error');
  if (element) element.textContent = message;
}

function bindEditor() {
  const form = document.querySelector<HTMLFormElement>('#card-form');
  form?.addEventListener('submit', event => event.preventDefault());
  form?.addEventListener('input', event => {
    if (!draft) return;
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (target.dataset.photoCaption) {
      const photo = draft.photos.find(item => item.id === target.dataset.photoCaption);
      if (photo) photo.caption = target.value;
    } else if (target.name && target.name in draft && typeof draft[target.name as keyof CheckCard] === 'string') {
      (draft as unknown as Record<string, unknown>)[target.name] = target.value;
    }
    updateCompletion();
    queueSave();
  });
  document.querySelector<HTMLInputElement>('#photo-input')?.addEventListener('change', event => void addPhotos((event.currentTarget as HTMLInputElement).files));
  document.querySelector<HTMLInputElement>('#import-json')?.addEventListener('change', event => void importBackup((event.currentTarget as HTMLInputElement).files?.[0]));
  document.querySelector('#share-card')?.addEventListener('click', () => void shareDraft());
  document.querySelector('#save-card')?.addEventListener('click', () => void snapshotDraft());
  document.querySelector('#new-card')?.addEventListener('click', () => void startBlankCard());
  document.querySelector('#export-json')?.addEventListener('click', exportBackup);
  document.querySelectorAll<HTMLButtonElement>('[data-photo-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.photoAction === 'remove') void removePhoto(button.dataset.id ?? '');
    if (button.dataset.photoAction === 'annotate') openAnnotator(button.dataset.id ?? '');
  }));
}

async function imageToDataUrl(file: File) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB.`);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/webp', 0.8);
}

async function addPhotos(files: FileList | null) {
  if (!draft || !files?.length) return;
  const error = document.querySelector('#photo-error');
  if (draft.photos.length + files.length > 6) { if (error) error.textContent = 'Choose no more than six photos in total.'; return; }
  if (error) error.textContent = '';
  try {
    for (const file of Array.from(files)) draft.photos.push({ id: crypto.randomUUID(), dataUrl: await imageToDataUrl(file), caption: '' });
    await saveDraft(draft);
    app.innerHTML = editorTemplate(draft);
    bindEditor();
    showToast(`${files.length} ${files.length === 1 ? 'photo' : 'photos'} added locally.`);
  } catch (problem) { if (error) error.textContent = problem instanceof Error ? problem.message : 'This photo could not be added.'; }
}

async function removePhoto(id: string) {
  if (!draft) return;
  const photo = draft.photos.find(item => item.id === id);
  if (!photo || !confirm(`Remove ${photo.caption || 'this photo'} from the card?`)) return;
  draft.photos = draft.photos.filter(item => item.id !== id);
  await saveDraft(draft);
  app.innerHTML = editorTemplate(draft);
  bindEditor();
  showToast('Photo removed.');
}

function openAnnotator(id: string) {
  if (!draft) return;
  const photo = draft.photos.find(item => item.id === id);
  const dialog = document.querySelector<HTMLDialogElement>('#annotator');
  const canvas = document.querySelector<HTMLCanvasElement>('#annotation-canvas');
  if (!photo || !dialog || !canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const image = new Image();
  const base = photo.annotatedDataUrl || photo.dataUrl;
  const undoStack: string[] = [];
  image.onload = () => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);
    dialog.showModal();
    document.querySelector<HTMLButtonElement>('#close-annotator')?.focus();
  };
  image.src = base;
  let drawing = false;
  const point = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  };
  canvas.onpointerdown = event => {
    undoStack.push(canvas.toDataURL());
    if (undoStack.length > 12) undoStack.shift();
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const p = point(event);
    context.beginPath(); context.moveTo(p.x, p.y);
  };
  canvas.onpointermove = event => {
    if (!drawing) return;
    const p = point(event);
    context.lineTo(p.x, p.y);
    context.strokeStyle = '#B92D24'; context.lineWidth = Math.max(5, canvas.width / 130); context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke();
  };
  canvas.onpointerup = () => { drawing = false; };
  document.querySelector('#close-annotator')?.addEventListener('click', () => dialog.close());
  document.querySelector('#undo-mark')?.addEventListener('click', () => {
    const previous = undoStack.pop();
    if (!previous) return;
    const undoImage = new Image(); undoImage.onload = () => context.drawImage(undoImage, 0, 0); undoImage.src = previous;
  });
  document.querySelector('#clear-mark')?.addEventListener('click', () => {
    undoStack.push(canvas.toDataURL());
    const clean = new Image(); clean.onload = () => context.drawImage(clean, 0, 0); clean.src = photo.dataUrl;
  });
  document.querySelector('#save-mark')?.addEventListener('click', async () => {
    photo.annotatedDataUrl = canvas.toDataURL('image/webp', 0.82);
    await saveDraft(draft!);
    dialog.close();
    app.innerHTML = editorTemplate(draft!);
    bindEditor();
    showToast('Marked photo saved.');
  });
}

async function shareDraft() {
  if (!draft) return;
  setActionError('');
  if (!isShareReady(draft)) { setActionError('Add the bike, component, symptom and at least one measurement before sharing.'); return; }
  try {
    const url = makeShareUrl(draft);
    await navigator.clipboard.writeText(url);
    showToast('Private text link copied. Photos stayed on this device.');
  } catch (error) { setActionError(error instanceof Error ? error.message : 'The link could not be copied.'); }
}

async function snapshotDraft() {
  if (!draft) return;
  setActionError('');
  const cards = await listHistory();
  if (!unlocked && cards.length >= 1) {
    setActionError('The free edition keeps one saved snapshot. Export a backup, delete the saved card, or unlock unlimited history.');
    return;
  }
  await saveHistory(draft);
  showToast('Snapshot saved to My cards.');
}

async function startBlankCard() {
  if (!confirm('Start a blank card? Save or export this draft first if you need to keep it.')) return;
  draft = newCard();
  await replaceDraft(draft);
  app.innerHTML = editorTemplate(draft);
  bindEditor();
  showToast('Blank check card ready.');
}

function exportBackup() {
  if (!draft) return;
  const blob = new Blob([JSON.stringify({ format: 'bike-check-card/v1', card: draft }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bike-check-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Backup downloaded. It may include your photos.');
}

async function importBackup(file?: File) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()) as { format?: string; card?: CheckCard };
    if (parsed.format !== 'bike-check-card/v1' || !parsed.card || !Array.isArray(parsed.card.photos)) throw new Error('Choose a Bike Check Card v1 JSON backup.');
    if (!confirm('Replace the live draft with this imported card? Your current saved snapshots will stay.')) return;
    draft = parsed.card;
    draft.id = crypto.randomUUID();
    draft.updatedAt = new Date().toISOString();
    await replaceDraft(draft);
    app.innerHTML = editorTemplate(draft);
    bindEditor();
    showToast('Backup imported into the live draft.');
  } catch (error) { setActionError(error instanceof Error ? error.message : 'The backup could not be read.'); }
}

function bindRestore() {
  document.querySelector<HTMLFormElement>('#restore-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#license-token');
    const status = document.querySelector('#license-status');
    if (!input?.value.trim() || !status) return;
    status.textContent = 'Checking license…';
    storeLicense(input.value);
    unlocked = await verifyLicense();
    status.textContent = unlocked ? 'License restored. Unlimited history is active.' : 'That license is not active for Bike Check Card.';
    if (unlocked) window.setTimeout(() => void renderRoute(), 800);
  });
}

function bindPageActions() {
  document.querySelector('#print-card')?.addEventListener('click', () => window.print());
  document.querySelectorAll<HTMLAnchorElement>('a[data-nav]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link.getAttribute('href') ?? '/');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-open-card]').forEach(button => button.addEventListener('click', async () => {
    const card = (await listHistory()).find(item => item.id === button.dataset.openCard);
    if (!card || !confirm('Open a copy of this saved card as the live draft?')) return;
    draft = structuredClone(card); draft.id = crypto.randomUUID(); draft.updatedAt = new Date().toISOString(); await replaceDraft(draft); navigate('/?edit=1');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-delete-card]').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('Permanently delete this saved card from this device?')) return;
    await deleteHistory(button.dataset.deleteCard ?? ''); await renderRoute(); showToast('Saved card deleted.');
  }));
}

function registerPwa() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('A new field sheet is ready.', { label: 'Update', run: () => { worker.postMessage('SKIP_WAITING'); location.reload(); } });
      });
    });
  }).catch(() => { /* App remains usable without install support. */ });
}

window.addEventListener('popstate', () => void renderRoute());
window.addEventListener('hashchange', () => void renderRoute());
window.addEventListener('online', () => { document.querySelector('#offline-strip')?.setAttribute('hidden', ''); showToast('Back online. Your local draft is unchanged.'); });
window.addEventListener('offline', () => document.querySelector('#offline-strip')?.removeAttribute('hidden'));

captureLicenseFromUrl();
unlocked = hasOptimisticUnlock();
void renderRoute();
void verifyLicense().then(valid => {
  licenseInactive = hasStoredLicense() && !valid;
  if (valid !== unlocked) { unlocked = valid; void renderRoute(); }
});
registerPwa();
