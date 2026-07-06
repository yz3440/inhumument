import { type ChapterRef } from 'inhumument-lib';

export interface ChapterSection {
  /** Chapter Roman, or null for the synthetic "Front matter" section. */
  roman: string | null;
  /** Display label, e.g. "CHAPTER III" or "Front matter". */
  label: string;
  /** DB page keys for this chapter, in order. */
  pages: number[];
  /** Printed page label for each entry in `pages` (1-based). */
  pageLabels: number[];
}

/** Build the structural list for the Pages tab: the content pages sliced into
 *  chapters at the boundaries reported by `Humument.catalog.listChapters()`.
 *  Pages preceding the first chapter become a synthetic "Front matter"
 *  section. */
export function buildSections(
  pages: number[],
  chapters: ChapterRef[],
): ChapterSection[] {
  // Index of each chapter's start within `pages`.
  const starts = chapters.map((c) => pages.indexOf(c.pageNum));

  const chs: ChapterSection[] = [];

  // Synthetic front-matter for pages before the first chapter.
  const firstStart = starts.find((i) => i >= 0);
  const frontEnd = firstStart === undefined ? pages.length : firstStart;
  if (frontEnd > 0) {
    const slice = pages.slice(0, frontEnd);
    chs.push({
      roman: null,
      label: 'Front matter',
      pages: slice,
      pageLabels: slice.map((_, i) => i + 1),
    });
  }

  // One chapter per detected boundary.
  for (let i = 0; i < chapters.length; i++) {
    const startIdx = starts[i];
    if (startIdx < 0) continue;
    const nextStart = starts.slice(i + 1).find((j) => j >= 0);
    const endIdx = nextStart === undefined ? pages.length : nextStart;
    const slice = pages.slice(startIdx, endIdx);
    chs.push({
      roman: chapters[i].roman,
      label: chapters[i].label,
      pages: slice,
      pageLabels: slice.map((_, j) => startIdx + j + 1),
    });
  }

  return chs;
}
