import { describe, expect, it } from 'vitest';
import { completion, isShareReady, newCard } from '../../src/model';

describe('check card completion', () => {
  it('requires bike, component, symptom and any one measurement', () => {
    const card = newCard();
    expect(completion(card).complete).toBe(0);
    card.bike = 'Touring bike';
    card.component = 'Tyre / tube';
    card.symptom = 'Sidewall cut with visible fibres';
    expect(isShareReady(card)).toBe(false);
    card.pressure = '65 psi';
    expect(completion(card)).toMatchObject({ complete: 4, total: 4, measurement: true });
    expect(isShareReady(card)).toBe(true);
  });

  it('accepts a sensor or GPS reading as the measurement', () => {
    const card = newCard();
    card.bike = 'Commuter';
    card.component = 'Sensor / computer';
    card.symptom = 'Speed drops intermittently';
    card.wheelSpeed = '7 km/h';
    expect(isShareReady(card)).toBe(true);
  });
});
