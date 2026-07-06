/**
 * Maps a stored page key (the DB primary key for a page) to the printed page
 * label inside the book — the number actually inked on the paper. The first
 * content page is "1", and we walk the sorted list of content pages from there.
 *
 * The DB key is an internal detail; user-visible UI should always show the
 * printed page label returned by `printedPage`.
 *
 * The content page list is loaded asynchronously by the app shell (see
 * `App.tsx`) and pushed into this module via `setPageList` so `printedPage`
 * can stay synchronous for render-time use.
 */
let pageList: number[] = [];

/** Prime the module-level page list used by `printedPage`. */
export function setPageList(pages: number[]): void {
  pageList = pages;
}

export function printedPage(pageNum: number): number {
  if (pageList.length === 0) return pageNum;
  const i = pageList.indexOf(pageNum);
  return i >= 0 ? i + 1 : pageNum;
}

export function printedPageFromIndex(index: number): number {
  return index + 1;
}

/** Convert an integer in [1, 3999] to its uppercase Roman numeral form.
 *  Returns the input as a decimal string for out-of-range inputs.
 *  Used for chapter Roman numerals. */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return String(n);
  const pairs: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
    [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  let rem = n;
  for (const [v, s] of pairs) {
    while (rem >= v) {
      out += s;
      rem -= v;
    }
  }
  return out;
}
