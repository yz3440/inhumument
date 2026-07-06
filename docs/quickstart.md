# Quick Start

`inhumument-lib` loads a single page of _A Human Document_ — its words, OCR
boxes, whitespace geometry, and navigation graph — and gives you a POS-pattern
phrase chunker, river pathfinders, and **p5.js drawing helpers** to paint over
it. The full 367-page dataset is fetched from a CDN, so there is **nothing to
host**.

## Install

```sh
npm install inhumument-lib p5
```

`p5` is a **peer** dependency. `inhumument-lib` wraps
[`humument`](https://www.npmjs.com/package/humument) (installed automatically)
and adds the p5 layer.

## No build step? CDN / p5 web editor

Load the IIFE bundle — it exposes an `InhumumentLib` global and bundles
`humument` in, so it works in a plain `<script>` with no bundler (e.g. on
[editor.p5js.org](https://editor.p5js.org) or OpenProcessing):

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/inhumument-lib@0.1/dist/index.global.js"></script>
<script>
  const { Humument } = InhumumentLib;
  // ... same API as the ESM import below
</script>
```

## A first sketch

`Humument.load` is async, and p5 **1.x** does not await an async
`preload`/`setup`. Kick the load off in `setup()` and gate `draw()` until it
resolves:

```js
import { Humument } from 'inhumument-lib'; // CDN: const { Humument } = InhumumentLib;

let H = null;

function setup() {
  createCanvas(100, 100); // resized once the page loads
  noLoop();
  Humument.load({ page: 33 }).then((h) => {
    H = h;
    resizeCanvas(H.page.width, H.page.height);
    // The lib never loads the scan itself — assign it, then redraw:
    H.page.image = loadImage(H.page.imageUrl, () => redraw());
  });
}

function draw() {
  if (!H || !H.page.image) return;
  image(H.page.image, 0, 0);          // the page scan, 1:1 with word coordinates

  const phrases = H.selectChunks({ nSeeds: 4, minLineDist: 3, seed: 42 });
  fill(255);
  stroke(20);
  for (const ph of phrases) H.draw.balloon(ph, { wobble: 0.15 });
}
```

`Humument.load({ page: 33 })` needs no other options — data and page scans
resolve from the CDN. On **p5 2.x**, `setup` may be `async`, so you can simply
`await Humument.load(...)` inside it.

## Self-hosting the data

Pass `dataBase` / `imageBase` to point at your own export instead of the CDN:

```js
Humument.load({
  page: 33,
  dataBase: '/db',                 // holds catalog.json + pages/pNNNN.json(.gz)
  imageBase: '/pages_normalized',  // holds pNNNN.jpg
});
```

## Next

- **[Drawing API](api.md)** — every `H.draw.*` helper and the `H.page.image` slot.
- The core data / chunker / rivers / geometry API is in the
  [humument docs](https://yz3440.github.io/humument/).
