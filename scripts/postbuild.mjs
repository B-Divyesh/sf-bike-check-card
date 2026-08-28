import { mkdir, readFile, writeFile } from 'node:fs/promises';

const indexUrl = new URL('../dist/index.html', import.meta.url);
const html = await readFile(indexUrl, 'utf8');
const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
const swUrl = new URL('../dist/sw.js', import.meta.url);
const sw = await readFile(swUrl, 'utf8');
await writeFile(swUrl, sw.replace('/* PRECACHE_ASSETS */', builtAssets.map(asset => `, '${asset}'`).join('')));

const routeDocuments = {
  demo: ['Demo — Bike Check Card', 'Try a completed bike-fault record in a separate sample workspace.'],
  card: ['Check card — Bike Check Card', 'Record a bike fault with symptoms, measurements, context, and marked photos.'],
  cards: ['Saved cards — Bike Check Card', 'Open bike check cards saved in this browser.'],
  privacy: ['Privacy — Bike Check Card', 'How Bike Check Card stores drafts, photos, demo data, and exports in your browser.'],
  terms: ['Terms — Bike Check Card', 'Terms for using Bike Check Card as an evidence record, not safety advice.']
};

function routeHtml(route, title, description) {
  const canonical = `https://bike-check-card.sociobot.in/${route}`;
  return html
    .replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]+" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]+" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]+" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]+" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]+" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]+" \/>/, `<meta name="twitter:description" content="${description}" />`);
}

for (const [route, [title, description]] of Object.entries(routeDocuments)) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true });
  await writeFile(new URL(`../dist/${route}/index.html`, import.meta.url), routeHtml(route, title, description));
}

await writeFile(new URL('../dist/404.html', import.meta.url), routeHtml('404', 'Page not found — Bike Check Card', 'This Bike Check Card page could not be found.'));
