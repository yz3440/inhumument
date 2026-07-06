import p5 from 'p5';
import { HumumentInstance, Word, BalloonOptions, ChannelSegment, ChannelOptions, Humument as Humument$1, HumumentLoadOptions } from 'humument';
export * from 'humument';

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

/** Draw the wobbly balloon enclosing the given words. */
declare function drawBalloon(H: HumumentInstance, words: Word[], opts?: BalloonOptions, pInst?: p5): void;
/** Draw a thick wavy ribbon along a river segment. */
declare function drawRiver(H: HumumentInstance, segment: ChannelSegment, opts?: ChannelOptions, pInst?: p5): void;
/**
 * Draw the original word's pixels onto the canvas — useful for
 * "preserved word stays crisp" effects. Crops the page image at the word's
 * bbox and re-blits at the same coordinates. Requires the page image (the
 * editor preloads it into `H.page.image`).
 */
declare function drawWord(pageImage: p5.Image, word: Word, pInst?: p5): void;
/** Draw the full page image at native resolution. */
declare function drawImage(pageImage: p5.Image, pInst?: p5): void;

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

/** The p5 drawing sugar attached to a loaded page. */
interface DrawAPI {
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
type InhumumentInstance = Omit<HumumentInstance, 'page'> & {
    page: HumumentInstance['page'] & {
        image: p5.Image | null;
    };
    draw: DrawAPI;
};
/**
 * p5-enabled `Humument`: same static surface as the core (`init`, `catalog`),
 * but `load()` returns an {@link InhumumentInstance} with `draw.*` and a
 * `page.image` slot.
 */
declare const Humument: Omit<typeof Humument$1, 'load'> & {
    load(opts: HumumentLoadOptions): Promise<InhumumentInstance>;
};

export { type DrawAPI, Humument, type InhumumentInstance, drawBalloon, drawImage, drawRiver, drawWord };
