import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/** Matches editor globals — tool UI + readable JS. */
const INK = 'oklch(0.14 0.008 260)';
const MUTED = 'oklch(0.44 0.012 260)';
const SUBTLE = 'oklch(0.60 0.01 260)';
const SURFACE = 'oklch(0.978 0.004 260)';
const SURFACE_2 = 'oklch(0.955 0.006 260)';
const BG = 'oklch(0.995 0.002 260)';
const ACCENT = 'oklch(0.52 0.16 265)';
const ACCENT_SOFT = 'oklch(0.52 0.16 265 / 0.14)';
const ERROR = 'oklch(0.52 0.19 25)';
const SELECTED = 'oklch(0.52 0.16 265 / 0.12)';

export const editorTheme = EditorView.theme(
  {
    '&': {
      color: INK,
      backgroundColor: BG,
      height: '100%',
      fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
      fontSize: '12px',
    },
    '.cm-content': {
      caretColor: ACCENT,
      padding: '10px 0',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: ACCENT, borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: SELECTED,
      color: INK,
    },
    '.cm-activeLine': { backgroundColor: SURFACE },
    '.cm-activeLineGutter': { backgroundColor: SURFACE, color: INK },
    '.cm-gutters': {
      backgroundColor: BG,
      color: SUBTLE,
      borderRight: `1px solid ${SURFACE_2}`,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 6px' },
    '.cm-scroller': { fontFamily: 'inherit' },
    '.cm-tooltip': {
      backgroundColor: BG,
      border: `1px solid ${SURFACE_2}`,
      borderRadius: '3px',
      boxShadow: '0 8px 28px -12px oklch(0 0 0 / 0.14)',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '11px',
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: ACCENT_SOFT,
      color: INK,
    },
    '.cm-panel': {
      backgroundColor: SURFACE,
      borderTop: `1px solid ${SURFACE_2}`,
      color: INK,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    },
    '.cm-panel input, .cm-panel button': {
      backgroundColor: BG,
      color: INK,
      border: `1px solid ${SURFACE_2}`,
      borderRadius: '3px',
      fontFamily: 'inherit',
      padding: '2px 6px',
    },
    '.cm-searchMatch': { backgroundColor: 'oklch(0.94 0.06 95)', outline: 'none' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: ACCENT, color: 'oklch(0.99 0 0)' },
    '.cm-matchingBracket': { backgroundColor: SELECTED, outline: 'none' },
    // Read-only header lines (system-injected SELECTION / GROUPS). Subtly
    // tinted so the user sees they're not editable.
    '.cm-readonly-line': {
      backgroundColor: SURFACE_2,
    },
    '.cm-readonly-line .tok-comment': { color: SUBTLE },
  },
  { dark: false },
);

const highlight = HighlightStyle.define([
  { tag: t.comment, color: MUTED },
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.modifier], color: ACCENT, fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'oklch(0.38 0.12 265)' },
  { tag: [t.number, t.bool, t.null], color: ERROR },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: INK, fontWeight: '500' },
  { tag: [t.variableName, t.propertyName, t.attributeName], color: INK },
  { tag: [t.typeName, t.className], color: INK },
  { tag: [t.bracket, t.squareBracket, t.brace, t.paren, t.punctuation], color: SUBTLE },
  { tag: t.regexp, color: 'oklch(0.42 0.1 265)' },
  { tag: t.invalid, color: ERROR, textDecoration: 'underline wavy' },
]);

export const editorHighlight = syntaxHighlighting(highlight);

/** Legacy aliases — kept so existing imports keep working. */
export const brutalistTheme = editorTheme;
export const brutalistHighlight = editorHighlight;
