import type { CheckCard } from './model';

export function sampleCard(): CheckCard {
  return {
    id: 'demo-wheel-sensor-check',
    title: 'Commuter wheel-sensor mismatch',
    bike: 'Steel commuter, 700c',
    component: 'Sensor / computer',
    mileage: '6,420 km',
    pressure: '62 psi front / 65 psi rear',
    symptom: 'Wheel speed drops to 7 km/h while GPS stays near 28 km/h.',
    started: 'After 18 km of a wet evening ride',
    timeline: 'Intermittent for 6 km. Reading returned after each rough patch, then dropped again under steady speed.',
    rideContext: 'Flat cycleway, light rain, no recent wheel removal. Sensor magnet was wiped clean before the ride.',
    wheelSpeed: '7 km/h',
    gpsSpeed: '28 km/h',
    conditions: 'Wet, 14°C, paved cycleway',
    notes: 'Magnet passes the sensor with a visible 5 mm gap. No loose spokes or wheel play noticed.',
    nextStep: 'Ask a mechanic',
    createdAt: '2026-08-28T08:30:00.000Z',
    updatedAt: '2026-08-28T08:42:00.000Z',
    photos: [{
      id: 'demo-sensor-photo',
      dataUrl: '/assets/demo-sensor.webp',
      annotatedDataUrl: '/assets/demo-sensor.webp',
      caption: 'Sensor and magnet gap circled in red'
    }]
  };
}
