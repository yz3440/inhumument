import { useCallback, useEffect, useState } from 'react';
import { DocsSidebar } from '@/docs/DocsSidebar';
import { DocsContent } from '@/docs/DocsContent';

const SECTION_IDS = [
  'overview',
  'getting-started',
  'api-humument',
  'api-page',
  'api-words',
  'api-chunks',
  'api-river',
  'api-draw',
  'api-geom',
  'api-utility',
  'types',
] as const;

export type DocsSectionId = (typeof SECTION_IDS)[number];

export function DocsLayout() {
  const [active, setActive] = useState<DocsSectionId>('overview');

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const first = visible[0]?.target.id;
        if (first && SECTION_IDS.includes(first as DocsSectionId)) {
          setActive(first as DocsSectionId);
        }
      },
      { root: null, rootMargin: '-72px 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: DocsSectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const details = document.getElementById('docs-mobile-nav') as HTMLDetailsElement | null;
    if (details) details.open = false;
  }, []);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border-soft bg-background px-3">
        <a href="/" className="text-[13px] font-semibold tracking-tight text-foreground hover:text-primary">
          InHumument
        </a>
        <span className="text-muted-foreground">/</span>
        <span className="text-[11px] font-medium text-muted-foreground">inhumument-lib API</span>
        <div className="flex-1" />
        <a href="/about.html" className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
          About
        </a>
        <a href="/" className="text-[11px] font-medium text-primary hover:underline">
          Open editor
        </a>
      </header>

      <details
        id="docs-mobile-nav"
        className="border-b border-border-soft bg-card md:hidden"
      >
        <summary className="cursor-pointer px-3 py-2 text-[12px] font-medium text-foreground select-none">
          Menu
        </summary>
        <div className="border-t border-border-soft">
          <DocsSidebar active={active} onNavigate={scrollTo} />
        </div>
      </details>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border-soft bg-card md:block">
          <DocsSidebar active={active} onNavigate={scrollTo} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <DocsContent />
        </main>
      </div>
    </div>
  );
}
