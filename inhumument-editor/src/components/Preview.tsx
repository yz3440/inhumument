import { useEffect, useMemo, useRef, useState } from 'react';
import { Humument, type Word } from 'inhumument-lib';
import { useSketchStore, type PreviewTab } from '@/hooks/useSketchStore';
import { useDebounced } from '@/hooks/useDebounced';
import { Download, Minus, Plus } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button-classes';
import { Tabs, tabsClasses } from '@/components/ui/tabs';
import { printedPage } from '@/lib/page-label';
import { buildSelectionHeader } from '@/lib/selection-header';
import { SelectView } from '@/components/SelectView';

const ZOOM_STEP = 1.25;

export function Preview() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  const dbReady = useSketchStore((s) => s.dbReady);
  const page = useSketchStore((s) => s.page);
  const sketch = useSketchStore((s) => s.sketch);
  const reloadKey = useSketchStore((s) => s.reloadKey);
  const liveRun = useSketchStore((s) => s.liveRun);
  const appendConsole = useSketchStore((s) => s.appendConsole);

  const viewMode = useSketchStore((s) => s.viewMode);
  const viewZoom = useSketchStore((s) => s.viewZoom);
  const actualZoom = useSketchStore((s) => s.actualZoom);
  const setViewFit = useSketchStore((s) => s.setViewFit);
  const setViewZoom = useSketchStore((s) => s.setViewZoom);
  const setActualZoom = useSketchStore((s) => s.setActualZoom);

  const previewTab = useSketchStore((s) => s.previewTab);
  const setPreviewTab = useSketchStore((s) => s.setPreviewTab);

  const pendingIds = useSketchStore((s) => s.pendingIds);
  const groupsIds = useSketchStore((s) => s.groupsIds);
  const commitGroup = useSketchStore((s) => s.commitGroup);
  const clearSelection = useSketchStore((s) => s.clearSelection);

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

  const debouncedSketch = useDebounced(sketch, 600);
  const bodyToRun = liveRun ? debouncedSketch : sketch;
  const fullSketch = header + bodyToRun;

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as {
        src?: string; kind?: string; level?: string; message?: string; line?: number;
        scale?: number;
      } | null;
      if (!d || d.src !== 'humument-preview') return;
      if (d.kind === 'ready') {
        setIframeReady(true);
      } else if (d.kind === 'log') {
        appendConsole({
          level: (d.level as 'log' | 'warn' | 'error' | 'info') ?? 'log',
          message: d.message ?? '',
        });
      } else if (d.kind === 'sketch-error') {
        const lineMsg = d.line ? ` (line ${d.line})` : '';
        appendConsole({ level: 'error', message: (d.message ?? 'error') + lineMsg, line: d.line });
      } else if (d.kind === 'view-applied' && typeof d.scale === 'number') {
        setActualZoom(d.scale);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [appendConsole, setActualZoom]);

  useEffect(() => {
    setIframeReady(false);
  }, [page, reloadKey]);

  // Run the sketch. In Live mode, re-run when the full sketch text changes
  // (which includes header changes from selection mutation). Otherwise, only
  // on reloadKey / page changes.
  useEffect(() => {
    if (!iframeReady) return;
    const win = ref.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        kind: 'run',
        page,
        pageLabel: printedPage(page),
        sketch: fullSketch,
      },
      '*',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    iframeReady, page, reloadKey,
    liveRun ? fullSketch : null,
  ]);

  useEffect(() => {
    if (!iframeReady) return;
    const win = ref.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      viewMode === 'fit'
        ? { kind: 'view', mode: 'fit' }
        : { kind: 'view', mode: 'manual', value: viewZoom },
      '*',
    );
  }, [iframeReady, viewMode, viewZoom]);

  const displayPct = Math.round(actualZoom * 100);
  const showChip = pendingIds.length > 0 || groupsIds.length > 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <Tabs.Root
        value={previewTab}
        onValueChange={(v) => setPreviewTab(v as PreviewTab)}
        className="flex h-full flex-col"
      >
        <Tabs.List className={tabsClasses.list}>
          <Tabs.Trigger value="preview" className={tabsClasses.trigger}>
            Preview
          </Tabs.Trigger>
          <Tabs.Trigger value="select" className={tabsClasses.trigger}>
            Select
          </Tabs.Trigger>
        </Tabs.List>
        <div className="relative flex-1">
          <Tabs.Content
            value="preview"
            forceMount
            className="absolute inset-0 flex flex-col data-[state=inactive]:hidden"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-soft bg-background px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sketch
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={setViewFit}
                  title="Fit canvas to pane"
                  className={buttonClasses({ variant: viewMode === 'fit' ? 'default' : 'ghost', size: 'sm' })}
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => setViewZoom((viewMode === 'fit' ? actualZoom : viewZoom) / ZOOM_STEP)}
                  title="Zoom out"
                  aria-label="Zoom out"
                  className={buttonClasses({ variant: 'ghost', size: 'icon' })}
                >
                  <Minus />
                </button>
                <button
                  type="button"
                  onClick={() => setViewZoom(1)}
                  className="min-w-11 rounded-[var(--radius-md)] px-2 py-0.5 text-center font-mono text-[11px] text-foreground transition-colors hover:bg-muted/60"
                  title="Reset to 100%"
                >
                  {displayPct}%
                </button>
                <button
                  type="button"
                  onClick={() => setViewZoom((viewMode === 'fit' ? actualZoom : viewZoom) * ZOOM_STEP)}
                  title="Zoom in"
                  aria-label="Zoom in"
                  className={buttonClasses({ variant: 'ghost', size: 'icon' })}
                >
                  <Plus />
                </button>
                <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    const win = ref.current?.contentWindow;
                    if (win) win.postMessage({ kind: 'export' }, '*');
                  }}
                  title="Export canvas as PNG"
                  aria-label="Export canvas as PNG"
                  className={buttonClasses({ variant: 'ghost', size: 'icon' })}
                >
                  <Download />
                </button>
              </div>
            </div>
            <iframe
              key={`${page}-${reloadKey}`}
              ref={ref}
              src="/preview.html"
              sandbox="allow-scripts allow-same-origin allow-downloads"
              className="flex-1 w-full border-none bg-muted/30"
              title="sketch preview"
            />
          </Tabs.Content>

          <Tabs.Content
            value="select"
            forceMount
            className="absolute inset-0 flex flex-col data-[state=inactive]:hidden"
          >
            <SelectView />
          </Tabs.Content>

          {showChip && (
            <div
              className="pointer-events-auto absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-popover px-2 py-1 text-[11px] shadow-[var(--shadow-float)]"
              role="status"
              aria-label="Word selection"
            >
              <span className="font-mono tabular-nums text-foreground">
                {pendingIds.length} selected
              </span>
              {groupsIds.length > 0 && (
                <span className="text-muted-foreground">
                  · {groupsIds.length} group{groupsIds.length === 1 ? '' : 's'}
                </span>
              )}
              <button
                type="button"
                onClick={commitGroup}
                disabled={pendingIds.length === 0}
                title="Save current selection as a group (G)"
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                + Group
              </button>
              <button
                type="button"
                onClick={clearSelection}
                title="Clear selection (Esc)"
                className={buttonClasses({ variant: 'ghost', size: 'sm' })}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}
