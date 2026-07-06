import { useSketchStore } from '@/hooks/useSketchStore';
import { Trash2 } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/utils';

export function Console() {
  const entries = useSketchStore((s) => s.consoleEntries);
  const clear = useSketchStore((s) => s.clearConsole);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border-soft px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Console
        </span>
        <button
          type="button"
          onClick={clear}
          title="Clear console"
          aria-label="Clear console"
          className={buttonClasses({ variant: 'ghost', size: 'icon' })}
        >
          <Trash2 />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 font-mono text-[11px] leading-snug">
          {entries.length === 0 ? (
            <div className="text-muted-foreground">No output yet.</div>
          ) : (
            entries.map((e, i) => {
              const isError = e.level === 'error';
              const isWarn = e.level === 'warn';
              return (
                <div
                  key={i}
                  className={cn(
                    'whitespace-pre-wrap border-l-2 py-0.5 pl-2 -mx-1 transition-colors',
                    isError && 'border-destructive bg-destructive/5 text-foreground',
                    isWarn && 'border-primary/40 text-foreground',
                    !isError && !isWarn && 'border-transparent text-muted-foreground',
                  )}
                >
                  {e.message}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
