# inhumument-lib

The **p5.js rendering layer** for [`humument`](https://www.npmjs.com/package/humument) — Phillips-style erasure-poetry drawing over W. H. Mallock's _A Human Document_ (1892), the book Tom Phillips treated to make _A Humument_.

`humument` is renderer-agnostic: it loads a page's words, OCR boxes, whitespace geometry, and a navigation graph, and returns every drawing primitive as a plain `{x, y}` point array. `inhumument-lib` re-exports all of it and adds back the p5 sugar — an `H.draw.*` namespace and a `H.page.image` slot — so p5 sketches (like those in the [InHumument editor](https://github.com/yz3440/inhumument)) can draw balloons, rivers, and word-stamps in one call.

If you're rendering with Canvas2D / SVG / WebGL, use [`humument`](https://www.npmjs.com/package/humument) directly. If you're drawing with **p5.js**, use this.

## Install

```sh
npm install inhumument-lib p5
```

`p5` is a peer dependency. The full 367-page dataset (words + page scans) is published on npm and fetched from a CDN by default, so there is **nothing to host**.

### No build step? CDN

Load the IIFE bundle — it exposes an `InhumumentLib` global (it bundles `humument` in, so it's self-contained):

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/inhumument-lib@0.1/dist/index.global.js"></script>
<script>
  const { Humument } = InhumumentLib;
  // ... same API as the ESM import
</script>
```

This is the way to use it on [editor.p5js.org](https://editor.p5js.org) or OpenProcessing.

## Usage

`Humument.load` is async, and p5 **1.x** does not await async `preload`/`setup`. Kick off the load in `setup()` and gate `draw()` until it resolves:

```js
import { Humument } from 'inhumument-lib'; // CDN: const { Humument } = InhumumentLib;

let H = null;

function setup() {
  createCanvas(100, 100); // resized once the page loads
  noLoop();
  Humument.load({ page: 33 }).then((h) => {
    H = h;
    resizeCanvas(H.page.width, H.page.height);
    // The lib never loads the image itself — assign it, then draw:
    H.page.image = loadImage(H.page.imageUrl, () => redraw());
  });
}

function draw() {
  if (!H || !H.page.image) return;
  image(H.page.image, 0, 0);

  const phrases = H.selectChunks({ nSeeds: 4, minLineDist: 3, seed: 42 });
  fill(255); stroke(20);
  for (const ph of phrases) H.draw.balloon(ph, { wobble: 0.15 });
}
```

`Humument.load({ page: 33 })` needs no other options — data and images resolve from the npm CDN. Pass `dataBase`/`imageBase` to self-host.

On **p5 2.x** `setup` may be `async`, so you can simply `await Humument.load(...)` inside it.

## The p5 layer

Everything below is added on top of `humument`'s API. The helpers run in p5 **global mode** (pass nothing) or **instance mode** (pass the p5 instance as the last argument).

- `H.draw.balloon(words, opts?, p?)` — wobbly hand-drawn balloon enclosing the words. `opts` is `BalloonOptions` (`pad`, `wobble`, `samples`, `seed`, …).
- `H.draw.river(segment, opts?, p?)` — wavy ribbon along a river segment from `H.river.between(a, b)`. `opts` is `ChannelOptions`.
- `H.draw.word(word, p?)` — re-stamp one word's original pixels crisply (needs `H.page.image`).
- `H.draw.image(p?)` — blit the full page scan (needs `H.page.image`).
- `H.page.image` — a writable `p5.Image | null` slot; the lib never fills it, the host does after `loadImage(H.page.imageUrl)`.

The same functions are also exported standalone: `drawBalloon(H, words, opts?, p?)`, `drawRiver(H, seg, opts?, p?)`, `drawWord(pageImage, word, p?)`, `drawImage(pageImage, p?)`.

## Everything else

All of `humument`'s API is re-exported unchanged — `H.words` / `H.lines`, `H.selectChunks()`, `H.river.between()` / `H.river.flow()`, the pure `H.geom.balloon()` / `H.geom.channel()` point-array primitives, `H.bboxOf()`, `H.noise()` / `H.random()`, and the `Word` / `Gutter` / `BalloonOptions` types. See the [`humument` docs](https://yz3440.github.io/humument/).

## License

MIT
