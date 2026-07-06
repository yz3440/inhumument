import { SectionHeading, Subheading, Lead } from '@/docs/components/SectionHeading';
import { CodeBlock } from '@/docs/components/CodeBlock';
import { TypeSignature } from '@/docs/components/TypeSignature';
import { PropTable, type PropRow } from '@/docs/components/PropTable';

const pageProps: PropRow[] = [
  { name: 'number', type: 'number', description: 'Page number.' },
  { name: 'width', type: 'number', description: 'Native page image width (px).' },
  { name: 'height', type: 'number', description: 'Native page image height (px).' },
  { name: 'body', type: 'Bbox | null', description: 'Printed type area (tilt-corrected), if known.' },
  { name: 'valid', type: 'Bbox | null', description: 'OCR-valid region; usually matches body.' },
  { name: 'imageUrl', type: 'string', description: 'URL to pass to loadImage().' },
  { name: 'image', type: 'p5.Image | null', description: 'Host-assigned after loadImage resolves.' },
];

const loadOpts: PropRow[] = [
  { name: 'page', type: 'number', description: 'Required. Page number.' },
  { name: 'dataBase', type: 'string?', description: 'Base URL for catalog + per-page JSON; default: npm-hosted data (humument-data via jsDelivr)' },
  { name: 'imageBase', type: 'string?', description: 'Base URL for page scans; default: npm-hosted images (humument-images via jsDelivr)' },
];

export function ApiReference() {
  return (
    <div className="mb-16 space-y-16">
      <section className="scroll-mt-24">
        <SectionHeading
          id="api-humument"
          title="Humument (static)"
          description="Loader, database initialisation, and catalog helpers."
        />
        <Subheading>Humument.init</Subheading>
        <TypeSignature>Humument.init(opts?: InitOptions): Promise&lt;void&gt;</TypeSignature>
        <Lead>
          Configures the base URLs and warms the catalog. Call once in app shells before using{' '}
          <code className="font-mono text-foreground">Humument.catalog</code>.{' '}
          <code className="font-mono text-foreground">Humument.load</code> calls this internally.
        </Lead>
        <PropTable
          rows={[
            { name: 'dataBase', type: 'string?', description: 'Base URL for catalog + per-page JSON; default: npm-hosted data (humument-data via jsDelivr)' },
            { name: 'imageBase', type: 'string?', description: 'Base URL for page scans; default: npm-hosted images (humument-images via jsDelivr)' },
          ]}
        />
        <Subheading>Humument.load</Subheading>
        <TypeSignature>Humument.load(opts: HumumentLoadOptions): Promise&lt;HumumentInstance&gt;</TypeSignature>
        <PropTable rows={loadOpts} />
        <Subheading>Humument.catalog</Subheading>
        <TypeSignature>{`listPages(contentOnly?: boolean): Promise<number[]>
listAllPageRefs(): Promise<PageRef[]>
listChapters(): Promise<ChapterRef[]>
searchPages(query, opts?): Promise<PageMatch[]>
getWords(pageNum: number): Promise<Word[]>
pageImageUrl(pageNum: number): string`}</TypeSignature>
        <Lead>Async read-only helpers backed by the static JSON export; safe after init.</Lead>
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-page"
          title="Page & instance"
          description="The object returned by Humument.load — commonly named H."
        />
        <Subheading>H.page</Subheading>
        <PropTable rows={pageProps} />
        <Subheading>Selection (header-injected)</Subheading>
        <TypeSignature>{`const SELECTION: Word[]      // pending / active group
const GROUPS:    Word[][]    // saved groups (does NOT include SELECTION)`}</TypeSignature>
        <Lead>
          The editor prepends a read-only header to every sketch that declares{' '}
          <code className="font-mono text-foreground">SELECTION</code> and{' '}
          <code className="font-mono text-foreground">GROUPS</code> as plain JS{' '}
          <code className="font-mono text-foreground">const</code> arrays of full Word objects. Click words in the
          Select tab to populate <code className="font-mono text-foreground">SELECTION</code>; press{' '}
          <code className="font-mono text-foreground">G</code> (or the "+ Group" button) to commit the current
          group into <code className="font-mono text-foreground">GROUPS</code> and start a new one; press{' '}
          <code className="font-mono text-foreground">Esc</code> (or "Clear") to reset. The header lines are
          not editable but their JS values are visible directly in the editor — every Word object is rendered
          inline so you can copy ids, coordinates, POS tags, etc.
        </Lead>
        <CodeBlock
          lang="javascript"
          code={`function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);
  // SELECTION / GROUPS are global consts injected by the editor.
  const all = [
    ...GROUPS,
    ...(SELECTION.length ? [SELECTION] : []),
  ];
  for (const g of all) {
    fill(255); stroke(20);
    H.draw.balloon(g, { wobble: 0.15 });
  }
  noLoop();
}`}
        />
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-words"
          title="Words & lines"
          description="OCR words, reading order, and geometry helpers."
        />
        <TypeSignature>{`H.words: Word[]
H.lines: Word[][]
H.wordById(id: number): Word | undefined
H.bboxOf(words: Iterable<Word>): Bbox`}</TypeSignature>
        <Lead>
          Words are sorted by (lineIdx, x0). Lines group words on the same line index. Use bboxOf for chunk bounding boxes.
        </Lead>
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-chunks"
          title="Chunks (POS patterns)"
          description="Noun-phrase and verb-phrase style chunking over spaCy UPOS tags."
        />
        <TypeSignature>{`H.chunks(opts?: ChunksOptions): Word[][]
H.selectChunks(opts?: SelectChunksOptions): Word[][]
H.chunkScore(chunk: Word[]): number
H.passesCandidacy(word: Word, headerLines?: Set<number>): boolean`}</TypeSignature>
        <Lead>
          <strong className="text-foreground">NP</strong> ≈ ADP? (DET|PRON|VERB)? (ADJ|ADV|NUM)* (NOUN|PROPN)+;{' '}
          <strong className="text-foreground">VP</strong> ≈ ADV* (VERB|AUX) (ADJ|ADV|AUX|PART)*. Use selectChunks for spaced seeds across lines.
        </Lead>
        <CodeBlock
          lang="javascript"
          code={`const phrases = H.selectChunks({ nSeeds: 4, minLineDist: 3, seed: 42 });
for (const ph of phrases) {
  console.log(ph.map((w) => w.text).join(' '));
}`}
        />
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-river"
          title="River"
          description="Whitespace graph pathfinding and organic flow paths."
        />
        <TypeSignature>{`H.river.between(a: Word, b: Word): ChannelSegment | null
H.river.flow(a: Pt, b: Pt, opts: Omit<FlowOptions, 'body'> & { body?: Bbox }): Pt[]
H.river.pickPorts(a: Word, b: Word): [Port, Port] | null
H.river.penalizeBorders(margin?: number, penalty?: number): PageGraph
H.river.dijkstra(graph, start, end): { nodeIds: number[]; gutterIds: number[] }
H.river.obstaclesFrom(words, selectedIds, pad?): Bbox[]`}</TypeSignature>
        <Lead>
          between runs Dijkstra on the gutter graph. flow walks with Perlin-style noise inside the page body (body defaults from page meta when omitted).
        </Lead>
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-draw"
          title="Draw (p5-aware)"
          description="Optional sugar over p5 graphics; pass p in instance mode."
        />
        <TypeSignature>{`H.draw.balloon(words: Word[], opts?: BalloonOptions, p?: p5): void
H.draw.river(segment: ChannelSegment, opts?: ChannelOptions, p?: p5): void
H.draw.word(word: Word, p?: p5): void
H.draw.image(p?: p5): void`}</TypeSignature>
        <PropTable
          rows={[
            { name: 'BalloonOptions', type: 'object?', description: 'pad, wobble, wobbleFreq, samples, seed' },
            { name: 'ChannelOptions', type: 'object?', description: 'halfWidth, jitter, meander, widthMod, sampleStep, seed, …' },
          ]}
        />
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-geom"
          title="Geom (pure)"
          description="Geometry without touching the canvas — reuse for custom drawing."
        />
        <TypeSignature>{`H.geom.balloon(bbox: Bbox, opts?: BalloonOptions): Pt[]
H.geom.channel(seg: ChannelSegment, opts?: ChannelOptions): Pt[]
H.geom.catmullRom(pts: Pt[], tension?: number, samplesPerSegment?: number): Pt[]`}</TypeSignature>
      </section>

      <section className="scroll-mt-24">
        <SectionHeading
          id="api-utility"
          title="Utility & POS"
          description="Seeded noise, RNG, and POS helpers for chunking heuristics."
        />
        <TypeSignature>{`H.noise(seed: number): (x: number) => number
H.noise2D(seed: number): (x: number, y: number) => number
H.random(seed: number): () => number
H.HEAD(w: Word): boolean
H.MOD(w: Word): boolean
H.POS: { NOUN, VERB, ADJ, … }`}</TypeSignature>
        <Lead>HEAD is true for NOUN/PROPN; MOD for ADJ/ADV/NUM.</Lead>
      </section>
    </div>
  );
}
