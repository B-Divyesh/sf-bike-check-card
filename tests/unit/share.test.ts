import { describe, expect, it } from 'vitest';
import { newCard } from '../../src/model';
import { decodeCard, encodeCard, makeShareUrl } from '../../src/share';

describe('private text sharing', () => {
  it('round-trips Unicode text without photos', () => {
    const card = newCard();
    card.bike = 'Randonneur 🚲';
    card.component = 'Tyre / tube';
    card.symptom = '2 mm cut — fibres visible';
    card.photos.push({ id: 'photo', dataUrl: 'data:image/webp;base64,secret', caption: 'cut' });
    const shared = decodeCard(encodeCard(card));
    expect(shared.bike).toBe(card.bike);
    expect(shared.photoCount).toBe(1);
    expect(JSON.stringify(shared)).not.toContain('base64');
  });

  it('uses a URL fragment so the payload is not sent in requests', () => {
    const card = newCard();
    const url = makeShareUrl(card, 'https://bike-check-card.sociobot.in');
    expect(url).toMatch(/^https:\/\/bike-check-card\.sociobot\.in\/#card=/);
    expect(new URL(url).search).toBe('');
  });

  it('rejects malformed links', () => {
    expect(() => decodeCard('not-valid')).toThrow();
  });
});
