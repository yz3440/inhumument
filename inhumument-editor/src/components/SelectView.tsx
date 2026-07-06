import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Humument, type Word } from 'inhumument-lib';
import { Minus, Plus } from 'lucide-react';
import { useSketchStore } from '@/hooks/useSketchStore';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/utils';

const ZOOM_STEP = 1.25;
const FIT_PADDING = 32;

/** A pure-React word selector. Renders the page image plus an absolutely
 *  positioned overlay of word `<button>`s. Click toggles selection; hover
 *  shows an OCR tooltip. State lives in the parent store so the iframe
 *  preview stays in sync. */
export function SelectView() {
  const dbReady = useSketchStore((s) => s.dbReady);
  const page = useSketchStore((s) => s.page);

  const pendingIds = useSketchStore((s) => s.pendingIds);
  const groupsIds = useSketchStore((s) => s.groupsIds);
  const toggleWord = useSketchStore((s) => s.toggleWord);

  const viewMode = useSketchStore((s) => s.selectViewMode);
  const viewZoom = useSketchStore((s) => s.selectViewZoom);
  const actualZoom = useSketchStore((s) => s.selectActualZoom);
  const setViewFit = useSketchStore((s) => s.setSelectViewFit);
  const setViewZoom = useSketchStore((s) => s.setSelectViewZoom);
  const setActualZoom = useSketchStore((s) => s.setSelectActualZoom);

  const [words, setWords] = useState<Word[]>([]);
  useEffect(() => {
    if (!dbReady) return;
    let ignore = false;
    Humument.catalog.getWords(page).then((w) => {
      if (!ignore) setWords(w);
    });
    return () => { ignore = true; };
  }, [dbReady, page]);

  const imageUrl = useMemo(
    () => Humument.catalog.pageImageUrl(page),
    [page],
  );

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Track container size for fit-mode math.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-fetch natural dimensions when page changes (forces image reload).
  useEffect(() => {
    setNatural(null);
  }, [imageUrl]);

  // Compute the actual scale based on fit/manual mode.
  const scale = useMemo(() => {
    if (!natural) return 1;
    if (viewMode === 'manual') return clampScale(viewZoom);
    if (containerSize.w === 0 || containerSize.h === 0) return 1;
    const sw = (containerSize.w - FIT_PADDING) / natural.w;
    const sh = (containerSize.h - FIT_PADDING) / natural.h;
    return clampScale(Math.min(sw, sh, 1));
  }, [natural, viewMode, viewZoom, containerSize]);

  useEffect(() => {
    setActualZoom(scale);
  }, [scale, setActualZoom]);

  const displayPct = Math.round(actualZoom * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-soft bg-background px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Select words
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={setViewFit}
            title="Fit page to pane"
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
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 overflow-auto bg-muted/30">
        {!dbReady ? (
          <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
            Loading database…
          </div>
        ) : (
          <div
            className="relative mx-auto my-4"
            style={{
              width: natural ? Math.round(natural.w * scale) : 'auto',
              height: natural ? Math.round(natural.h * scale) : 'auto',
            }}
          >
            <img
              key={imageUrl}
              src={imageUrl}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }}
              draggable={false}
              alt={`page ${page}`}
              className="block h-full w-full select-none shadow-[var(--shadow-float)]"
            />
            {natural && (
              <WordOverlay
                words={words}
                scale={scale}
                naturalW={natural.w}
                naturalH={natural.h}
                pendingIds={pendingIds}
                groupsIds={groupsIds}
                onToggle={toggleWord}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function clampScale(z: number): number {
  if (!Number.isFinite(z)) return 1;
  return Math.max(0.05, Math.min(8, z));
}

interface WordOverlayProps {
  words: Word[];
  scale: number;
  naturalW: number;
  naturalH: number;
  pendingIds: number[];
  groupsIds: number[][];
  onToggle: (id: number) => void;
}

function WordOverlay({
  words, scale, naturalW, naturalH, pendingIds, groupsIds, onToggle,
}: WordOverlayProps) {
  const [hovered, setHovered] = useState<{ word: Word; x: number; y: number } | null>(null);

  const pending = useMemo(() => new Set(pendingIds), [pendingIds]);
  const groupOf = useMemo(() => {
    const m = new Map<number, number>();
    groupsIds.forEach((g, i) => g.forEach((id) => m.set(id, i % 4)));
    return m;
  }, [groupsIds]);

  return (
    <div
      className="select-overlay absolute left-0 top-0"
      style={{
        width: naturalW,
        height: naturalH,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      onMouseLeave={() => setHovered(null)}
    >
      {words.map((w) => {
        const isPending = pending.has(w.id);
        const groupIdx = groupOf.get(w.id);
        return (
          <button
            key={w.id}
            type="button"
            onClick={() => onToggle(w.id)}
            onMouseEnter={(e) => setHovered({ word: w, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setHovered({ word: w, x: e.clientX, y: e.clientY })}
            className={cn(
              'word absolute box-border cursor-pointer border border-transparent bg-transparent p-0 m-0',
              isPending && 'is-pending',
              groupIdx !== undefined && `is-group-${groupIdx}`,
            )}
            style={{
              left: w.x0,
              top: w.y0,
              width: w.x1 - w.x0,
              height: w.y1 - w.y0,
            }}
            aria-label={w.text}
            tabIndex={-1}
          />
        );
      })}
      {hovered && <SelectTooltip x={hovered.x} y={hovered.y} word={hovered.word} />}
    </div>
  );
}

function SelectTooltip({ x, y, word }: { x: number; y: number; word: Word }) {
  // Render via a portal to <body> so the WordOverlay's `transform: scale(...)`
  // doesn't capture this element. (CSS quirk: `position: fixed` is positioned
  // relative to a transformed ancestor, not the viewport, when one exists.)
  const offset = 12;
  const left = Math.min(x + offset, window.innerWidth - 240);
  const top = Math.min(y + offset, window.innerHeight - 32);
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 whitespace-nowrap rounded-[var(--radius-md)] border border-border bg-popover px-2 py-1 font-mono text-[11px] text-foreground shadow-[var(--shadow-float)]"
      style={{ left, top }}
    >
      <strong className="font-semibold">{word.text}</strong>
      {word.pos && <span className="ml-1.5 text-muted-foreground">{word.pos}</span>}
      <span className="ml-1.5 text-muted-foreground">line {word.lineIdx}</span>
    </div>,
    document.body,
  );
}
