import type { ReactNode } from 'react';

function AboutHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 scroll-mt-24" id={id}>
      <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h2>
      {description ? (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground md:text-[14px]">
      {children}
    </p>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-foreground">{children}</code>;
}

export function AboutContent() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 pb-16 md:px-8">
      <section className="mb-16">
        <AboutHeading
          id="what"
          title="What InHumument is"
          description="A digital homage to Tom Phillips' A Humument: artists alter pages of W. H. Mallock's A Human Document (1892) through p5.js code instead of paint, gouache, or collage."
        />
        <Lead>
          Each page of the source book is a fixed canvas. You write a small p5
          sketch against the global <Mono>H</Mono> — a loaded page exposing OCR
          words, line geometry, phrase chunks, and a whitespace river graph.
          The sketch composites on top of the scan; the result is a single
          altered page.
        </Lead>
        <Lead>
          Sketches are saved per page in your browser. The editor, the docs,
          and a sandboxed preview iframe are all served as static assets — no
          backend, no account.
        </Lead>
      </section>

      <section className="mb-16">
        <AboutHeading
          id="lineage"
          title="Lineage"
          description="The book, the bookshop, and the work that gives this project its name."
        />
        <Lead>
          In 1966 the British artist Tom Phillips bought a copy of W. H.
          Mallock's <em>A Human Document</em> for threepence at a Peckham
          bookshop, on a bet that he could make art out of the first secondhand
          book he found for less than a shilling. He spent the next five
          decades altering it, page by page, with paint, ink, and collage. The
          result — <em>A Humument</em> — went through six published editions
          between 1970 and 2016 and is one of the defining works of the
          altered-book tradition.
        </Lead>
        <Lead>
          InHumument keeps the source material and the page-as-canvas premise
          but swaps ink for code. Mallock's text, line structure, word
          bounding boxes, and the typographic gaps that flow between lines are
          all available as data, so the artist's brush becomes a function. It
          is a translation, not a reproduction: the goal is not to imitate
          Phillips' pages but to make the same gesture available to anyone
          who can write a few lines of JavaScript.
        </Lead>
      </section>

      <section className="mb-16">
        <AboutHeading
          id="how"
          title="What you can make, and how it works"
          description="The editor flow, the four primitive families, and what runs where."
        />
        <Lead>
          Pick a page in the dock. Write p5 against <Mono>H</Mono>. Save (per
          page, in <Mono>localStorage</Mono>). Export as PNG. Iterate.
        </Lead>
        <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight text-foreground">
          The four primitive families
        </h3>
        <ul className="mb-4 list-inside list-disc space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          <li>
            <Mono>H.page</Mono> &amp; <Mono>H.catalog</Mono> — page metadata,
            the underlying scan, chapter structure.
          </li>
          <li>
            <Mono>H.line</Mono>, <Mono>H.words</Mono> — OCR words and the
            lines they sit on, with bounding boxes in page-pixel space.
          </li>
          <li>
            <Mono>H.selectChunks</Mono> — Phillips-style phrase chunks
            (contiguous runs of words across one or more lines).
          </li>
          <li>
            <Mono>H.river</Mono>, <Mono>H.draw</Mono> — Dijkstra paths
            through the whitespace gutters between text, plus drawing
            helpers (balloons, riverlines, phrase outlines).
          </li>
        </ul>
        <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight text-foreground">
          Starter sketches
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          Open the <strong>Sketches</strong> tab in the dock to load any of
          six templates: <em>Hello</em>, <em>Rectangles</em>, <em>Balloons</em>,
          <em> River</em>, <em>Final p184</em>, and <em>Selection</em>. Each is a
          short, readable sketch you can copy and bend.
        </p>
        <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight text-foreground">
          What runs where
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          The editor is React + CodeMirror. Your sketch runs inside a
          sandboxed iframe so a runtime error in your code can't crash the
          editor. The OCR data ships as a static JSON export — a catalog plus
          one small file per page — fetched lazily and cached on first use.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Get started in the editor
          </a>
          <a
            href="/docs.html#getting-started"
            className="inline-flex items-center rounded-[var(--radius-md)] border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            Read the API docs
          </a>
        </div>
      </section>

      <section className="mb-16">
        <AboutHeading
          id="credits"
          title="Credits & sources"
          description="Where the text and the imagery come from, and what InHumument is built on."
        />
        <h3 className="mb-3 mt-2 text-[15px] font-semibold tracking-tight text-foreground">
          Source text
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          W. H. Mallock, <em>A Human Document</em> (Chapman &amp; Hall, 1892).
          Public domain. Page scans were OCR'd to produce the word geometry
          and line structure used by <Mono>inhumument-lib</Mono>.
        </p>
        <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight text-foreground">
          Acknowledgement
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          Tom Phillips, <em>A Humument</em> (Tetrad / Thames &amp; Hudson,
          1970–2016). The work is the project's namesake and inspiration; no
          imagery from <em>A Humument</em> is included or reproduced here.
        </p>
        <h3 className="mb-3 mt-8 text-[15px] font-semibold tracking-tight text-foreground">
          Built with
        </h3>
        <ul className="list-inside list-disc space-y-1 text-[13px] leading-relaxed text-muted-foreground">
          <li><Mono>p5.js</Mono> — sketch runtime</li>
          <li><Mono>inhumument-lib</Mono> — page + OCR API (workspace package)</li>
          <li>CodeMirror 6 — code editor</li>
          <li>React 19, Vite, Tailwind CSS</li>
        </ul>
      </section>
    </article>
  );
}
