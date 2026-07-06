import { SectionHeading, Lead } from '@/docs/components/SectionHeading';
import { CodeBlock } from '@/docs/components/CodeBlock';

const INSTALL = `bun add inhumument-lib p5
# p5 is a peer dependency`;

const STANDALONE = `import { Humument } from 'inhumument-lib';

let H;
async function preload() {
  // Data + page scans resolve from npm (via a CDN) — nothing to host.
  H = await Humument.load({ page: 33 });
}

function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);
  const phrases = H.selectChunks({ nSeeds: 4, minLineDist: 3, seed: 42 });
  fill(255);
  stroke(20);
  for (const ph of phrases) H.draw.balloon(ph, { wobble: 0.15 });
}`;

const INIT = `import { Humument } from 'inhumument-lib';

// Before catalog helpers (e.g. listPages), initialise once.
// Pass { dataBase, imageBase } only if self-hosting the data.
await Humument.init();`;

export function GettingStarted() {
  return (
    <section className="mb-16">
      <SectionHeading
        id="getting-started"
        title="Getting started"
        description="Install the peer dependency, then load a page to receive HumumentInstance (H). Data and page scans resolve from a CDN by default."
      />
      <Lead>inhumument-lib is the p5 layer over the renderer-agnostic <code>humument</code> core; p5 is a peer dependency.</Lead>
      <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Install</h4>
      <CodeBlock code={INSTALL} lang="bash" />
      <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Typical p5 sketch</h4>
      <CodeBlock code={STANDALONE} lang="javascript" />
      <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Parent app (catalog before load)</h4>
      <CodeBlock code={INIT} lang="javascript" />
    </section>
  );
}
