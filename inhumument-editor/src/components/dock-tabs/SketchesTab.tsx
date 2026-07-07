import { useSketchStore } from '@/hooks/useSketchStore';
import { hello, rectangles, balloons, river, finalP184, selection, pinkRiver, comicGrid, chevrons } from '@/starter-sketches';
import { saveSketch } from '@/lib/persist';
import { toast } from 'sonner';

const TEMPLATES: Array<{ id: string; label: string; blurb: string; src: string }> = [
  { id: 'hello',      label: 'Hello',      blurb: 'Paint page · highlight first line',  src: hello },
  { id: 'rectangles', label: 'Rectangles', blurb: 'Every word, color-coded by POS',      src: rectangles },
  { id: 'balloons',   label: 'Balloons',   blurb: 'Phrases as white balloons',           src: balloons },
  { id: 'river',      label: 'River',      blurb: 'Dijkstra paths through gutters',      src: river },
  { id: 'final-p184', label: 'Final p184', blurb: 'Cream wash + brush layer + ribbon roots', src: finalP184 },
  { id: 'selection',  label: 'Selection',  blurb: 'Click-to-select words \u2192 balloons', src: selection },
  { id: 'pink-river', label: 'Pink River (p65)', blurb: 'One winding balloon chain on a pink field',   src: pinkRiver },
  { id: 'comic-grid', label: 'Comic Grid (p53)', blurb: 'Painterly panels; balloons cross the frames', src: comicGrid },
  { id: 'chevrons',   label: 'Chevrons (p136)',  blurb: 'Hard-edged chevrons + wandering white stems', src: chevrons },
];

export function SketchesTab() {
  const page = useSketchStore((s) => s.page);
  const sketch = useSketchStore((s) => s.sketch);
  const setSketch = useSketchStore((s) => s.setSketch);
  const bumpReload = useSketchStore((s) => s.bumpReload);

  const load = (src: string, label: string) => {
    if (sketch === src) return;
    const previous = sketch;

    setSketch(src);
    void saveSketch(page, src);
    bumpReload();

    if (previous && previous !== src) {
      toast(`Loaded "${label}"`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setSketch(previous);
            void saveSketch(page, previous);
            bumpReload();
          },
        },
      });
    } else {
      toast.message(`Loaded "${label}"`);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3">
        <div className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Starter sketches
        </div>
        <ul className="space-y-1.5">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => load(t.src, t.label)}
                className="block w-full rounded-[var(--radius-md)] border border-border bg-background p-2.5 text-left shadow-[var(--shadow-chrome)] transition-colors hover:bg-muted/40 hover:border-border"
              >
                <div className="text-[13px] font-semibold text-foreground">{t.label}</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                  {t.blurb}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border-soft pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Sketches are saved per page in your browser (IndexedDB). Use Reset in the top bar to
          restore the default for the current page.
        </div>
      </div>
    </div>
  );
}
