/** Per-page favorite persistence in localStorage. Ordered by insertion
 *  (most-recently-added last). */

const KEY = 'humument:favorites:v2';

export interface FavoriteRef {
  page: number;
}

function read(): FavoriteRef[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is FavoriteRef =>
        !!x && typeof x === 'object' &&
        typeof (x as FavoriteRef).page === 'number',
    );
  } catch {
    return [];
  }
}

function write(list: FavoriteRef[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota — ignore */
  }
}

export function loadFavorites(): FavoriteRef[] {
  return read();
}

export function isFavorite(list: FavoriteRef[], page: number): boolean {
  return list.some((f) => f.page === page);
}

/** Returns the new list. Adds if absent, removes if present. */
export function toggleFavorite(page: number): FavoriteRef[] {
  const current = read();
  const i = current.findIndex((f) => f.page === page);
  const next = i >= 0
    ? [...current.slice(0, i), ...current.slice(i + 1)]
    : [...current, { page }];
  write(next);
  return next;
}
