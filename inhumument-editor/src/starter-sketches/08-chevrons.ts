export const chevrons = `// After A Humument p136 — hard-edged diagonal chevrons over the page,
// boxy caption strips and balloons linked by thin wandering stems.
const SEED = Math.floor(Math.random() * 99999);
const N_PHRASES = 7;
const PAPER = [248, 244, 234];
const INK = [30, 26, 24];
const WHITE = [252, 250, 246];
const BAND = 90;
const SECTION_SPLIT = 0.62;
const PALETTE = [
  [95, 168, 160, 235],
  [108, 96, 168, 235],
  [0, 0, 0, 0],
  [196, 190, 224, 235],
  [140, 200, 228, 235],
  [95, 168, 160, 130],
];
const BALLOON_PAD = 7;
const WOBBLE = 0.26;
const SAMPLES = 40;
const NECK_HALF = 5;
const OUTLINE = 2;
const MAX_LINK_LINES = 9;
const STEM_STEP = 4;

function setup() {
  createCanvas(H.page.width, H.page.height);
  noLoop();
}

function draw() {
  background(PAPER[0], PAPER[1], PAPER[2]);
  if (H.page.image) image(H.page.image, 0, 0);

  const body = H.page.body || { x0: 0, y0: 0, x1: H.page.width, y1: H.page.height };

  // Sepia wash so the ground reads as collage, not raw print.
  noStroke();
  fill(120, 100, 85, 70);
  rect(body.x0, body.y0, body.x1 - body.x0, body.y1 - body.y0);

  // Two stacked sections, each a field of nested chevrons: two mirrored
  // 45-degree stripe fields meeting at a shared vertical axis. Alpha-0
  // palette entries are windows where the page shows through.
  const rng = H.random(SEED + 13);
  const ySplit = body.y0 + SECTION_SPLIT * (body.y1 - body.y0);
  chevronSection(body.x0, body.y0, body.x1, ySplit, rng);
  chevronSection(body.x0, ySplit, body.x1, body.y1, rng);

  // Ink structure: body frame + section divider.
  noFill();
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(3);
  rect(body.x0, body.y0, body.x1 - body.x0, body.y1 - body.y0);
  line(body.x0, ySplit, body.x1, ySplit);

  const phrases = [];
  for (const g of GROUPS) if (g && g.length) phrases.push(g);
  if (SELECTION && SELECTION.length) phrases.push(SELECTION);
  if (!phrases.length) {
    phrases.push(...H.selectChunks({ nSeeds: N_PHRASES, minLineDist: 2, seed: SEED, variation: 1 }));
  }
  phrases.sort((a, b) => a[0].lineIdx - b[0].lineIdx || a[0].x0 - b[0].x0);
  if (!phrases.length) return;

  // Chains: consecutive phrases link unless the text gap is too wide.
  // A chain's first phrase renders as a boxy caption strip (p136 style).
  const linked = [];
  for (let i = 0; i < phrases.length - 1; i++) {
    const lastW = phrases[i][phrases[i].length - 1];
    const firstW = phrases[i + 1][0];
    linked.push(firstW.lineIdx - lastW.lineIdx <= MAX_LINK_LINES);
  }
  const isChainStart = (i) => i === 0 || !linked[i - 1];

  const stems = [];
  for (let i = 0; i < phrases.length - 1; i++) {
    if (!linked[i]) continue;
    const anchors = neckAnchors(H.bboxOf(phrases[i]), H.bboxOf(phrases[i + 1]));
    stems.push(H.river.flow(anchors[0], anchors[1], {
      seed: SEED + i * 17,
      stepSize: STEM_STEP,
      targetWeight: 0.5,
      noiseFreq: 0.01,
      obstacles: [],
    }));
  }

  const opts = (ph) => ({
    pad: BALLOON_PAD, wobble: WOBBLE, samples: SAMPLES, seed: ph[0].id,
  });
  const caption = (ph) => {
    const bb = H.bboxOf(ph);
    rect(
      bb.x0 - BALLOON_PAD, bb.y0 - BALLOON_PAD,
      bb.x1 - bb.x0 + 2 * BALLOON_PAD, bb.y1 - bb.y0 + 2 * BALLOON_PAD,
    );
  };

  // Pass A — ink rim.
  stroke(INK[0], INK[1], INK[2]);
  strokeWeight(OUTLINE * 2);
  fill(INK[0], INK[1], INK[2]);
  for (let i = 0; i < phrases.length; i++) {
    if (isChainStart(i)) caption(phrases[i]);
    else H.draw.balloon(phrases[i], opts(phrases[i]));
  }
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  strokeWeight(2 * (NECK_HALF + OUTLINE));
  for (const s of stems) drawPolyline(s);

  // Pass B — white body.
  noStroke();
  fill(WHITE[0], WHITE[1], WHITE[2]);
  for (let i = 0; i < phrases.length; i++) {
    if (isChainStart(i)) caption(phrases[i]);
    else H.draw.balloon(phrases[i], opts(phrases[i]));
  }
  noFill();
  stroke(WHITE[0], WHITE[1], WHITE[2]);
  strokeWeight(2 * NECK_HALF);
  for (const s of stems) drawPolyline(s);

  if (H.page.image) {
    for (const ph of phrases) for (const w of ph) H.draw.word(w);
  }
}

function chevronSection(sx0, sy0, sx1, sy1, rng) {
  const sw = sx1 - sx0;
  const sh = sy1 - sy0;
  const axisX = sx0 + (0.35 + rng() * 0.3) * sw;
  const apexY = (sy0 + sy1) / 2;
  const pointDir = rng() < 0.5 ? 1 : -1;
  const palShift = Math.floor(rng() * PALETTE.length);
  stripeHalf(sx0, sy0, axisX - sx0, sh, axisX, apexY, pointDir * QUARTER_PI, palShift);
  stripeHalf(axisX, sy0, sx1 - axisX, sh, axisX, apexY, -pointDir * QUARTER_PI, palShift);
}

function stripeHalf(cx, cy, cw, ch, axisX, apexY, angle, palShift) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(cx, cy, cw, ch);
  drawingContext.clip();
  push();
  translate(axisX, apexY);
  rotate(angle);
  noStroke();
  const n = PALETTE.length;
  const KMAX = Math.ceil((cw + ch + Math.abs(apexY)) / BAND) + 2;
  for (let k = -KMAX; k <= KMAX; k++) {
    const c = PALETTE[(((k + palShift) % n) + n) % n];
    if (c[3] === 0) continue;
    fill(c[0], c[1], c[2], c[3]);
    rect(-6000, k * BAND, 12000, BAND + 1);
  }
  pop();
  drawingContext.restore();
}

function neckAnchors(A, B) {
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
  return [a, b];
}

function drawPolyline(pts) {
  if (pts.length < 2) return;
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape();
}
`;
