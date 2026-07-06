import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Humument, type Word } from 'inhumument-lib';
import { useSketchStore } from '@/hooks/useSketchStore';
import { editorTheme, editorHighlight } from '@/lib/codemirror-theme';
import { buildSelectionHeader } from '@/lib/selection-header';
import {
  protectedRangeExtension,
  setProtectedRange,
} from '@/lib/editor-protected-range';

export function Editor() {
  const ref = useRef<ReactCodeMirrorRef>(null);

  const dbReady = useSketchStore((s) => s.dbReady);
  const page = useSketchStore((s) => s.page);
  const sketch = useSketchStore((s) => s.sketch);
  const setSketch = useSketchStore((s) => s.setSketch);
  const pendingIds = useSketchStore((s) => s.pendingIds);
  const groupsIds = useSketchStore((s) => s.groupsIds);

  const [wordsById, setWordsById] = useState<Map<number, Word>>(
    () => new Map<number, Word>(),
  );
  useEffect(() => {
    if (!dbReady) return;
    let ignore = false;
    Humument.catalog.getWords(page).then((words) => {
      if (!ignore) {
        setWordsById(new Map(words.map((w) => [w.id, w] as const)));
      }
    });
    return () => { ignore = true; };
  }, [dbReady, page]);

  const header = useMemo(
    () => buildSelectionHeader(pendingIds, groupsIds, wordsById),
    [pendingIds, groupsIds, wordsById],
  );

  // Tracks what's currently in the editor doc. Refs (not state) to avoid
  // re-render loops when we sync via dispatch.
  const cur = useRef({ header: '', body: '' });

  // The CodeMirror `value` prop is read once at mount; subsequent updates
  // go through dispatched transactions on the EditorView, never through
  // the prop. We freeze the initial value with an empty deps array.
  const initialValue = useMemo(() => {
    cur.current = { header, body: sketch };
    return header + sketch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed the protected-range field on mount.
  useEffect(() => {
    const view = ref.current?.view;
    if (!view) return;
    view.dispatch({
      effects: setProtectedRange.of({ from: 0, to: cur.current.header.length }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync the header range whenever it changes (selection mutation,
  // page change, etc.).
  //
  // IMPORTANT: update `cur.current.header` BEFORE dispatching. CodeMirror
  // fires onChange synchronously inside `dispatch()`, and our handleChange
  // peels the body via `value.slice(cur.current.header.length)`. If we
  // updated the ref AFTER, handleChange would read the OLD length and slice
  // header bytes into the body, corrupting the stored sketch.
  useEffect(() => {
    const view = ref.current?.view;
    if (!view) return;
    if (header === cur.current.header) return;
    const oldEnd = cur.current.header.length;
    cur.current.header = header;
    view.dispatch({
      changes: { from: 0, to: oldEnd, insert: header },
      effects: setProtectedRange.of({ from: 0, to: header.length }),
    });
  }, [header]);

  // Re-sync the body when the store's sketch changes externally — page
  // change loads a saved/default sketch via the App's setSketch effect.
  useEffect(() => {
    const view = ref.current?.view;
    if (!view) return;
    if (sketch === cur.current.body) return;
    const headerLen = cur.current.header.length;
    cur.current.body = sketch;
    view.dispatch({
      changes: {
        from: headerLen,
        to: view.state.doc.length,
        insert: sketch,
      },
    });
  }, [sketch]);

  // User edits inside the body — peel off the header and update the store.
  const handleChange = useCallback(
    (value: string) => {
      const headerLen = cur.current.header.length;
      const body = value.slice(headerLen);
      if (body !== cur.current.body) {
        cur.current.body = body;
        setSketch(body);
      }
    },
    [setSketch],
  );

  return (
    <div className="h-full overflow-hidden bg-background">
      <CodeMirror
        ref={ref}
        value={initialValue}
        onChange={handleChange}
        theme={editorTheme}
        extensions={[
          javascript({ jsx: false }),
          editorHighlight,
          protectedRangeExtension,
        ]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
          tabSize: 2,
          indentOnInput: true,
        }}
        height="100%"
        style={{ height: '100%' }}
      />
    </div>
  );
}
