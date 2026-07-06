export const pinkRiver = `// After A Humument p65 — a single connected chain of white text balloons
// winding down a flat pink field inside a blue rounded frame.
const SEED = Math.floor(Math.random() * 99999);
const N_PHRASES = 10;
const PAPER = [248, 244, 234];
const PINK = [238, 168, 202];
const BLUE = [72, 142, 214];
const INK = [30, 26, 24];
const WHITE = [252, 250, 246];
const FRAME_BAND = 18;
const FRAME_GROW = 14;
const CORNER_R = 46;
const BALLOON_PAD = 10;
const WOBBLE = 0.3;
const SAMPLES = 48;
const NECK_HALF = 11;
const OUTLINE = 2.5;
const NECK_WANDER = 26;

function setup() {
  createCanvas(H.page.width, H.page.height);
  noLoop();
}

function draw() {
  background(PAPER[0], PAPER[1], PAPER[2]);

  const body = H.page.body || { x0: 0, y0: 0, x1: H.page.width, y1: H.page.height };

  // Blue rounded frame band with the flat pink field inside. The page image
  // is deliberately not drawn — p65 hides everything under the pink.
  const fx0 = Math.max(0, body.x0 - FRAME_GROW);
  const fy0 = Math.max(0, body.y0 - FRAME_GROW);
  const fx1 = Math.min(width, body.x1 + FRAME_GROW);
  const fy1 = Math.min(height, body.y1 + FRAME_GROW);
  noStroke();
  fill(BLUE[0], BLUE[1], BLUE[2]);
  rect(fx0, fy0, fx1 - fx0, fy1 - fy0, CORNER_R);
  fill(PINK[0], PINK[1], PINK[2]);
  rect(
    fx0 + FRAME_BAND, fy0 + FRAME_BAND,
    fx1 - fx0 - 2 * FRAME_BAND, fy1 - fy0 - 2 * FRAME_BAND,
    CORNER_R * 0.75,
  );
  noFill();
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(2);
  rect(fx0, fy0, fx1 - fx0, fy1 - fy0, CORNER_R);

  const phrases = [];
  for (const g of GROUPS) if (g && g.length) phrases.push(g);
  if (SELECTION && SELECTION.length) phrases.push(SELECTION);
  if (!phrases.length) {
    phrases.push(...H.selectChunks({ nSeeds: N_PHRASES, minLineDist: 1, seed: SEED, variation: 1 }));
  }
  phrases.sort((a, b) => a[0].lineIdx - b[0].lineIdx || a[0].x0 - b[0].x0);
  if (!phrases.length) return;

  const opts = (ph) => ({
    pad: BALLOON_PAD, wobble: WOBBLE, wobbleFreq: 0.5, samples: SAMPLES, seed: ph[0].id,
  });

  // One neck between each consecutive pair — the chain reads as one river.
  const rng = H.random(SEED + 7);
  const necks = [];
  for (let i = 0; i < phrases.length - 1; i++) {
    necks.push(neckLine(H.bboxOf(phrases[i]), H.bboxOf(phrases[i + 1]), rng));
  }

  // Pass A — ink rim: every shape fattened by OUTLINE.
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(OUTLINE * 2);
  fill(INK[0], INK[1], INK[2]);
  for (const ph of phrases) H.draw.balloon(ph, opts(ph));
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  strokeWeight(2 * (NECK_HALF + OUTLINE));
  for (const n of necks) drawPolyline(n);

  // Pass B — white body: identical geometry floods the interior seams,
  // leaving a single ink rim around the whole blob.
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2]);
  for (const ph of phrases) H.draw.balloon(ph, opts(ph));
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2]);
  strokeWeight(2 * NECK_HALF);
  for (const n of necks) drawPolyline(n);

  if (H.page.image) {
    for (const ph of phrases) for (const w of ph) H.draw.word(w);
  }
}

function neckLine(A, B, rng) {
  let a, b;
  if (B.y0 - A.y1 >= -4) {
    a = { x: constrain((B.x0 + B.x1) / 2, A.x0 + 8, A.x1 - 8), y: A.y1 };
    b = { x: constrain((A.x0 + A.x1) / 2, B.x0 + 8, B.x1 - 8), y: B.y0 };
  } else if (A.x1 < B.x0) {
    a = { x: A.x1, y: constrain((B.y0 + B.y1) / 2, A.y0 + 8, A.y1 - 8) };
    b = { x: B.x0, y: constrain((A.y0 + A.y1) / 2, B.y0 + 8, B.y1 - 8) };
  } else {
    a = { x: A.x0, y: constrain((B.y0 + B.y1) / 2, A.y0 + 8, A.y1 - 8) };
    b = { x: B.x1, y: constrain((A.y0 + A.y1) / 2, B.y0 + 8, B.y1 - 8) };
  }
  const mid = { x: (a.x + b.x) / 2 + (rng() - 0.5) * NECK_WANDER, y: (a.y + b.y) / 2 };
  return H.geom.catmullRom([a, mid, b], 0.5, 14);
}

function drawPolyline(pts) {
  if (pts.length < 2) return;
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape();
}
`;
