import { AboutContent } from '@/about/AboutContent';
import { DOCS_URL } from '@/lib/site';

export function AboutLayout() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border-soft bg-background px-3">
        <a href="/" className="text-[13px] font-semibold tracking-tight text-foreground hover:text-primary">
          InHumument
        </a>
        <span className="text-muted-foreground">/</span>
        <span className="text-[11px] font-medium text-muted-foreground">about</span>
        <div className="flex-1" />
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
          Read docs
        </a>
        <a href="/" className="text-[11px] font-medium text-primary hover:underline">
          Open editor
        </a>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <AboutContent />
      </main>
    </div>
  );
}
