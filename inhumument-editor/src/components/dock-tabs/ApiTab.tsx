import { BookOpen } from 'lucide-react';
import { DOCS_URL } from '@/lib/site';

export function ApiTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-3">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">H — cheat sheet</h2>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            Global <code className="font-mono text-[11px] text-foreground">H</code> for the active page. Coordinates
            match the page image (top-left origin).
          </p>
        </div>

        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-muted/30 px-3 py-2 text-[12px] font-medium text-primary shadow-[var(--shadow-chrome)] transition-colors hover:bg-muted/50"
        >
          <BookOpen className="size-4 shrink-0" />
          Open full API documentation
        </a>

        <div className="space-y-3 text-[11.5px] leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Page</span>{' '}
            <code className="font-mono text-foreground">H.page</code> — width, height, body, imageUrl, image,
            number
          </p>
          <p>
            <span className="font-semibold text-foreground">Words</span>{' '}
            <code className="font-mono text-foreground">H.words</code>,{' '}
            <code className="font-mono text-foreground">H.lines</code>,{' '}
            <code className="font-mono text-foreground">H.wordById</code>,{' '}
            <code className="font-mono text-foreground">H.bboxOf</code>
          </p>
          <p>
            <span className="font-semibold text-foreground">Chunks</span>{' '}
            <code className="font-mono text-foreground">H.chunks</code>,{' '}
            <code className="font-mono text-foreground">H.selectChunks</code>,{' '}
            <code className="font-mono text-foreground">H.chunkScore</code>
          </p>
          <p>
            <span className="font-semibold text-foreground">River</span>{' '}
            <code className="font-mono text-foreground">H.river.between</code>,{' '}
            <code className="font-mono text-foreground">flow</code>,{' '}
            <code className="font-mono text-foreground">pickPorts</code>,{' '}
            <code className="font-mono text-foreground">penalizeBorders</code>
          </p>
          <p>
            <span className="font-semibold text-foreground">Draw</span>{' '}
            <code className="font-mono text-foreground">H.draw.balloon</code>,{' '}
            <code className="font-mono text-foreground">river</code>,{' '}
            <code className="font-mono text-foreground">word</code>,{' '}
            <code className="font-mono text-foreground">image</code>
          </p>
          <p>
            <span className="font-semibold text-foreground">Geom</span>{' '}
            <code className="font-mono text-foreground">H.geom.balloon</code>,{' '}
            <code className="font-mono text-foreground">channel</code>,{' '}
            <code className="font-mono text-foreground">catmullRom</code>
          </p>
          <p>
            <span className="font-semibold text-foreground">Utility</span>{' '}
            <code className="font-mono text-foreground">H.noise</code>,{' '}
            <code className="font-mono text-foreground">H.noise2D</code>,{' '}
            <code className="font-mono text-foreground">H.random</code>,{' '}
            <code className="font-mono text-foreground">H.HEAD</code>,{' '}
            <code className="font-mono text-foreground">H.MOD</code>, gutters / docks / graph
          </p>
        </div>
      </div>
    </div>
  );
}
