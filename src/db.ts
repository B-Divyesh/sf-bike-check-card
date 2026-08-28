import type { CheckCard } from './model';

export type StorageMode = 'real' | 'demo';

const DB_NAMES: Record<StorageMode, string> = {
  real: 'bike-check-card',
  demo: 'demo:bike-check-card'
};
const DB_VERSION = 1;
const DRAFT_KEY = 'current';

function openDatabase(mode: StorageMode): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAMES[mode], DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts');
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local storage failed.'));
  });
}

export async function loadDraft(mode: StorageMode = 'real') {
  const db = await openDatabase(mode);
  return requestResult<CheckCard | undefined>(db.transaction('drafts').objectStore('drafts').get(DRAFT_KEY));
}

export async function saveDraft(card: CheckCard, mode: StorageMode = 'real') {
  const db = await openDatabase(mode);
  const tx = db.transaction('drafts', 'readwrite');
  tx.objectStore('drafts').put(card, DRAFT_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save the draft.'));
  });
}

export async function saveHistory(card: CheckCard, mode: StorageMode = 'real') {
  const db = await openDatabase(mode);
  const copy = structuredClone(card);
  copy.id = crypto.randomUUID();
  copy.updatedAt = new Date().toISOString();
  const tx = db.transaction('history', 'readwrite');
  tx.objectStore('history').put(copy);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save the card.'));
  });
  return copy;
}

export async function listHistory(mode: StorageMode = 'real') {
  const db = await openDatabase(mode);
  const cards = await requestResult<CheckCard[]>(db.transaction('history').objectStore('history').getAll());
  return cards.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteHistory(id: string, mode: StorageMode = 'real') {
  const db = await openDatabase(mode);
  const tx = db.transaction('history', 'readwrite');
  tx.objectStore('history').delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not delete the card.'));
  });
}

export async function replaceDraft(card: CheckCard, mode: StorageMode = 'real') {
  await saveDraft(card, mode);
}
