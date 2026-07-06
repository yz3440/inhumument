/** Per-page sketch persistence in localStorage. */

const ROOT = 'humument:sketch:v2';

function key(page: number): string {
  return `${ROOT}:${page}`;
}

export function loadSketch(page: number): string | null {
  try {
    return localStorage.getItem(key(page));
  } catch {
    return null;
  }
}

export function saveSketch(page: number, src: string): void {
  try {
    localStorage.setItem(key(page), src);
  } catch {
    /* quota — ignore */
  }
}

export function clearSketch(page: number): void {
  try {
    localStorage.removeItem(key(page));
  } catch {
    /* */
  }
}
