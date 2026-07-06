import { SectionHeading, Lead } from '@/docs/components/SectionHeading';

export function Overview() {
  return (
    <section className="mb-16">
      <SectionHeading
        id="overview"
        title="Overview"
        description="inhumument-lib loads OCR text, line structure, and a whitespace navigation graph for a single page of W. H. Mallock’s A Human Document (1892), then exposes Phillips-style primitives for p5.js sketches."
      />
      <Lead>
        In the InHumument editor, a loaded page instance is exposed as the global <code className="font-mono text-foreground">H</code>.
        Standalone sketches import <code className="font-mono text-foreground">Humument</code> and call{' '}
        <code className="font-mono text-foreground">Humument.load()</code> to obtain the same API.
      </Lead>
      <ul className="list-inside list-disc space-y-2 text-[13px] leading-relaxed text-muted-foreground">
        <li>All coordinates are pixel space of the page image, origin top-left, y down — same as canvas / p5.</li>
        <li>
          Align geometry with normalized page imagery under <code className="font-mono text-foreground">/pages_normalized</code>{' '}
          when using the bundled database.
        </li>
        <li>
          <code className="font-mono text-foreground">H.page.image</code> is not set by the library; assign it after{' '}
          <code className="font-mono text-foreground">loadImage(H.page.imageUrl)</code> so drawing helpers can composite text on the scan.
        </li>
      </ul>
    </section>
  );
}
