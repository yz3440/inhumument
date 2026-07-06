/**
 * p5-aware drawing sugar for `humument`. Optional — every primitive in
 * `humument`'s `geom.*` returns plain point arrays, so you can also render
 * with bare p5 (or any 2D API) yourself. These helpers just wrap those
 * arrays in p5 shape calls.
 *
 * Each helper accepts a p5 instance (instance mode) OR falls back to the
 * window globals (global mode). Inside the editor's preview iframe the sketch
 * runs in global mode, so passing nothing Just Works.
 */

import type p5 from 'p5';
import type {
  HumumentInstance,
  Word,
  ChannelSegment,
  BalloonOptions,
  ChannelOptions,
} from 'humument';

type AnyP5 = p5 | (Window & typeof globalThis);

function target(g?: AnyP5): AnyP5 {
  if (g) return g;
  // p5 global mode attaches its drawing functions to window.
  if (typeof window !== 'undefined') return window as AnyP5;
  throw new Error('No p5 instance provided and no window global available');
}

/** Draw the wobbly balloon enclosing the given words. */
export function drawBalloon(
  H: HumumentInstance,
  words: Word[],
  opts: BalloonOptions = {},
  pInst?: p5,
): void {
  if (!words.length) return;
  const g = target(pInst) as any;
  const pts = H.geom.balloon(H.bboxOf(words), opts);
  g.beginShape();
  // Catmull-Rom-ish spline through the points so the boundary reads as a
  // smooth hand-drawn curve rather than a many-sided polygon.
  g.curveVertex(pts[pts.length - 1].x, pts[pts.length - 1].y);
  for (const pt of pts) g.curveVertex(pt.x, pt.y);
  g.curveVertex(pts[0].x, pts[0].y);
  g.curveVertex(pts[1].x, pts[1].y);
  g.endShape(g.CLOSE);
}

/** Draw a thick wavy ribbon along a river segment. */
export function drawRiver(
  H: HumumentInstance,
  segment: ChannelSegment,
  opts: ChannelOptions = {},
  pInst?: p5,
): void {
  if (!segment || segment.points.length < 2) return;
  const g = target(pInst) as any;
  const ring = H.geom.channel(segment, opts);
  if (!ring.length) return;
  g.beginShape();
  for (const pt of ring) g.vertex(pt.x, pt.y);
  g.endShape(g.CLOSE);
}

/**
 * Draw the original word's pixels onto the canvas — useful for
 * "preserved word stays crisp" effects. Crops the page image at the word's
 * bbox and re-blits at the same coordinates. Requires the page image (the
 * editor preloads it into `H.page.image`).
 */
export function drawWord(pageImage: p5.Image, word: Word, pInst?: p5): void {
  const g = target(pInst) as any;
  const w = word.x1 - word.x0;
  const h = word.y1 - word.y0;
  if (w <= 0 || h <= 0) return;
  g.image(pageImage, word.x0, word.y0, w, h, word.x0, word.y0, w, h);
}

/** Draw the full page image at native resolution. */
export function drawImage(pageImage: p5.Image, pInst?: p5): void {
  const g = target(pInst) as any;
  g.image(pageImage, 0, 0);
}
