# inhumument-lib

The **p5.js rendering layer** for [`humument`](https://www.npmjs.com/package/humument) —
Phillips-style **erasure poetry** over W. H. Mallock's _A Human Document_ (1892),
the book **Tom Phillips** treated to make _A Humument_.

`humument` is deliberately **renderer-agnostic**: it loads a page's words, OCR
boxes, whitespace geometry, and a navigation graph, and returns every drawing
primitive as a plain `{x, y}` point array — you render it with any 2D API.
`inhumument-lib` re-exports all of it and adds back the **p5 sugar**: an
`H.draw.*` namespace (balloons, rivers, word-stamping) and a writable
`H.page.image` slot. It is the library that powers the
[InHumument editor](https://github.com/yz3440/inhumument).

## Which package do I want?

| If you draw with… | Use |
| --- | --- |
| **p5.js** | [`inhumument-lib`](https://www.npmjs.com/package/inhumument-lib) — this |
| Canvas2D / SVG / WebGL / your own renderer | [`humument`](https://www.npmjs.com/package/humument) directly |

`inhumument-lib` **re-exports the entire `humument` API**, so you never import
both — everything (`H.words`, `H.selectChunks()`, `H.river.between()`,
`H.geom.*`, the `Word`/`Gutter` types) is available from `inhumument-lib`, plus
the `H.draw.*` layer documented here.

## Zero configuration

The full 367-page dataset (words + page scans) is published on npm
(`humument-data` / `humument-images`) and fetched from the
[jsDelivr](https://www.jsdelivr.com/) CDN by default, so
`Humument.load({ page: 33 })` works from any origin with **nothing to host**.

## Where to go next

- **[Quick Start](quickstart.md)** — a p5 sketch in the browser or the p5 web editor.
- **[Drawing API](api.md)** — the `H.draw.*` layer and the `H.page.image` slot.
- **[The Editor](editor.md)** — how the InHumument editor uses this library.
- The renderer-agnostic core (data loading, chunker, rivers, geometry) is
  documented in the [**humument docs**](https://yz3440.github.io/humument/).

## License

The 1892 text is public domain; this code and packaging are **MIT-licensed**.
See [Provenance & License](provenance.md).
