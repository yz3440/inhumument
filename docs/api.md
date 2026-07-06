# Drawing API

Everything here is what `inhumument-lib` adds **on top of**
[`humument`](https://yz3440.github.io/humument/). The rest of the instance —
`H.words`, `H.lines`, `H.selectChunks()`, `H.river.*`, `H.geom.*`, `H.bboxOf()`,
`H.noise()`/`H.random()` — is `humument`'s and documented there.

The helpers run in p5 **global mode** (pass nothing — they read the `window`
p5 globals) or **instance mode** (pass the p5 instance as the last argument).

## `H.page.image`

A writable slot on the loaded page:

```ts
H.page.image: p5.Image | null   // starts null
```

The library **never fills it** — you assign it after loading the scan, then the
`word`/`image` helpers below read it:

```js
H.page.image = loadImage(H.page.imageUrl, () => redraw());
```

`H.page.imageUrl` (a plain string, from `humument`) is the source URL. Loading
the image is always the host's job so the library stays renderer-agnostic under
the hood.

## `H.draw.balloon(words, opts?, p?)`

Draw a wobbly, hand-drawn balloon enclosing the bounding box of `words` (a
`Word[]`, e.g. one phrase from `H.selectChunks()`).

```js
for (const ph of H.selectChunks({ nSeeds: 4, seed: 42 })) {
  fill(255); stroke(20);
  H.draw.balloon(ph, { wobble: 0.15 });
}
```

`opts` is `humument`'s `BalloonOptions`: `pad`, `wobble`, `wobbleFreq`,
`samples`, `seed`. The boundary is drawn as a smooth Catmull-Rom curve, not a
polygon. (For the raw point ring, use `H.geom.balloon(H.bboxOf(words), opts)`
and draw it yourself.)

## `H.draw.river(segment, opts?, p?)`

Draw a wavy ribbon along a river segment — the whitespace path between two
words returned by `H.river.between(a, b)`.

```js
const seg = H.river.between(wordA, wordB); // ChannelSegment | null
if (seg) H.draw.river(seg, { halfWidth: 5 });
```

`opts` is `humument`'s `ChannelOptions` (`halfWidth`, `jitter`, `meander`,
`widthMod`, `seed`, …).

## `H.draw.word(word, p?)`

Re-stamp one word's **original pixels** crisply — the classic "kept word stays
sharp while everything else is painted over" effect. Crops `H.page.image` at the
word's bbox and blits it back at the same coordinates. Needs `H.page.image`.

```js
for (const w of phrase) H.draw.word(w);
```

## `H.draw.image(p?)`

Blit the full page scan at native resolution (equivalent to
`image(H.page.image, 0, 0)`). Needs `H.page.image`.

## Standalone functions

The same helpers are exported as plain functions, for when you don't want the
`H.draw.*` namespace:

```js
import { drawBalloon, drawRiver, drawWord, drawImage } from 'inhumument-lib';

drawBalloon(H, words, opts, p);      // p optional (instance mode)
drawRiver(H, segment, opts, p);
drawWord(H.page.image, word, p);     // takes the image directly
drawImage(H.page.image, p);
```

## Types

`inhumument-lib` re-exports every `humument` type (`Word`, `Gutter`, `Dock`,
`ChannelSegment`, `BalloonOptions`, `ChannelOptions`, `Pt`, `Bbox`, …) and adds:

- `InhumumentInstance` — the loaded page: `humument`'s `HumumentInstance` plus
  `page.image: p5.Image | null` and the `draw` namespace.
- `DrawAPI` — the shape of `H.draw`.
