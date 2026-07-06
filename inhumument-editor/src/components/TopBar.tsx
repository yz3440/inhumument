import { useSketchStore } from '@/hooks/useSketchStore';
import { Play, RotateCcw, Save, PanelLeft, BookOpen, Info } from 'lucide-react';
import { clearSketch, saveSketch } from '@/lib/persist';
import { toast } from 'sonner';
import { defaultSketch } from '@/starter-sketches';
import { printedPage } from '@/lib/page-label';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/utils';

export function TopBar() {
  const page = useSketchStore((s) => s.page);
  const sketch = useSketchStore((s) => s.sketch);
  const setSketch = useSketchStore((s) => s.setSketch);
  const bumpReload = useSketchStore((s) => s.bumpReload);
  const liveRun = useSketchStore((s) => s.liveRun);
  const setLiveRun = useSketchStore((s) => s.setLiveRun);
  const toggleDock = useSketchStore((s) => s.toggleDock);

  const printed = printedPage(page);

  return (
    <header className="flex h-9 shrink-0 items-center gap-2 bg-background px-3 shadow-[var(--shadow-chrome)]">
      <button
        type="button"
        onClick={toggleDock}
        title="Toggle dock (⌘B)"
        aria-label="Toggle dock"
        className={buttonClasses({ variant: 'ghost', size: 'icon' })}
      >
        <PanelLeft />
      </button>

      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold tracking-tight text-foreground leading-none">
          InHumument
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">editor</span>
      </div>

      <div className="ml-1 flex items-baseline gap-1.5 text-[11px]">
        <span className="text-muted-foreground">page</span>
        <span className="text-foreground tabular-nums font-medium">{printed}</span>
      </div>

      <div className="flex-1" />

      <a
        href="/about.html"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'hidden sm:inline-flex items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium',
          'text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
        )}
        title="About InHumument"
      >
        <Info className="size-3.5 shrink-0" />
        About
      </a>

      <a
        href="/docs.html"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'hidden sm:inline-flex items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium',
          'text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors',
        )}
        title="Open API documentation"
      >
        <BookOpen className="size-3.5 shrink-0" />
        Docs
      </a>

      <label
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium transition-colors',
          'hover:bg-muted/60',
          liveRun ? 'text-foreground' : 'text-muted-foreground',
        )}
        title="Auto-rerun sketch on change"
      >
        <input
          type="checkbox"
          role="switch"
          checked={liveRun}
          onChange={(e) => setLiveRun(e.target.checked)}
          className="ui-switch"
        />
        Live
      </label>

      <button
        type="button"
        onClick={bumpReload}
        title="Run sketch (⌘↩)"
        className={buttonClasses({ size: 'sm' })}
      >
        <Play /> Run
      </button>
      <button
        type="button"
        onClick={() => {
          saveSketch(page, sketch);
          toast.success('Sketch saved');
        }}
        title="Save (⌘S)"
        className={buttonClasses({ variant: 'outline', size: 'sm' })}
      >
        <Save /> Save
      </button>
      <button
        type="button"
        onClick={() => {
          clearSketch(page);
          setSketch(defaultSketch);
          toast.message('Reset to default');
        }}
        title="Reset to default"
        className={buttonClasses({ variant: 'ghost', size: 'sm' })}
      >
        <RotateCcw /> Reset
      </button>
    </header>
  );
}
