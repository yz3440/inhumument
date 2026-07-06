/**
 * inhumument-lib — the p5.js rendering layer for `humument`.
 *
 * `humument` is renderer-agnostic: it loads a page's words, whitespace
 * geometry, and navigation graph, and returns drawing primitives as plain
 * `{x, y}` point arrays. This package re-exports all of it and adds back the
 * p5 sugar that powers the InHumument editor: an `H.draw.*` namespace and a
 * writable `H.page.image` slot the host preloads.
 *
 *   import { Humument } from 'inhumument-lib'; // CDN: const { Humument } = InhumumentLib;
 *
 *   let H = null;
 *   function setup() { noLoop(); Humument.load({ page: 33 }).then((h) => {
 *     H = h; resizeCanvas(H.page.width, H.page.height);
 *     H.page.image = loadImage(H.page.imageUrl, () => redraw());
 *   }); }
 *   function draw() {
 *     if (!H || !H.page.image) return;
 *     image(H.page.image, 0, 0);
 *     for (const ph of H.selectChunks({ nSeeds: 4, seed: 42 })) H.draw.balloon(ph);
 *   }
 *
 * Data and images come from npm (humument-data / humument-images) via a CDN by
 * default — nothing to host. Pass `dataBase`/`imageBase` to self-host.
 */

import type p5 from 'p5';
import {
  Humument as Base,
  type HumumentInstance,
  type HumumentLoadOptions,
  type Word,
  type ChannelSegment,
  type BalloonOptions,
  type ChannelOptions,
} from 'humument';
import { drawBalloon, drawRiver, drawWord, drawImage } from './draw.js';

// Everything from the renderer-agnostic core (types + values). The local
// `Humument` below shadows the core's re-exported `Humument`.
export * from 'humument';
export { drawBalloon, drawRiver, drawWord, drawImage } from './draw.js';

/** The p5 drawing sugar attached to a loaded page. */
export interface DrawAPI {
  /** Wobbly balloon around the given words. */
  balloon(words: Word[], opts?: BalloonOptions, p?: p5): void;
  /** Wavy ribbon along a river segment. */
  river(segment: ChannelSegment, opts?: ChannelOptions, p?: p5): void;
  /** Re-stamp one word's original pixels (needs `page.image`). */
  word(word: Word, p?: p5): void;
  /** Blit the full page image (needs `page.image`). */
  image(p?: p5): void;
}

/**
 * A loaded page with the p5 layer: the core `HumumentInstance` plus a
 * writable `page.image` slot and the `draw.*` sugar.
 */
export type InhumumentInstance = Omit<HumumentInstance, 'page'> & {
  page: HumumentInstance['page'] & { image: p5.Image | null };
  draw: DrawAPI;
};

async function load(opts: HumumentLoadOptions): Promise<InhumumentInstance> {
  const base = await Base.load(opts);
  const inst = base as unknown as InhumumentInstance;
  // The core never loads the image; the host assigns this after
  // loadImage(H.page.imageUrl) resolves. draw.word/image read it at call time.
  inst.page.image = null;
  inst.draw = {
    balloon: (words, o, p) => drawBalloon(inst, words, o, p),
    river: (seg, o, p) => drawRiver(inst, seg, o, p),
    word: (w, p) => { if (inst.page.image) drawWord(inst.page.image, w, p); },
    image: (p) => { if (inst.page.image) drawImage(inst.page.image, p); },
  };
  return inst;
}

/**
 * p5-enabled `Humument`: same static surface as the core (`init`, `catalog`),
 * but `load()` returns an {@link InhumumentInstance} with `draw.*` and a
 * `page.image` slot.
 */
export const Humument: Omit<typeof Base, 'load'> & {
  load(opts: HumumentLoadOptions): Promise<InhumumentInstance>;
} = {
  ...Base,
  load,
};
