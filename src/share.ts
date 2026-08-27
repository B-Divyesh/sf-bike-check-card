import type { CheckCard, SharedCard } from './model';

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64ToBytes(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export function toSharedCard(card: CheckCard): SharedCard {
  const { photos, ...textCard } = card;
  return { ...textCard, photoCount: photos.length };
}

export function encodeCard(card: CheckCard) {
  const json = JSON.stringify(toSharedCard(card));
  return bytesToBase64(new TextEncoder().encode(json));
}

export function decodeCard(value: string): SharedCard {
  const decoded = new TextDecoder().decode(base64ToBytes(value));
  const card = JSON.parse(decoded) as Partial<SharedCard>;
  const required = ['id', 'bike', 'component', 'symptom', 'createdAt'] as const;
  if (!required.every(key => typeof card[key] === 'string') || typeof card.photoCount !== 'number') {
    throw new Error('This check-card link is incomplete.');
  }
  return card as SharedCard;
}

export function makeShareUrl(card: CheckCard, base = window.location.origin) {
  const encoded = encodeCard(card);
  if (encoded.length > 12000) throw new Error('This card is too long for a link. Shorten the notes or export JSON instead.');
  return `${base}/#card=${encoded}`;
}
