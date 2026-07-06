# InHumument

A computational homage to Tom Phillips' _A Humument_. An interactive editor for making erasure-poetry pages over W. H. Mallock's _A Human Document_ (1892) — selected words linked by rivers of type, surrounded by painted fields and dialog balloons — and the p5.js library that powers it.

The renderer-agnostic core and the OCR/CV pipeline that produced the data live in a separate repo, **[humument](https://github.com/yz3440/humument)**, published to npm as [`humument`](https://www.npmjs.com/package/humument) (+ the `humument-data` / `humument-images` datasets). This repo is the **p5 layer and the editor** built on top of it.

## Repo layout

- **[`inhumument-lib/`](inhumument-lib)** — npm package [`inhumument-lib`](https://www.npmjs.com/package/inhumument-lib): the p5.js rendering layer over `humument`. Re-exports the full `humument` API and adds the `H.draw.*` sugar (balloons, rivers, word-stamping) and a `H.page.image` slot. See [inhumument-lib/README.md](inhumument-lib/README.md).
- **[`inhumument-editor/`](inhumument-editor)** — the editor app (React + Vite + p5.js), a reference consumer of `inhumument-lib`. `bun --filter inhumument-editor dev`.
- **[`docs/`](docs)** — the `inhumument-lib` documentation site (mkdocs).

The two npm packages form a small ecosystem:

| Package | Repo | What it is |
|---|---|---|
| `humument` | [humument](https://github.com/yz3440/humument) | Renderer-agnostic core — data loading, whitespace geometry, phrase chunker, river pathfinding. Zero deps. |
| `humument-data` / `humument-images` | humument | The 367-page OCR dataset + normalized page scans, served over a CDN. |
| `inhumument-lib` | **here** | p5.js drawing layer over `humument`. |

## Data

Nothing is hosted in this repo. `inhumument-lib` (via `humument`) fetches page data and scans from npm (`humument-data` / `humument-images`) over the jsDelivr CDN by default, so the editor loads a page with zero configuration. Pass `dataBase`/`imageBase` to `Humument.load` / `Humument.init` to point at a self-hosted export instead.

## Develop

Requires [bun](https://bun.sh). From the repo root:

```sh
bun install                              # installs workspaces + the humument dep
bun --filter inhumument-lib build    # build the lib (editor resolves its dist/)
bun --filter inhumument-editor dev         # editor dev server
```

`inhumument-lib` builds an ESM bundle (`humument` external) and an IIFE bundle exposing an `InhumumentLib` global (`humument` bundled in) for the p5 web editor / CDN use.

### Typecheck & build

```sh
bun --filter inhumument-lib typecheck
bun --filter inhumument-editor typecheck
bun --filter inhumument-editor build   # → inhumument-editor/dist/
```

### Deploy the editor (Cloudflare Pages)

```sh
cd inhumument-editor && npm run deploy      # build → wrangler pages deploy dist
```

`dist/` is a self-contained static site (app + `_headers`); page data and scans load from the CDN at runtime, so there's no data step in the build.

## Source text

_A Human Document_ by W. H. Mallock — the one-volume Chapman & Hall 1892 "New Edition", the edition Tom Phillips treated. Page numbers map one-to-one onto _A Humument_ (1–367). The OCR provenance, the source scan ([Internet Archive `ahumandocumenta04mallgoog`](https://archive.org/details/ahumandocumenta04mallgoog), digitized by Google from a public-domain copy), and the CV pipeline that produced the data are documented in the [humument](https://github.com/yz3440/humument) repo.

## License

MIT
