import {
  EditorState,
  StateEffect,
  StateField,
  type Extension,
} from '@codemirror/state';
import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';

/** A character range in the doc that the user cannot edit. Programmatic
 *  transactions (no userEvent) pass through; user-typed input/delete
 *  transactions get rejected if they overlap the range. */
export interface ProtectedRange {
  from: number;
  to: number;
}

/** Dispatch with `effects: setProtectedRange.of({ from, to })` to update. */
export const setProtectedRange = StateEffect.define<ProtectedRange>();

const protectedRangeField = StateField.define<ProtectedRange>({
  create: () => ({ from: 0, to: 0 }),
  update(value, tr) {
    let v: ProtectedRange = {
      from: tr.changes.mapPos(value.from),
      to: tr.changes.mapPos(value.to),
    };
    for (const e of tr.effects) {
      if (e.is(setProtectedRange)) v = e.value;
    }
    return v;
  },
});

const protectedRangeFilter = EditorState.transactionFilter.of((tr) => {
  // Allow programmatic transactions (no userEvent annotation) — those are
  // how the Editor itself injects header / body updates.
  const isUserEdit = tr.isUserEvent('input') || tr.isUserEvent('delete');
  if (!isUserEdit) return tr;
  if (!tr.docChanged) return tr;
  const r = tr.startState.field(protectedRangeField, false);
  if (!r || r.to <= r.from) return tr;
  let blocked = false;
  tr.changes.iterChangedRanges((fromA, toA) => {
    if (fromA < r.to && toA > r.from) blocked = true;
  });
  return blocked ? [] : tr;
});

const protectedLineDeco = EditorView.decorations.compute(
  [protectedRangeField],
  (state): DecorationSet => {
    const r = state.field(protectedRangeField);
    if (r.to <= r.from) return Decoration.none;
    const startLine = state.doc.lineAt(r.from).number;
    // r.to typically points to the position right AFTER the trailing newline
    // of the last header line, which is the start of the next (body) line.
    // Step back by one so the decoration ends on the actual last header line,
    // not the line that immediately follows it.
    const endPos = Math.max(r.from, Math.min(r.to - 1, state.doc.length - 1));
    const endLine = state.doc.lineAt(endPos).number;
    return Decoration.set(
      Array.from({ length: endLine - startLine + 1 }, (_, i) => {
        const line = state.doc.line(startLine + i);
        return Decoration.line({ class: 'cm-readonly-line' }).range(line.from);
      }),
    );
  },
);

/** Bundle: state field + transaction filter + line decoration. Drop into a
 *  CodeMirror `extensions` array. */
export const protectedRangeExtension: Extension = [
  protectedRangeField,
  protectedRangeFilter,
  protectedLineDeco,
];
