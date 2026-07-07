/** Per-page sketch persistence in IndexedDB, keyed by page number.
 *  Legacy localStorage entries ('humument:sketch:v2:*') are migrated on
 *  first read and then removed. */

import { idbGet, idbPut, idbDelete, SKETCH_STORE } from './idb';

const LEGACY_PREFIX = 'humument:sketch:v2:';

let migration: Promise<void> | null = null;

function ensureMigrated(): Promise<void> {
  if (!migration) migration = migrateLegacySketches();
  return migration;
}

async function migrateLegacySketches(): Promise<void> {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(LEGACY_PREFIX)) keys.push(k);
    }
    for (const k of keys) {
      const page = Number(k.slice(LEGACY_PREFIX.length));
      const src = localStorage.getItem(k);
      if (!Number.isFinite(page) || src === null) continue;
      // Existing IndexedDB entries win; legacy key is only dropped once the
      // sketch is safely in IndexedDB either way.
      const existing = await idbGet<string>(SKETCH_STORE, page);
      if (existing === undefined) await idbPut(SKETCH_STORE, page, src);
      localStorage.removeItem(k);
    }
  } catch {
    /* no localStorage or no IndexedDB — nothing to migrate */
  }
}

export async function loadSketch(page: number): Promise<string | null> {
  try {
    await ensureMigrated();
    return (await idbGet<string>(SKETCH_STORE, page)) ?? null;
  } catch {
    return null;
  }
}

export async function saveSketch(page: number, src: string): Promise<void> {
  try {
    await ensureMigrated();
    await idbPut(SKETCH_STORE, page, src);
  } catch {
    /* private mode / quota — ignore */
  }
}

export async function clearSketch(page: number): Promise<void> {
  try {
    await ensureMigrated();
    await idbDelete(SKETCH_STORE, page);
  } catch {
    /* */
  }
}
