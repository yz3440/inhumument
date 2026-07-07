/** Per-page favorite persistence in IndexedDB. Ordered by insertion
 *  (most-recently-added last). The legacy localStorage entry
 *  ('humument:favorites:v2') is migrated on first load and then removed. */

import { idbGet, idbPut, KV_STORE } from './idb';

const KEY = 'favorites';
const LEGACY_KEY = 'humument:favorites:v2';

export interface FavoriteRef {
  page: number;
}

function sanitize(parsed: unknown): FavoriteRef[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (x): x is FavoriteRef =>
      !!x && typeof x === 'object' &&
      typeof (x as FavoriteRef).page === 'number',
  );
}

export async function loadFavorites(): Promise<FavoriteRef[]> {
  try {
    const stored = await idbGet<unknown>(KV_STORE, KEY);
    if (stored !== undefined) return sanitize(stored);

    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const migrated = sanitize(JSON.parse(raw));
    await idbPut(KV_STORE, KEY, migrated);
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch {
    return [];
  }
}

export function isFavorite(list: FavoriteRef[], page: number): boolean {
  return list.some((f) => f.page === page);
}

/** Returns the new list (adds if absent, removes if present) and persists it
 *  in the background. */
export function toggleFavorite(list: FavoriteRef[], page: number): FavoriteRef[] {
  const i = list.findIndex((f) => f.page === page);
  const next = i >= 0
    ? [...list.slice(0, i), ...list.slice(i + 1)]
    : [...list, { page }];
  void idbPut(KV_STORE, KEY, next).catch(() => {
    /* private mode / quota — ignore */
  });
  return next;
}
