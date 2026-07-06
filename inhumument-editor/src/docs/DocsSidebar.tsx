import { cn } from '@/lib/utils';
import type { DocsSectionId } from '@/docs/DocsLayout';

const NAV: Array<{ id: DocsSectionId; label: string; group?: string }> = [
  { id: 'overview', label: 'Overview', group: 'Guide' },
  { id: 'getting-started', label: 'Getting started', group: 'Guide' },
  { id: 'api-humument', label: 'Humument', group: 'API' },
  { id: 'api-page', label: 'Page & catalog', group: 'API' },
  { id: 'api-words', label: 'Words & lines', group: 'API' },
  { id: 'api-chunks', label: 'Chunks', group: 'API' },
  { id: 'api-river', label: 'River', group: 'API' },
  { id: 'api-draw', label: 'Draw', group: 'API' },
  { id: 'api-geom', label: 'Geom', group: 'API' },
  { id: 'api-utility', label: 'Utility & POS', group: 'API' },
  { id: 'types', label: 'Types', group: 'Reference' },
];

export function DocsSidebar({
  active,
  onNavigate,
}: {
  active: DocsSectionId;
  onNavigate: (id: DocsSectionId) => void;
}) {
  let lastGroup = '';
  return (
    <nav className="flex h-full flex-col gap-0.5 overflow-y-auto p-3 text-[12px]">
      {NAV.map((item) => {
        const showGroup = item.group && item.group !== lastGroup;
        if (item.group) lastGroup = item.group;
        return (
          <div key={item.id}>
            {showGroup && (
              <div className="mb-1 mt-2 first:mt-0 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.group}
              </div>
            )}
            <button
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex w-full border-l-2 px-2 py-1.5 text-left font-medium transition-colors',
                active === item.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
