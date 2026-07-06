# The Editor

The [InHumument editor](https://github.com/yz3440/inhumument) is a browser app
for making erasure-poetry pages by writing small p5.js sketches over the book.
It is the reference consumer of `inhumument-lib` — everything it does is
available to your own sketches.

## How it uses the library

- It loads a page with `Humument.load({ page })` — no `dataBase`/`imageBase`,
  so data and scans come from the CDN.
- It preloads the scan into `H.page.image` before running your sketch, so a
  sketch can use `image(H.page.image, 0, 0)` and `H.draw.word()` immediately.
- Your sketch runs in p5 **global mode** with `H` injected as a global, so
  `H.draw.balloon(phrase)` and the rest work with no wiring.

## A minimal editor-style sketch

```js
let H = null;

function setup() {
  createCanvas(100, 100);
  noLoop();
  Humument.load({ page: 40 }).then((h) => {
    H = h;
    resizeCanvas(H.page.width, H.page.height);
    H.page.image = loadImage(H.page.imageUrl, () => redraw());
  });
}

function draw() {
  if (!H || !H.page.image) return;
  image(H.page.image, 0, 0);

  // paint everything down to a faint wash, then lift a few phrases back out
  noStroke();
  fill(248, 244, 234, 210);
  rect(0, 0, width, height);

  for (const ph of H.selectChunks({ nSeeds: 6, minLineDist: 2, seed: 7 })) {
    fill(255); stroke(20);
    H.draw.balloon(ph, { wobble: 0.18 });
    for (const w of ph) H.draw.word(w);   // kept words stay crisp
  }
}
```

## Running the editor locally

```sh
bun install
bun --filter inhumument-lib build     # editor resolves the lib's dist/
bun --filter inhumument-editor dev
```

See the [repo README](https://github.com/yz3440/inhumument) for build and
deploy details.
