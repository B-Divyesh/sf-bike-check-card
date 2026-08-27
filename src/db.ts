import type { CheckCard } from './model';

const DB_NAME = 'bike-check-card';
const DB_VERSION = 1;
const DRAFT_KEY = 'current';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

export async function loadDraft() {
  const db = await openDatabase();
  return requestResult<CheckCard | undefined>(db.transaction('drafts').objectStore('drafts').get(DRAFT_KEY));
}

export async function saveDraft(card: CheckCard) {
  const db = await openDatabase();
  const tx = db.transaction('drafts', 'readwrite');
  tx.objectStore('drafts').put(card, DRAFT_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save the draft.'));
  });
}

export async function saveHistory(card: CheckCard) {
  const db = await openDatabase();
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

export async function listHistory() {
  const db = await openDatabase();
  const cards = await requestResult<CheckCard[]>(db.transaction('history').objectStore('history').getAll());
  return cards.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteHistory(id: string) {
  const db = await openDatabase();
  const tx = db.transaction('history', 'readwrite');
  tx.objectStore('history').delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not delete the card.'));
  });
}

export async function replaceDraft(card: CheckCard) {
  await saveDraft(card);
}
