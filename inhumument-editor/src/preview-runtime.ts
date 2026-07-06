/**
 * Runs inside the preview iframe. Loads p5 + inhumument-lib, then listens for
 * `run` and `view` messages from the parent.
 *
 * For each `run` message it tears down any previous p5 sketch, awaits
 * `Humument.load(...)`, attaches `H` to `window`, and indirect-evals the
 * user's sketch text in global scope. Function declarations from the sketch
 * become globals (`window.setup`, `window.draw`, etc.) which p5 picks up
 * when we instantiate it in global mode (`new p5()`).
 *
 * The editor injects a read-only header at the top of every sketch that
 * declares `SELECTION` and `GROUPS` as `const` arrays, so those names are
 * already in scope when the sketch runs. The runtime itself is unaware of
 * selection state.
 *
 * Console output and errors are forwarded to the parent via `postMessage`.
 */

import p5 from 'p5';
import { Humument } from 'inhumument-lib';

declare global {
  interface Window {
    p5: typeof p5;
    H: unknown;
  }
}
window.p5 = p5;

const SRC = 'humument-preview';
function send(m: object): void {
  parent.postMessage({ ...m, src: SRC }, '*');
}

function stringify(x: unknown): string {
  if (typeof x === 'string') return x;
  try {
    return JSON.stringify(x, (_k, v) => (typeof v === 'bigint' ? String(v) : v));
  } catch {
    return String(x);
  }
}

(['log', 'warn', 'error', 'info'] as const).forEach((lvl) => {
  const orig = console[lvl].bind(console);
  console[lvl] = ((...args: unknown[]) => {
    orig(...args);
    try {
      send({ kind: 'log', level: lvl, message: args.map(stringify).join(' ') });
    } catch {
      /* */
    }
  }) as typeof console[typeof lvl];
});

window.addEventListener('error', (e) => {
  send({
    kind: 'sketch-error',
    message: e.message,
    line: e.lineno,
    column: e.colno,
  });
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason as { message?: string } | string | undefined;
  const msg = reason && typeof reason === 'object' && reason.message ? reason.message : String(reason);
  send({ kind: 'sketch-error', message: 'Unhandled: ' + msg });
});

let currentP5: p5 | null = null;
const status = document.getElementById('status');

let viewMode: 'fit' | 'manual' = 'fit';
let viewZoom = 1;

/** Default render density. Sketches can override by calling pixelDensity()
 *  themselves inside setup() — the wrapper just sets a sensible default. */
const DEFAULT_PIXEL_DENSITY = 2;

/** Cached metadata about the most recent successful run, used by the
 *  export handler to name the downloaded file. */
let lastRun: { page: number; pageLabel: number } | null = null;

/** Resize the canvas's display size (not its pixel buffer) to honour the
 *  current view mode. Buffer stays at the page's native resolution so sketches
 *  always draw 1:1 — only the on-screen size changes. */
function applyView(): void {
  const cv = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (!cv) return;
  const cw = cv.width;
  const ch = cv.height;
  if (!cw || !ch) return;
  let scale: number;
  if (viewMode === 'fit') {
    const padding = 48;
    const sw = (window.innerWidth - padding) / cw;
    const sh = (window.innerHeight - padding) / ch;
    scale = Math.min(sw, sh, 1);
  } else {
    scale = viewZoom;
  }
  if (!Number.isFinite(scale) || scale <= 0) return;
  cv.style.width = `${Math.round(cw * scale)}px`;
  cv.style.height = `${Math.round(ch * scale)}px`;
  send({ kind: 'view-applied', scale });
}

window.addEventListener('resize', () => {
  if (viewMode === 'fit') applyView();
});

const SKETCH_GLOBALS = [
  'setup', 'draw', 'preload', 'windowResized',
  'mousePressed', 'mouseReleased', 'mouseClicked', 'mouseMoved', 'mouseDragged',
  'keyPressed', 'keyReleased', 'keyTyped',
] as const;

/** Preload a page image as a p5.Image without instantiating the user's sketch.
 *  We spin up a hidden helper p5 instance, suppress its canvas, ask it to
 *  load the image, then dispose. */
async function preloadPageImage(url: string): Promise<p5.Image> {
  return new Promise<p5.Image>((resolve, reject) => {
    const helper = new p5((p) => {
      p.setup = () => {
        p.noCanvas();
        p.loadImage(
          url,
          (img: p5.Image) => { resolve(img); helper.remove(); },
          (err: unknown) => { reject(err as Error); helper.remove(); },
        );
      };
    });
  });
}

async function run(payload: {
  page: number;
  pageLabel?: number;
  sketch: string;
}): Promise<void> {
  // Tear down previous sketch (DOM + p5 internals).
  if (currentP5) {
    try { currentP5.remove(); } catch { /* */ }
    currentP5 = null;
  }
  for (const k of SKETCH_GLOBALS) {
    delete (window as unknown as Record<string, unknown>)[k];
  }
  document.querySelectorAll('canvas').forEach((c) => c.remove());

  // The page-label printed inside the book — what the user sees. The raw
  // payload.page is the DB key and never appears in user-facing strings.
  const label = typeof payload.pageLabel === 'number' ? payload.pageLabel : payload.page;

  if (status) status.textContent = `loading p${label}…`;

  let H: Awaited<ReturnType<typeof Humument.load>>;
  try {
    // Data + page scans resolve from npm (humument-data / humument-images)
    // via a CDN by default — nothing to host.
    H = await Humument.load({ page: payload.page });
    window.H = H;
  } catch (e: unknown) {
    const msg = (e as Error).message ?? String(e);
    send({ kind: 'sketch-error', message: 'Humument.load failed: ' + msg });
    if (status) status.textContent = 'load failed';
    return;
  }

  // Preload the page image so sketches can use H.page.image directly.
  try {
    H.page.image = await preloadPageImage(H.page.imageUrl);
  } catch (e: unknown) {
    send({
      kind: 'log',
      level: 'warn',
      message: 'page image failed to load: ' + ((e as Error).message ?? String(e)),
    });
  }

  if (status) status.textContent = `p${label}`;

  try {
    // Run the sketch inside its own function scope. We can't use indirect
    // eval at global scope here because the editor's header declares
    // `const SELECTION` and `const GROUPS` — those become persistent global
    // lexical bindings, and a second eval would throw
    // `Identifier 'SELECTION' has already been declared`. The Function
    // constructor gives us a fresh scope each call; the consts live and
    // die with the function invocation.
    //
    // After the user's body, hoist sketch-defined p5 lifecycle functions
    // out to globalThis (so p5 global mode picks them up) and wrap setup
    // so we set a default pixelDensity for crisper output. The user can
    // override by calling pixelDensity() themselves inside setup.
    const hoist = SKETCH_GLOBALS
      .map((k) => {
        if (k === 'setup') {
          return `
if (typeof setup === 'function') {
  const __userSetup = setup;
  globalThis.setup = function() {
    if (typeof pixelDensity === 'function') {
      try { pixelDensity(${DEFAULT_PIXEL_DENSITY}); } catch (e) { /* */ }
    }
    return __userSetup.apply(this, arguments);
  };
}`;
        }
        return `\nif (typeof ${k} === 'function') globalThis.${k} = ${k};`;
      })
      .join('');
    const sketchFn = new Function(
      payload.sketch + hoist + '\n//# sourceURL=user-sketch.js',
    );
    sketchFn();

    if (typeof (window as unknown as { setup?: unknown }).setup !== 'function') {
      send({
        kind: 'sketch-error',
        message: 'sketch defines no `setup()` function — nothing to render',
      });
      return;
    }

    // p5 global mode: invoking the constructor with no sketch arg makes it
    // pick up window.setup / window.draw / etc. The @types declare a sketch
    // arg as required, so we cast.
    const t0 = performance.now();
    const P5Ctor = p5 as unknown as new () => p5;
    currentP5 = new P5Ctor();
    const t1 = performance.now();
    // p5 appends the canvas to <body>. Move it into the centered stage so it
    // can scroll naturally once we apply a manual zoom.
    const stage = document.getElementById('stage');
    const cv = document.querySelector('canvas');
    if (stage && cv && cv.parentElement !== stage) stage.appendChild(cv);
    applyView();
    lastRun = { page: payload.page, pageLabel: label };
    send({
      kind: 'log',
      level: 'info',
      message: `redraw p${label} (${(t1 - t0).toFixed(0)}ms)`,
    });
  } catch (e: unknown) {
    const err = e as Error & { lineNumber?: number };
    send({ kind: 'sketch-error', message: err.message ?? String(e), line: err.lineNumber });
  }
}

/** Save the current canvas as a PNG. The download fires from inside the
 *  iframe, so the iframe must be allowed to issue downloads (we add
 *  `allow-downloads` to the sandbox attribute on the parent side). */
function exportCanvas(): void {
  const cv = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (!cv || !lastRun) {
    send({
      kind: 'sketch-error',
      message: 'nothing to export — run a sketch first',
    });
    return;
  }
  const { pageLabel } = lastRun;
  const filename = `inhumument-p${pageLabel}.png`;
  cv.toBlob((blob) => {
    if (!blob) {
      send({ kind: 'sketch-error', message: 'export failed: canvas could not be encoded' });
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
    send({ kind: 'log', level: 'info', message: `exported ${filename} (${cv.width}x${cv.height})` });
  }, 'image/png');
}

window.addEventListener('message', (e: MessageEvent) => {
  const data = e.data as
    | {
        kind?: string;
        page?: number;
        pageLabel?: number;
        sketch?: string;
        mode?: 'fit' | 'manual';
        value?: number;
      }
    | null;
  if (!data) return;
  if (
    data.kind === 'run' &&
    typeof data.page === 'number' &&
    typeof data.sketch === 'string'
  ) {
    void run({
      page: data.page,
      pageLabel: typeof data.pageLabel === 'number' ? data.pageLabel : undefined,
      sketch: data.sketch,
    });
  } else if (data.kind === 'export') {
    exportCanvas();
  } else if (data.kind === 'view') {
    if (data.mode === 'fit') {
      viewMode = 'fit';
    } else if (data.mode === 'manual' && typeof data.value === 'number') {
      viewMode = 'manual';
      viewZoom = data.value;
    }
    applyView();
  }
});

parent.postMessage({ kind: 'ready', src: SRC }, '*');
