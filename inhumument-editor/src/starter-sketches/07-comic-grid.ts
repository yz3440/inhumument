export const comicGrid = `// After A Humument p53 — a comic-strip grid of painterly panels;
// white phrase balloons meander across the panel borders.
const SEED = Math.floor(Math.random() * 99999);
const COLS = 2;
const ROWS = 4;
const GAP = 10;
const GRID_INSET = 6;
const PAPER = [248, 244, 234];
const INK = [30, 26, 24];
const WHITE = [250, 247, 238];
const N_PHRASES = 8;
const BALLOON_PAD = 7;
const WOBBLE = 0.24;
const SAMPLES = 40;
const NECK_HALF = 5;
const OUTLINE = 2;
const NECK_WANDER = 20;
const MAX_LINK_LINES = 7;
const STROKES_PER_PANEL = 130;
const PALETTES = [
  [[52, 120, 60], [210, 170, 60], [110, 170, 190]],
  [[200, 50, 40], [240, 236, 226], [60, 70, 120]],
  [[236, 120, 40], [150, 60, 90], [240, 220, 180]],
  [[90, 110, 170], [190, 120, 140], [230, 200, 150]],
  [[180, 40, 40], [220, 200, 170], [90, 50, 50]],
  [[120, 140, 80], [220, 180, 90], [70, 90, 60]],
  [[160, 150, 170], [210, 120, 90], [100, 80, 110]],
  [[70, 130, 140], [230, 210, 170], [40, 60, 80]],
];

function setup() {
  createCanvas(H.page.width, H.page.height);
  noLoop();
}

function draw() {
  background(PAPER[0], PAPER[1], PAPER[2]);
  if (H.page.image) image(H.page.image, 0, 0);
  noStroke();
  fill(PAPER[0], PAPER[1], PAPER[2], 200);
  rect(0, 0, width, height);

  const body = H.page.body || { x0: 0, y0: 0, x1: H.page.width, y1: H.page.height };
  const gx0 = body.x0 + GRID_INSET;
  const gy0 = body.y0 + GRID_INSET;
  const gw = body.x1 - body.x0 - 2 * GRID_INSET;
  const gh = body.y1 - body.y0 - 2 * GRID_INSET;
  const pw = (gw - (COLS - 1) * GAP) / COLS;
  const ph = (gh - (ROWS - 1) * GAP) / ROWS;

  const rng = H.random(SEED + 31);
  const shift = Math.floor(rng() * PALETTES.length);

  const panels = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      panels.push({ x: gx0 + c * (pw + GAP), y: gy0 + r * (ph + GAP), i: r * COLS + c });
    }
  }
  for (const p of panels) {
    paintPanel(p.x, p.y, pw, ph, PALETTES[(p.i + shift) % PALETTES.length], rng);
  }

  // Panel borders + an outer rule around the whole strip.
  noFill();
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(3);
  for (const p of panels) rect(p.x, p.y, pw, ph);
  strokeWeight(2);
  rect(gx0 - 5, gy0 - 5, gw + 10, gh + 10);

  const phrases = [];
  for (const g of GROUPS) if (g && g.length) phrases.push(g);
  if (SELECTION && SELECTION.length) phrases.push(SELECTION);
  if (!phrases.length) {
    phrases.push(...H.selectChunks({ nSeeds: N_PHRASES, minLineDist: 2, seed: SEED, variation: 1 }));
  }
  phrases.sort((a, b) => a[0].lineIdx - b[0].lineIdx || a[0].x0 - b[0].x0);
  if (!phrases.length) return;

  const opts = (ph_) => ({
    pad: BALLOON_PAD, wobble: WOBBLE, samples: SAMPLES, seed: ph_[0].id,
  });

  // Necks only between phrases close in the text — distant ones start a
  // fresh chain, like p53's separate speech threads.
  const rng2 = H.random(SEED + 7);
  const necks = [];
  for (let i = 0; i < phrases.length - 1; i++) {
    const lastW = phrases[i][phrases[i].length - 1];
    const firstW = phrases[i + 1][0];
    if (firstW.lineIdx - lastW.lineIdx > MAX_LINK_LINES) continue;
    necks.push(neckLine(H.bboxOf(phrases[i]), H.bboxOf(phrases[i + 1]), rng2));
  }

  // Pass A — ink rim.
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(OUTLINE * 2);
  fill(INK[0], INK[1], INK[2]);
  for (const p of phrases) H.draw.balloon(p, opts(p));
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  strokeWeight(2 * (NECK_HALF + OUTLINE));
  for (const n of necks) drawPolyline(n);

  // Pass B — white body.
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2]);
  for (const p of phrases) H.draw.balloon(p, opts(p));
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2]);
  strokeWeight(2 * NECK_HALF);
  for (const n of necks) drawPolyline(n);

  if (H.page.image) {
    for (const p of phrases) for (const w of p) H.draw.word(w);
  }
}

function paintPanel(px, py, w, h, pal, rng) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(px, py, w, h);
  drawingContext.clip();

  const c0 = pal[0];
  noStroke();
  fill(c0[0], c0[1], c0[2], 235);
  rect(px, py, w, h);

  const baseAngle = (rng() - 0.5) * Math.PI;
  blendMode(MULTIPLY);
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  for (let i = 0; i < STROKES_PER_PANEL; i++) {
    const c = pal[Math.floor(rng() * pal.length)];
    const x0 = px + rng() * w;
    const y0 = py + rng() * h;
    const angle = baseAngle + (rng() - 0.5);
    const len = 20 + rng() * 70;
    const x1 = x0 + Math.cos(angle) * len;
    const y1 = y0 + Math.sin(angle) * len;
    const perp = angle + Math.PI / 2;
    const wob = (rng() - 0.5) * len * 0.3;
    const mx = (x0 + x1) / 2 + Math.cos(perp) * wob;
    const my = (y0 + y1) / 2 + Math.sin(perp) * wob;
    stroke(
      constrain(c[0] + (rng() - 0.5) * 50, 0, 255),
      constrain(c[1] + (rng() - 0.5) * 50, 0, 255),
      constrain(c[2] + (rng() - 0.5) * 50, 0, 255),
      70 + rng() * 70,
    );
    strokeWeight(6 + rng() * 20);
    beginShape();
    curveVertex(x0, y0);
    curveVertex(x0, y0);
    curveVertex(mx, my);
    curveVertex(x1, y1);
    curveVertex(x1, y1);
    endShape();
  }
  blendMode(BLEND);

  // Motif: paper X-triangles, a corner wedge, or plain paint.
  const v = Math.floor(rng() * 3);
  noStroke();
  fill(PAPER[0], PAPER[1], PAPER[2], 245);
  if (v === 0) {
    triangle(px, py, px + w, py, px + w / 2, py + h / 2);
    triangle(px, py + h, px + w, py + h, px + w / 2, py + h / 2);
  } else if (v === 1) {
    const corner = Math.floor(rng() * 4);
    if (corner === 0) triangle(px, py, px + w, py, px, py + h);
    else if (corner === 1) triangle(px + w, py, px + w, py + h, px, py);
    else if (corner === 2) triangle(px + w, py + h, px, py + h, px + w, py);
    else triangle(px, py + h, px, py, px + w, py + h);
  }

  drawingContext.restore();
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
