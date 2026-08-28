import './styles.css';
import { completion, isShareReady, newCard, type CheckCard, type PhotoEvidence, type SharedCard } from './model';
import { deleteHistory, listHistory, loadDraft, replaceDraft, saveDraft, saveHistory, type StorageMode } from './db';
import { sampleCard } from './demo';
import { decodeCard, makeShareUrl } from './share';

const app = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
if (!app) throw new Error('App root is missing.');

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector<HTMLElement>('#main');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
});

let draft: CheckCard | null = null;
let storageMode: StorageMode = 'real';
let firstRender = true;
let saveTimer = 0;

const esc = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character] ?? character);

const selected = (actual: string, value: string) => actual === value ? ' selected' : '';

function navigate(href: string) {
  history.replaceState({ ...history.state, scrollY: window.scrollY }, '');
  history.pushState({ scrollY: 0 }, '', href);
  void renderRoute(true, 0);
}

function shell(content: string, active = '') {
  return `
    <header class="site-header">
      <a class="brand" href="/" data-nav aria-label="Bike Check Card home">
        <span class="brand-mark" aria-hidden="true">/</span><span>Bike Check Card</span>
      </a>
      <nav aria-label="Primary">
        <a href="/demo" data-nav${active === 'demo' ? ' aria-current="page"' : ''}>Try demo</a>
        <a href="/card" data-nav${active === 'edit' ? ' aria-current="page"' : ''}>Open draft</a>
        <a href="/cards" data-nav${active === 'history' ? ' aria-current="page"' : ''}>Saved cards</a>
        <a href="/privacy" data-nav${active === 'privacy' ? ' aria-current="page"' : ''}>Privacy</a>
      </nav>
    </header>
    <div class="offline-strip" id="offline-strip" role="status" ${navigator.onLine ? 'hidden' : ''}>Offline — your card still works on this device.</div>
    ${storageMode === 'demo' ? `<aside class="demo-strip" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Changes stay in a separate demo workspace.</span><div><button type="button" id="reset-demo">Reset demo</button><a href="/card" data-start-real>Start for real</a></div></aside>` : ''}
    ${content}
    <footer>
      <p>Record bike-fault evidence for a mechanic or cycling community.</p>
      <nav aria-label="Legal"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a></nav>
      <p class="generated-note">Built by Param Factory · v1.1.0 · polish-1 · Original generated artwork.</p>
    </footer>
    <div class="visually-hidden" id="route-announcer" role="status" aria-live="polite" aria-atomic="true"></div>
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
          <p class="kicker"><span>Bike fault record</span></p>
          <h1>Record bike-fault evidence</h1>
          <p class="lede">For cyclists who need a clear record before asking a mechanic or cycling community for help.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/demo" data-nav>Try it with sample data <span aria-hidden="true">→</span></a>
            <span class="local-note">See a completed check card first.</span>
          </div>
          <a class="text-link real-start" href="/card" data-nav>Start a blank card</a>
          <ul class="hero-facts" aria-label="Product facts"><li>No account</li><li>Saved on this device</li><li>Free to use</li></ul>
          ${savedCount ? `<a class="text-link saved-link" href="/cards" data-nav>Open ${savedCount} saved ${savedCount === 1 ? 'card' : 'cards'}</a>` : ''}
        </div>
        <figure class="hero-art">
          <picture>
            <source srcset="/assets/hero-zine-720.webp 720w, /assets/hero-zine-1280.webp 1280w" sizes="(max-width: 800px) 100vw, 46vw" type="image/webp">
            <img src="/assets/hero-zine-1280.webp" alt="Zine-style workbench with a bicycle wheel, pressure gauge, fault photos and a marked evidence sheet" width="1280" height="853" fetchpriority="high" decoding="async">
          </picture>
          <figcaption>Original artwork for Bike Check Card.</figcaption>
        </figure>
      </section>
      <section class="workflow" aria-labelledby="workflow-title">
        <div><p class="section-number">01—04</p><h2 id="workflow-title">How to make a check card</h2></div>
        <ol class="steps">
          <li><span>01</span><strong>Add bike and component</strong><p>Name the bike and exact part.</p></li>
          <li><span>02</span><strong>Describe the symptom</strong><p>Record what happened and when.</p></li>
          <li><span>03</span><strong>Add measurements</strong><p>Record pressure, distance, wheel, or GPS readings.</p></li>
          <li><span>04</span><strong>Mark photos</strong><p>Circle the evidence on a photo.</p></li>
        </ol>
      </section>
      <aside class="safety-boundary" aria-labelledby="boundary-title">
        <span class="boundary-mark" aria-hidden="true">!</span>
        <div><h2 id="boundary-title">This card is not safety advice</h2><p>It records evidence. It does not diagnose faults or tell you a bike is safe to ride.</p><p>If you are unsure, pause and ask a qualified mechanic.</p></div>
      </aside>
      <section class="privacy-promise" aria-labelledby="private-title">
        <p class="tape">Your data and photos</p>
        <h2 id="private-title">Photos stay on this device</h2>
        <p>Your card stays in this browser until you export it.</p><p>Shared text links leave photos out.</p>
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
        <div><p class="kicker">Check card / <span id="save-state">${storageMode === 'demo' ? 'Demo changes stay separate' : 'Saved on this device'}</span></p><h1>Record bike-fault evidence</h1><p>Add the bike, component, symptom, and one measurement before sharing.</p></div>
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
    </main>`, storageMode === 'demo' ? 'demo' : 'edit');
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
  return shell(`<main id="main" tabindex="-1" class="shared-main"><article class="print-card"><header><p class="kicker">Shared evidence card</p><h1>${esc(card.title || `${card.component || 'Bike'} check`)}</h1><p class="card-date">Updated ${new Date(card.updatedAt).toLocaleString()}</p></header><section aria-labelledby="reported-symptom"><h2 id="reported-symptom">Reported symptom</h2><p class="symptom-callout">${esc(card.symptom)}</p></section><dl class="evidence-list">${dataRows(card)}</dl>${card.photoCount ? `<p class="photo-omission"><strong>${card.photoCount} local ${card.photoCount === 1 ? 'photo was' : 'photos were'} not included.</strong> Ask the sender for the printed card or JSON backup if needed.</p>` : ''}<aside class="safety-boundary compact"><span class="boundary-mark" aria-hidden="true">!</span><div><h2>Evidence, not a safety verdict</h2><p>This card documents what the rider observed. It does not diagnose the fault or confirm the bike is safe to ride.</p></div></aside><div class="shared-actions"><button type="button" class="button button-secondary" id="print-card">Print card</button><a class="button button-primary" href="/card" data-nav>Make my own card</a></div></article></main>`);
}

function invalidShareTemplate(message: string) {
  return shell(`<main id="main" tabindex="-1" class="message-page"><p class="stamp stamp-danger">Link error</p><h1>This card could not be opened.</h1><p>${esc(message)}</p><a class="button button-primary" href="/" data-nav>Go to Bike Check Card</a></main>`);
}

function notFoundTemplate() {
  return shell(`<main id="main" tabindex="-1" class="message-page"><p class="stamp stamp-danger">404 / Missing page</p><h1>This page is not on the workbench</h1><p>The address may be wrong, or the page may have moved.</p><a class="button button-primary" href="/" data-nav>Return home</a></main>`);
}

async function historyTemplate() {
  const cards = await listHistory('real');
  return shell(`<main id="main" tabindex="-1" class="list-main"><div class="page-heading"><p class="kicker">Saved on this device</p><h1>Saved check cards</h1><p>Export a backup before clearing browser data or changing devices.</p></div>${cards.length ? `<ul class="history-list">${cards.map(card => `<li><div><p class="stamp">${esc(card.component || 'Unsorted')}</p><h2>${esc(card.title || card.bike || 'Untitled bike check')}</h2><p>${esc(card.symptom || 'No symptom recorded')}</p><small>Saved ${new Date(card.updatedAt).toLocaleString()} · ${completion(card).complete}/4 essentials</small></div><div class="history-actions"><button class="button button-secondary" type="button" data-open-card="${esc(card.id)}">Open copy</button><button class="button button-quiet" type="button" data-delete-card="${esc(card.id)}">Delete card</button></div></li>`).join('')}</ul>` : `<section class="empty-state"><span aria-hidden="true">○</span><h2>No saved cards yet</h2><p>Save a copy of your draft when you want to keep it here.</p><a class="button button-primary" href="/card" data-nav>Open draft</a></section>`}</main>`, 'history');
}

function privacyTemplate() {
  return shell(`<main id="main" tabindex="-1" class="legal-main"><p class="kicker">Effective 28 August 2026</p><h1>Privacy</h1><h2>Your bike data stays in this browser</h2><p>Drafts, saved cards, measurements, notes, and photos use browser storage. Bike Check Card does not receive them.</p><p>Clearing site data removes these records. Export a backup first.</p><h2>Demo data stays separate</h2><p>The demo uses its own browser database. It never reads or changes your real draft or saved cards.</p><h2>You choose when to export</h2><p>A shared text link excludes photos. Its card data follows the # symbol and is not sent in a page request.</p><p>Anyone with that link can read its text. Printed cards and JSON backups may include photos.</p><h2>No tracking</h2><p>The app loads no analytics, advertising cookies, remote fonts, or tracking scripts.</p><h2>Questions</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>`, 'privacy');
}

function termsTemplate() {
  return shell(`<main id="main" tabindex="-1" class="legal-main"><p class="kicker">Effective 28 August 2026</p><h1>Terms</h1><h2>This is an evidence tool</h2><p>Bike Check Card records your observations. It does not inspect your bicycle or diagnose faults.</p><p>It does not recommend replacement, confirm warranty eligibility, or determine whether riding is safe.</p><p>Stop riding and ask a qualified mechanic whenever you are uncertain.</p><h2>You control your records</h2><p>You are responsible for your records, exports, and shared links. Keep a backup outside browser storage.</p><h2>Availability and warranty</h2><p>The software is provided “as is” under the MIT License.</p><p>Offline use needs one successful online visit and a supported browser.</p></main>`);
}

type RouteMeta = { title: string; description: string; canonical: string };

function setMetadata(meta: RouteMeta) {
  document.title = meta.title;
  const absolute = new URL(meta.canonical, location.origin).href;
  const values: Record<string, string> = {
    'meta[name="description"]': meta.description,
    'meta[property="og:title"]': meta.title,
    'meta[property="og:description"]': meta.description,
    'meta[property="og:url"]': absolute,
    'meta[name="twitter:title"]': meta.title,
    'meta[name="twitter:description"]': meta.description
  };
  Object.entries(values).forEach(([selector, value]) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value));
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', absolute);
}

function finishRoute(meta: RouteMeta, focusHeading: boolean, scrollY: number) {
  setMetadata(meta);
  bindPageActions();
  const heading = document.querySelector<HTMLHeadingElement>('h1');
  if (heading) {
    heading.tabIndex = -1;
    document.querySelector('#route-announcer')!.textContent = heading.textContent ?? '';
    if (focusHeading) heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: scrollY, behavior: 'auto' });
  firstRender = false;
}

async function renderRoute(focusHeading = !firstRender, scrollY = 0) {
  const url = new URL(location.href);
  const shared = location.hash.startsWith('#card=') ? location.hash.slice(6) : '';
  const requestedMode: StorageMode = url.pathname === '/demo' || url.searchParams.get('demo') === '1' ? 'demo' : 'real';
  if (requestedMode !== storageMode) draft = null;
  storageMode = requestedMode;
  let meta: RouteMeta;
  if (shared) {
    try { app.innerHTML = sharedTemplate(decodeCard(shared)); } catch (error) { app.innerHTML = invalidShareTemplate(error instanceof Error ? error.message : 'The link is invalid.'); }
    meta = { title: 'Shared card — Bike Check Card', description: 'Read a cyclist’s shared bike-fault evidence.', canonical: '/' };
  } else if (url.pathname === '/privacy') {
    app.innerHTML = privacyTemplate();
    meta = { title: 'Privacy — Bike Check Card', description: 'How Bike Check Card stores drafts, photos, demo data, and exports in your browser.', canonical: '/privacy' };
  } else if (url.pathname === '/terms') {
    app.innerHTML = termsTemplate();
    meta = { title: 'Terms — Bike Check Card', description: 'Terms for using Bike Check Card as an evidence record, not safety advice.', canonical: '/terms' };
  } else if (requestedMode === 'demo') {
    draft = draft ?? await loadDraft('demo') ?? sampleCard();
    await saveDraft(draft, 'demo');
    app.innerHTML = editorTemplate(draft);
    bindEditor();
    meta = { title: 'Demo — Bike Check Card', description: 'Try a completed bike-fault record in a separate sample workspace.', canonical: '/demo' };
  } else if (url.pathname === '/card' || (url.pathname === '/' && url.searchParams.get('edit') === '1')) {
    draft = draft ?? await loadDraft('real') ?? newCard();
    await saveDraft(draft, 'real');
    app.innerHTML = editorTemplate(draft);
    bindEditor();
    meta = { title: 'Check card — Bike Check Card', description: 'Record a bike fault with symptoms, measurements, context, and marked photos.', canonical: '/card' };
  } else if (url.pathname === '/cards' || (url.pathname === '/' && url.searchParams.get('view') === 'history')) {
    app.innerHTML = await historyTemplate();
    meta = { title: 'Saved cards — Bike Check Card', description: 'Open bike check cards saved in this browser.', canonical: '/cards' };
  } else if (url.pathname === '/') {
    app.innerHTML = homeTemplate((await listHistory('real')).length);
    meta = { title: 'Bike Check Card — record bike-fault evidence', description: 'For cyclists who need a clear fault record before asking a mechanic or cycling community for help.', canonical: '/' };
  } else {
    app.innerHTML = notFoundTemplate();
    meta = { title: 'Page not found — Bike Check Card', description: 'This Bike Check Card page could not be found.', canonical: url.pathname };
  }
  finishRoute(meta, focusHeading, scrollY);
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
    try { await saveDraft(draft, storageMode); if (state) state.textContent = storageMode === 'demo' ? 'Demo changes stay separate' : 'Saved on this device'; }
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
    await saveDraft(draft, storageMode);
    await renderRoute(false, window.scrollY);
    showToast(`${files.length} ${files.length === 1 ? 'photo' : 'photos'} added locally.`);
  } catch (problem) { if (error) error.textContent = problem instanceof Error ? problem.message : 'This photo could not be added.'; }
}

async function removePhoto(id: string) {
  if (!draft) return;
  const photo = draft.photos.find(item => item.id === id);
  if (!photo || !confirm(`Remove ${photo.caption || 'this photo'} from the card?`)) return;
  draft.photos = draft.photos.filter(item => item.id !== id);
  await saveDraft(draft, storageMode);
  await renderRoute(false, window.scrollY);
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
    await saveDraft(draft!, storageMode);
    dialog.close();
    await renderRoute(false, window.scrollY);
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
  await saveHistory(draft, storageMode);
  showToast(storageMode === 'demo' ? 'Copy saved in the separate demo workspace.' : 'Copy saved to Saved cards.');
}

async function startBlankCard() {
  if (!confirm('Start a blank card? Save or export this draft first if you need to keep it.')) return;
  draft = newCard();
  await replaceDraft(draft, storageMode);
  await renderRoute(false, 0);
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
    await replaceDraft(draft, storageMode);
    await renderRoute(false, 0);
    showToast('Backup imported into the live draft.');
  } catch (error) { setActionError(error instanceof Error ? error.message : 'The backup could not be read.'); }
}

function bindPageActions() {
  document.querySelector('#print-card')?.addEventListener('click', () => window.print());
  document.querySelector('#reset-demo')?.addEventListener('click', async () => {
    draft = sampleCard();
    await replaceDraft(draft, 'demo');
    await renderRoute(false, 0);
    showToast('Demo reset to the original sample.');
  });
  document.querySelector<HTMLAnchorElement>('[data-start-real]')?.addEventListener('click', event => {
    event.preventDefault();
    draft = null;
    storageMode = 'real';
    navigate('/card');
  });
  document.querySelectorAll<HTMLAnchorElement>('a[data-nav]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link.getAttribute('href') ?? '/');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-open-card]').forEach(button => button.addEventListener('click', async () => {
    const card = (await listHistory('real')).find(item => item.id === button.dataset.openCard);
    if (!card || !confirm('Open a copy of this saved card as the live draft?')) return;
    draft = structuredClone(card); draft.id = crypto.randomUUID(); draft.updatedAt = new Date().toISOString(); await replaceDraft(draft, 'real'); navigate('/card');
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-delete-card]').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('Permanently delete this saved card from this device?')) return;
    await deleteHistory(button.dataset.deleteCard ?? '', 'real'); await renderRoute(false, window.scrollY); showToast('Saved card deleted.');
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

window.addEventListener('popstate', event => void renderRoute(true, Number(event.state?.scrollY ?? 0)));
window.addEventListener('hashchange', () => void renderRoute(true, 0));
window.addEventListener('online', () => { document.querySelector('#offline-strip')?.setAttribute('hidden', ''); showToast('Back online. Your local draft is unchanged.'); });
window.addEventListener('offline', () => document.querySelector('#offline-strip')?.removeAttribute('hidden'));

void renderRoute();
registerPwa();
