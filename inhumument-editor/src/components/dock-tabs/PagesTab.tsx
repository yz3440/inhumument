import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Humument, type PageMatch } from 'inhumument-lib';
import { useSketchStore } from '@/hooks/useSketchStore';
import { useDebounced } from '@/hooks/useDebounced';
import { buildSections, type ChapterSection } from '@/lib/pages-sections';
import { isFavorite, type FavoriteRef } from '@/lib/favorites';
import { cn } from '@/lib/utils';

export function PagesTab() {
  const dbReady = useSketchStore((s) => s.dbReady);
  const pageList = useSketchStore((s) => s.pageList);
  const page = useSketchStore((s) => s.page);
  const setPage = useSketchStore((s) => s.setPage);
  const favorites = useSketchStore((s) => s.favorites);
  const toggleFavorite = useSketchStore((s) => s.toggleFavorite);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 150);

  const [sections, setSections] = useState<ChapterSection[]>([]);
  useEffect(() => {
    if (!dbReady) return;
    let ignore = false;
    Humument.catalog.listChapters().then((chapters) => {
      if (!ignore) setSections(buildSections(pageList, chapters));
    });
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbReady]);

  const [matches, setMatches] = useState<PageMatch[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!dbReady || !q) {
      setMatches([]);
      setSearching(false);
      return;
    }
    let ignore = false;
    setSearching(true);
    Humument.catalog.searchPages(q, { limit: 80 }).then((m) => {
      if (!ignore) {
        setMatches(m);
        setSearching(false);
      }
    });
    return () => { ignore = true; };
  }, [dbReady, debouncedQuery]);

  if (!dbReady) {
    return (
      <div className="p-4 text-[12px] text-muted-foreground">Loading database…</div>
    );
  }

  const pick = (p: number) => setPage(p);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-soft p-2 bg-card">
        <input
          type="search"
          placeholder="Search OCR…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ui-input w-full"
          aria-label="Search OCR"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          <SearchResults
            query={debouncedQuery.trim()}
            matches={matches}
            searching={searching}
            sections={sections}
            activePage={page}
            onPick={pick}
          />
        ) : (
          <>
            {favorites.length > 0 && (
              <FavoritesStrip
                favorites={favorites}
                sections={sections}
                activePage={page}
                onPick={pick}
                onToggleFavorite={toggleFavorite}
              />
            )}
            <StructList
              sections={sections}
              activePage={page}
              favorites={favorites}
              onPick={pick}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- favorites pinned strip ---------------------------------- */

function FavoritesStrip({
  favorites,
  sections,
  activePage,
  onPick,
  onToggleFavorite,
}: {
  favorites: FavoriteRef[];
  sections: ChapterSection[];
  activePage: number;
  onPick: (page: number) => void;
  onToggleFavorite: (page: number) => void;
}) {
  return (
    <section className="border-b border-border-soft bg-card/40">
      <h2 className="px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Favorites
      </h2>
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {favorites.map((f) => {
          const ctx = lookupContext(sections, f.page);
          const label = ctx?.pageLabel ?? f.page;
          const active = activePage === f.page;
          return (
            <PageButton
              key={`fav-${f.page}`}
              page={f.page}
              label={label}
              active={active}
              isFav
              titlePrefix={`page ${label}`}
              onPick={onPick}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ---------- structural list view ----------------------------------- */

function StructList({
  sections,
  activePage,
  favorites,
  onPick,
  onToggleFavorite,
}: {
  sections: ChapterSection[];
  activePage: number;
  favorites: FavoriteRef[];
  onPick: (page: number) => void;
  onToggleFavorite: (page: number) => void;
}) {
  return (
    <div>
      {sections.map((ch) => (
        <div key={ch.label}>
          <h3
            className="sticky top-0 z-10 border-b border-border-soft bg-card/90 backdrop-blur px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {ch.label}
          </h3>
          <div className="flex flex-wrap gap-1 px-3 py-2">
            {ch.pages.map((p, i) => {
              const label = ch.pageLabels[i];
              const active = activePage === p;
              const fav = isFavorite(favorites, p);
              return (
                <PageButton
                  key={p}
                  page={p}
                  label={label}
                  active={active}
                  isFav={fav}
                  titlePrefix={`${ch.label} · page ${label}`}
                  onPick={onPick}
                  onToggleFavorite={onToggleFavorite}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- shared page button (with star toggle) ------------------ */

function PageButton({
  page,
  label,
  active,
  isFav,
  titlePrefix,
  onPick,
  onToggleFavorite,
}: {
  page: number;
  label: number;
  active: boolean;
  isFav: boolean;
  titlePrefix: string;
  onPick: (page: number) => void;
  onToggleFavorite: (page: number) => void;
}) {
  return (
    <span
      className={cn(
        'group/page relative inline-flex h-6 min-w-7 items-center rounded-[var(--radius-sm)] border',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted/60',
      )}
    >
      <button
        type="button"
        onClick={() => onPick(page)}
        title={`${titlePrefix}${isFav ? ' · favorite' : ''}`}
        className="px-1.5 font-mono text-[11px] tabular-nums leading-none"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(page);
        }}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        title={isFav ? 'Remove from favorites' : 'Add to favorites (F)'}
        className={cn(
          'flex h-full items-center pr-1 pl-0.5 transition-opacity',
          isFav
            ? 'opacity-100'
            : 'opacity-0 group-hover/page:opacity-60 hover:opacity-100!',
        )}
      >
        <Star
          className={cn('size-3', isFav ? 'fill-current' : '')}
          aria-hidden="true"
        />
      </button>
    </span>
  );
}

/* ---------- search-results view ------------------------------------ */

interface SectionLookup {
  chapterLabel: string;
  pageLabel: number;
}

function lookupContext(
  sections: ChapterSection[],
  pageNum: number,
): SectionLookup | null {
  for (const ch of sections) {
    const idx = ch.pages.indexOf(pageNum);
    if (idx >= 0) {
      return {
        chapterLabel: ch.label,
        pageLabel: ch.pageLabels[idx],
      };
    }
  }
  return null;
}

function highlight(snippet: string, query: string) {
  if (!query) return snippet;
  const lower = snippet.toLowerCase();
  const q = query.toLowerCase();
  const out: Array<{ text: string; hit: boolean }> = [];
  let i = 0;
  while (i < snippet.length) {
    const j = lower.indexOf(q, i);
    if (j < 0) {
      out.push({ text: snippet.slice(i), hit: false });
      break;
    }
    if (j > i) out.push({ text: snippet.slice(i, j), hit: false });
    out.push({ text: snippet.slice(j, j + q.length), hit: true });
    i = j + q.length;
  }
  return out;
}

function SearchResults({
  query,
  matches,
  searching,
  sections,
  activePage,
  onPick,
}: {
  query: string;
  matches: PageMatch[];
  searching: boolean;
  sections: ChapterSection[];
  activePage: number;
  onPick: (page: number) => void;
}) {
  if (!query) return null;

  if (searching && matches.length === 0) {
    return (
      <div className="p-3 text-[12px] text-muted-foreground">Searching…</div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-3 text-[12px] text-muted-foreground">
        No matches for <span className="font-mono text-foreground">{query}</span>.
      </div>
    );
  }

  return (
    <ul>
      {matches.map((m) => {
        const ctx = lookupContext(sections, m.pageNum);
        const active = activePage === m.pageNum;
        const parts = highlight(m.snippet, query);
        return (
          <li key={m.pageNum}>
            <button
              type="button"
              onClick={() => onPick(m.pageNum)}
              className={cn(
                'block w-full border-l-2 border-b border-border-soft px-3 py-2 text-left transition-colors',
                active
                  ? 'border-l-primary bg-primary/8'
                  : 'border-l-transparent hover:bg-muted/50',
              )}
            >
              <div className="flex items-baseline gap-2 text-[11px]">
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  p {ctx?.pageLabel ?? '?'}
                </span>
                {ctx?.chapterLabel ? (
                  <span className="text-muted-foreground">{ctx.chapterLabel}</span>
                ) : null}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                  {m.hits}
                </span>
              </div>
              <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                {typeof parts === 'string'
                  ? parts
                  : parts.map((p, i) =>
                      p.hit ? (
                        <mark
                          key={i}
                          className="rounded-[2px] bg-primary/15 px-0.5 text-foreground"
                        >
                          {p.text}
                        </mark>
                      ) : (
                        <span key={i}>{p.text}</span>
                      ),
                    )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
