/** Minimal promise wrapper around IndexedDB for editor persistence. */

const DB_NAME = 'inhumument-editor';
const DB_VERSION = 1;

/** Per-page sketch source, keyed by page number. */
export const SKETCH_STORE = 'sketches';
/** Small one-off values (favorites list, etc.), keyed by string. */
export const KV_STORE = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(SKETCH_STORE)) db.createObjectStore(SKETCH_STORE);
        if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    });
    // A failed open (private mode, blocked upgrade) shouldn't poison every
    // later call — let the next one retry.
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

async function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  return withStore(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
}

export function idbPut(store: string, key: IDBValidKey, value: unknown): Promise<IDBValidKey> {
  return withStore(store, 'readwrite', (s) => s.put(value, key));
}

export function idbDelete(store: string, key: IDBValidKey): Promise<undefined> {
  return withStore(store, 'readwrite', (s) => s.delete(key));
}
