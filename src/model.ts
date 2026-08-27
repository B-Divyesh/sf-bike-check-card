export type PhotoEvidence = {
  id: string;
  dataUrl: string;
  annotatedDataUrl?: string;
  caption: string;
};

export type CheckCard = {
  id: string;
  title: string;
  bike: string;
  component: string;
  mileage: string;
  pressure: string;
  symptom: string;
  started: string;
  timeline: string;
  rideContext: string;
  wheelSpeed: string;
  gpsSpeed: string;
  conditions: string;
  notes: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
  photos: PhotoEvidence[];
};

export type SharedCard = Omit<CheckCard, 'photos'> & { photoCount: number };

export function newCard(): CheckCard {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '', bike: '', component: '', mileage: '', pressure: '', symptom: '',
    started: '', timeline: '', rideContext: '', wheelSpeed: '', gpsSpeed: '',
    conditions: '', notes: '', nextStep: '', createdAt: now, updatedAt: now, photos: []
  };
}

export function completion(card: CheckCard | SharedCard) {
  const measurement = Boolean(card.mileage.trim() || card.pressure.trim() || card.wheelSpeed.trim() || card.gpsSpeed.trim());
  const checks = [Boolean(card.bike.trim()), Boolean(card.component.trim()), Boolean(card.symptom.trim()), measurement];
  return { complete: checks.filter(Boolean).length, total: checks.length, checks, measurement };
}

export function isShareReady(card: CheckCard) {
  return completion(card).complete === 4;
}
