import type { Word } from 'inhumument-lib';

/** Build the read-only header that prefixes every CodeMirror sketch.
 *  Declares two `const`s — `SELECTION` (the pending group) and `GROUPS`
 *  (saved groups, NOT including pending). Each Word becomes a JSON literal
 *  on its own line so the user can read / copy values directly. */
export function buildSelectionHeader(
  pendingIds: number[],
  groupsIds: number[][],
  wordsById: Map<number, Word>,
): string {
  const resolve = (ids: number[]): Word[] =>
    ids.map((id) => wordsById.get(id)).filter((w): w is Word => !!w);

  const sel = resolve(pendingIds);
  const grps = groupsIds.map(resolve);

  const lines: string[] = [
    '// === SELECTION (auto-generated, read-only) ===',
    '// Click words in the Select tab. G commits a group, Esc clears.',
  ];

  if (sel.length === 0) {
    lines.push('const SELECTION = [];');
  } else {
    lines.push('const SELECTION = [');
    for (const w of sel) lines.push(`  ${JSON.stringify(w)},`);
    lines.push('];');
  }

  if (grps.length === 0) {
    lines.push('const GROUPS = [];');
  } else {
    lines.push('const GROUPS = [');
    for (const g of grps) {
      lines.push('  [');
      for (const w of g) lines.push(`    ${JSON.stringify(w)},`);
      lines.push('  ],');
    }
    lines.push('];');
  }

  lines.push('// === END SELECTION ===');
  lines.push('');
  return lines.join('\n');
}
