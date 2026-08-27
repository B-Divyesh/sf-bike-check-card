import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const indexUrl = new URL('../dist/index.html', import.meta.url);
const html = await readFile(indexUrl, 'utf8');
const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
const swUrl = new URL('../dist/sw.js', import.meta.url);
const sw = await readFile(swUrl, 'utf8');
await writeFile(swUrl, sw.replace('/* PRECACHE_ASSETS */', builtAssets.map(asset => `, '${asset}'`).join('')));

for (const route of ['privacy', 'terms']) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true });
  await cp(indexUrl, new URL(`../dist/${route}/index.html`, import.meta.url));
}
