import { SectionHeading, Subheading } from '@/docs/components/SectionHeading';
import { PropTable, type PropRow } from '@/docs/components/PropTable';

const word: PropRow[] = [
  { name: 'id', type: 'number', description: 'Stable DB primary key.' },
  { name: 'text', type: 'string', description: 'OCR surface form.' },
  { name: 'x0, y0, x1, y1', type: 'number', description: 'Bounding box in page pixels.' },
  { name: 'lineIdx', type: 'number', description: '0-based line index after tilt correction.' },
  { name: 'conf', type: 'number', description: 'OCR confidence [0, 1].' },
  { name: 'prefix / suffix', type: 'string | null', description: 'Attached punctuation.' },
  { name: 'pos', type: 'string | null', description: 'spaCy UPOS tag.' },
  { name: 'lemma', type: 'string | null', description: 'Lemma if available.' },
  { name: 'freq', type: 'number | null', description: 'wordfreq score.' },
  { name: 'rarity', type: 'number | null', description: 'Normalised inverse frequency [0, 1].' },
  { name: 'isContent', type: '0 | 1', description: 'Content word flag.' },
  { name: 'isConnective', type: '0 | 1', description: 'Natural bridge between content words.' },
];

const bbox: PropRow[] = [
  { name: 'x0, y0, x1, y1', type: 'number', description: 'Axis-aligned box in page space.' },
];

const pt: PropRow[] = [
  { name: 'x', type: 'number', description: 'Horizontal coordinate.' },
  { name: 'y', type: 'number', description: 'Vertical coordinate.' },
];

const channel: PropRow[] = [
  { name: 'points', type: 'Pt[]', description: 'Centreline polyline.' },
  { name: 'gutterIds', type: 'number[]', description: 'Gutters the segment passes through.' },
];

const gutter: PropRow[] = [
  { name: 'gutterId', type: 'number', description: '' },
  { name: 'kind', type: "'h_line' | 'v_slit'", description: 'Inter-line gap vs intra-line slit.' },
  { name: 'lineIdxA / lineIdxB', type: 'number | null', description: 'Adjacent line indices.' },
  { name: 'x0,y0,x1,y1', type: 'number', description: 'Bounds.' },
  { name: 'polyline', type: '[number, number][]', description: 'Centre path.' },
  { name: 'minWidth', type: 'number', description: 'Minimum channel width (px).' },
  { name: 'riverScore', type: 'number', description: 'Heuristic river suitability.' },
];

const port: PropRow[] = [
  { name: 'x, y', type: 'number', description: 'Port position.' },
  { name: 'gutterId', type: 'number', description: '' },
  { name: 'compass', type: "'N'|'S'|'E'|'W'", description: '' },
  { name: 'nodeId', type: 'number', description: 'Graph node id.' },
];

const dock: PropRow[] = [
  { name: 'wordId', type: 'number', description: '' },
  { name: 'breathing*', type: 'number', description: 'Slack to obstacles N/S/E/W.' },
  { name: 'slackDirection', type: 'string', description: 'e.g. NE' },
  { name: 'ports', type: 'Port[]', description: 'Gutter entry/exit ports.' },
  { name: 'dockAbove/Below/Left/Right', type: 'number | null', description: 'Neighbour gutter ids.' },
];

const graphNode: PropRow[] = [
  { name: 'id', type: 'number', description: '' },
  { name: 'x, y', type: 'number', description: 'Node position.' },
  { name: 'kind', type: 'string', description: 'Node classification.' },
  { name: 'edges', type: '[number, number, number][]', description: 'Outgoing edges (target, cost, …).' },
];

const pageGraph: PropRow[] = [
  { name: 'nodes', type: 'Map<number, GraphNode>', description: 'Whitespace navigation graph.' },
];

const balloonOpts: PropRow[] = [
  { name: 'pad', type: 'number?', description: 'Extra padding around bbox.' },
  { name: 'wobble', type: 'number?', description: 'Edge irregularity.' },
  { name: 'wobbleFreq', type: 'number?', description: 'Spatial frequency of wobble.' },
  { name: 'samples', type: 'number?', description: 'Samples along perimeter.' },
  { name: 'seed', type: 'number?', description: 'Deterministic variation.' },
];

const channelOpts: PropRow[] = [
  { name: 'halfWidth', type: 'number?', description: 'Half stroke width.' },
  { name: 'jitter', type: 'number?', description: 'Lateral noise amplitude.' },
  { name: 'meander', type: 'number?', description: 'Low-frequency lateral sway.' },
  { name: 'widthMod', type: 'number?', description: 'Width modulation amount.' },
  { name: 'sampleStep', type: 'number?', description: 'Distance between samples along path.' },
  { name: 'seed', type: 'number?', description: 'RNG seed.' },
];

const flowOpts: PropRow[] = [
  { name: 'body', type: 'Bbox', description: 'Required on type; omitted at runtime → page body.' },
  { name: 'obstacles', type: 'Bbox[]?', description: 'Obstacle rects.' },
  { name: 'seed', type: 'number?', description: '' },
  { name: 'stepSize', type: 'number?', description: 'Walker step.' },
  { name: 'maxSteps', type: 'number?', description: 'Cap iterations.' },
  { name: 'noiseFreq', type: 'number?', description: 'Noise scale.' },
  { name: 'targetWeight', type: 'number?', description: 'Attraction to goal.' },
  { name: 'candidateCount', type: 'number?', description: 'Branching factor.' },
  { name: 'obstaclePad', type: 'number?', description: 'Inflate obstacles.' },
];

const chunksOpts: PropRow[] = [
  { name: 'maxLen', type: 'number?', description: 'Max words per chunk.' },
  { name: 'candidates', type: '…?', description: 'Advanced chunker tuning.' },
];

const selectChunksOpts: PropRow[] = [
  { name: 'maxLen', type: 'number?', description: 'Max words per chunk (inherited).' },
  { name: 'candidates', type: '…?', description: 'Advanced chunker tuning (inherited).' },
  { name: 'nSeeds', type: 'number?', description: 'Target chunk count.' },
  { name: 'minLineDist', type: 'number?', description: 'Minimum line index spacing between seeds.' },
  { name: 'seed', type: 'number?', description: 'RNG seed.' },
  { name: 'variation', type: 'number?', description: 'Shuffle diversity.' },
];

export function TypesReference() {
  return (
    <section className="mb-16 scroll-mt-24">
      <SectionHeading
        id="types"
        title="Exported types"
        description="Re-exported from inhumument-lib for TypeScript consumers."
      />
      <Subheading>Word</Subheading>
      <PropTable rows={word} />
      <Subheading>Bbox · Pt</Subheading>
      <PropTable rows={bbox} />
      <PropTable rows={pt} />
      <Subheading>ChannelSegment</Subheading>
      <PropTable rows={channel} />
      <Subheading>Gutter · Port · Dock</Subheading>
      <PropTable rows={gutter} />
      <PropTable rows={port} />
      <PropTable rows={dock} />
      <Subheading>GraphNode · PageGraph</Subheading>
      <PropTable rows={graphNode} />
      <PropTable rows={pageGraph} />
      <Subheading>HumumentLoadOptions</Subheading>
      <PropTable
        rows={[
          { name: 'page', type: 'number', description: '' },
          { name: 'dataBase', type: 'string?', description: '' },
          { name: 'imageBase', type: 'string?', description: '' },
        ]}
      />
      <Subheading>PageMeta · PageRef</Subheading>
      <PropTable
        rows={[
          { name: 'width / height', type: 'number', description: 'PageMeta' },
          { name: 'body / valid', type: 'Bbox | null', description: 'PageMeta' },
          { name: 'pageNum', type: 'number', description: 'PageRef' },
        ]}
      />
      <Subheading>BalloonOptions · ChannelOptions · FlowOptions</Subheading>
      <PropTable rows={balloonOpts} />
      <PropTable rows={channelOpts} />
      <PropTable rows={flowOpts} />
      <Subheading>ChunksOptions · SelectChunksOptions</Subheading>
      <PropTable rows={chunksOpts} />
      <PropTable rows={selectChunksOpts} />
    </section>
  );
}
