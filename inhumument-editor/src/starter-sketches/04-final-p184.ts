export const finalP184 = `const TILE = 28;
const SEED = Math.floor(Math.random() * 99999);
const RIBBON_BLACK = 6;
const RIBBON_WHITE = 3.5;
const BALLOON_PAD = 8;
const WASH_ALPHA = 150;

function setup() {
  createCanvas(H.page.width, H.page.height);
  noLoop();
}

function draw() {
  background(248, 244, 234);
  if (H.page.image) image(H.page.image, 0, 0);

  noStroke();
  fill(248, 244, 234, 210);
  rect(0, 0, width, height);

  const phrases = [];
  for (const g of GROUPS) if (g && g.length) phrases.push(g);
  if (SELECTION && SELECTION.length) phrases.push(SELECTION);
  if (!phrases.length) {
    phrases.push(...H.selectChunks({ nSeeds: 8, minLineDist: 2, seed: SEED }));
  }

  const balloons = phrases.map((ph) =>
    H.geom.balloon(H.bboxOf(ph), {
      pad: 10,
      wobble: 0.2,
      samples: 36,
      seed: ph[0].id,
    }),
  );

  background(248, 244, 234);
  if (H.page.image) image(H.page.image, 0, 0);

  drawBrushLayer();

  drawGraphRoots({
    count: 200,
    seed: (SEED % 97) + 1,
    minDist: 120,
    ribbon: 4,
    ink: 7,
  });

  if (H.page.image) {
    for (const ph of phrases) {
      for (const w of ph) {
        const bb = H.bboxOf([w]);

        drawingContext.shadowColor = 'rgba(248, 244, 234, 1)';
        drawingContext.shadowBlur = 28;

        noStroke();
        fill(248, 244, 234);
        for (let i = 0; i < 5; i++) {
          rect(bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
        }

        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';

        H.draw.word(w);
      }
    }
  }
}

function drawGraphRoots(opts = {}) {
  const N = opts.count ?? 120;
  const seed = opts.seed ?? 1;
  const minDist = opts.minDist ?? 80;
  const penalize = opts.penalize ?? true;
  const tension = opts.tension ?? 0.5;
  const samples = opts.samples ?? 10;
  const ribbon = opts.ribbon ?? 4;
  const ink = opts.ink ?? 7;
  const ribbonC = opts.ribbonColor ?? [252, 250, 244];
  const inkC = opts.inkColor ?? [20, 16, 14];

  if (!H.graph || !H.graph.nodes || !H.graph.nodes.size) return;

  const body = H.page.body || {
    x0: 0,
    y0: 0,
    x1: H.page.width,
    y1: H.page.height,
  };
  const graph = penalize ? H.river.penalizeBorders(40, 25) : H.graph;

  const nodeIds = [...graph.nodes.keys()];
  const rng = H.random(seed);

  const inBody = (n) =>
    n && n.x >= body.x0 && n.x <= body.x1 && n.y >= body.y0 && n.y <= body.y1;
  const pool = nodeIds.filter((id) => inBody(graph.nodes.get(id)));
  if (pool.length < 2) return;

  const paths = [];
  let attempts = 0;
  while (paths.length < N && attempts < N * 8) {
    attempts++;
    const a = pool[Math.floor(rng() * pool.length)];
    const b = pool[Math.floor(rng() * pool.length)];
    if (a === b) continue;
    const na = graph.nodes.get(a);
    const nb = graph.nodes.get(b);
    if (!na || !nb) continue;
    if (Math.hypot(na.x - nb.x, na.y - nb.y) < minDist) continue;

    const { nodeIds: ids } = H.river.dijkstra(graph, a, b);
    if (!ids || ids.length < 2) continue;

    const pts = ids
      .map((id) => graph.nodes.get(id))
      .filter((n) => !!n)
      .map((n) => ({ x: n.x, y: n.y }));
    if (pts.length >= 2) paths.push(pts);
  }

  const smoothed = paths.map((p) =>
    p.length >= 3 ? H.geom.catmullRom(p, tension, samples) : p,
  );

  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  stroke(inkC[0], inkC[1], inkC[2]);
  strokeWeight(ink);
  for (const path of smoothed) drawPolyline(path);

  stroke(ribbonC[0], ribbonC[1], ribbonC[2]);
  strokeWeight(ribbon);
  for (const path of smoothed) drawPolyline(path);
}

function drawPolyline(pts) {
  if (pts.length < 2) return;
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape();
}

function drawBrushLayer(opts = {}) {
  const region =
    opts.region ??
    (H.page.body || { x0: 0, y0: 0, x1: H.page.width, y1: H.page.height });

  const seed = opts.seed ?? SEED;

  const fuzzSamples = opts.fuzzSamples ?? 360;
  const fuzzAmp = opts.fuzzAmp ?? 20 + (SEED % 23);
  const fuzzScale = opts.fuzzScale ?? 0.008 + (SEED % 7) * 0.001;

  const rngZone = H.random(SEED + 3);
  const jitterPos = 0.12;
  const jitterAngle = 0.9;

  const baseZones = [
    { x: 0.3, y: 0.1, c: [62, 150, 158], spread: 0.42, angle: -0.4 },
    { x: 0.85, y: 0.18, c: [222, 198, 110], spread: 0.38, angle: 0.3 },
    { x: 0.55, y: 0.42, c: [212, 110, 62], spread: 0.52, angle: 0.0 },
    { x: 0.18, y: 0.58, c: [148, 60, 96], spread: 0.4, angle: 0.6 },
    { x: 0.3, y: 0.92, c: [50, 50, 110], spread: 0.42, angle: 0.7 },
    { x: 0.78, y: 0.85, c: [38, 40, 86], spread: 0.42, angle: -0.3 },
  ];

  const zones =
    opts.zones ??
    baseZones.map((z) => ({
      ...z,
      x: Math.max(
        0.05,
        Math.min(0.95, z.x + (rngZone() - 0.5) * jitterPos * 2),
      ),
      y: Math.max(
        0.05,
        Math.min(0.95, z.y + (rngZone() - 0.5) * jitterPos * 2),
      ),
      spread: Math.max(
        0.25,
        Math.min(0.65, z.spread + (rngZone() - 0.5) * 0.15),
      ),
      angle: z.angle + (rngZone() - 0.5) * jitterAngle,
      c: z.c.map((ch) =>
        Math.round(constrain(ch + (rngZone() - 0.5) * 40, 0, 255)),
      ),
    }));

  const rngCounts = H.random(SEED + 9);
  const vary = (base, pct = 0.2) =>
    Math.round(base * (1 + (rngCounts() - 0.5) * pct * 2));

  const colorN = opts.colorStrokesPerZone ?? vary(280);
  const cMinLen = opts.colorMinLen ?? 20 + Math.round(rngCounts() * 15);
  const cMaxLen = opts.colorMaxLen ?? 160 + Math.round(rngCounts() * 80);
  const cMinW = opts.colorMinWidth ?? 5 + Math.round(rngCounts() * 4);
  const cMaxW = opts.colorMaxWidth ?? 24 + Math.round(rngCounts() * 16);
  const cAlpha = opts.colorAlpha ?? 100 + Math.round(rngCounts() * 50);
  const cJit = opts.colorJitter ?? 18 + Math.round(rngCounts() * 18);

  const blackN = opts.blackCount ?? vary(4000);
  const bMinLen = opts.blackMinLen ?? 6 + Math.round(rngCounts() * 6);
  const bMaxLen = opts.blackMaxLen ?? 30 + Math.round(rngCounts() * 20);
  const bWidth = opts.blackWidth ?? 1.0 + rngCounts() * 0.8;
  const bAlpha = opts.blackAlpha ?? 90 + Math.round(rngCounts() * 40);
  const bNoiseSc = opts.blackNoiseScale ?? 0.003 + rngCounts() * 0.004;

  const rng = H.random(seed);
  const grain = H.noise2D(seed + 100);
  const fuzz = H.noise2D(seed + 77);

  const bw = region.x1 - region.x0;
  const bh = region.y1 - region.y0;
  const minDim = Math.min(bw, bh);
  const cx = region.x0 + bw / 2;
  const cy = region.y0 + bh / 2;

  function perimeterPoint(t) {
    const perim = 2 * (bw + bh);
    const d = t * perim;
    let px, py, nx, ny;
    if (d < bw) {
      px = region.x0 + d;
      py = region.y0;
      nx = 0;
      ny = -1;
    } else if (d < bw + bh) {
      px = region.x1;
      py = region.y0 + (d - bw);
      nx = 1;
      ny = 0;
    } else if (d < 2 * bw + bh) {
      px = region.x1 - (d - bw - bh);
      py = region.y1;
      nx = 0;
      ny = 1;
    } else {
      px = region.x0;
      py = region.y1 - (d - 2 * bw - bh);
      nx = -1;
      ny = 0;
    }
    const disp = (fuzz(px * fuzzScale, py * fuzzScale) - 0.5) * 2 * fuzzAmp;
    return { x: px + nx * disp, y: py + ny * disp };
  }

  drawingContext.save();
  drawingContext.beginPath();
  const p0 = perimeterPoint(0);
  drawingContext.moveTo(p0.x, p0.y);
  for (let i = 1; i <= fuzzSamples; i++) {
    const pt = perimeterPoint(i / fuzzSamples);
    drawingContext.lineTo(pt.x, pt.y);
  }
  drawingContext.closePath();
  drawingContext.clip();

  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  blendMode(MULTIPLY);
  for (const zone of zones) {
    const zx = region.x0 + zone.x * bw;
    const zy = region.y0 + zone.y * bh;
    const spread = (zone.spread ?? 0.4) * minDim;
    const baseAngle = zone.angle ?? rng() * Math.PI * 2;

    for (let i = 0; i < colorN; i++) {
      const r = spread * Math.pow(rng(), 0.55);
      const theta = rng() * Math.PI * 2;
      const x0 = zx + Math.cos(theta) * r;
      const y0 = zy + Math.sin(theta) * r;

      const angle = baseAngle + (rng() - 0.5) * 0.9;
      const length = cMinLen + rng() * (cMaxLen - cMinLen);
      const width = cMinW + rng() * (cMaxW - cMinW);
      const a = cAlpha * (0.55 + rng() * 0.55);

      const x1 = x0 + Math.cos(angle) * length;
      const y1 = y0 + Math.sin(angle) * length;
      const perp = angle + Math.PI / 2;
      const wob = (rng() - 0.5) * length * 0.28;
      const mx = (x0 + x1) / 2 + Math.cos(perp) * wob;
      const my = (y0 + y1) / 2 + Math.sin(perp) * wob;

      const cr = constrain(zone.c[0] + (rng() - 0.5) * cJit, 0, 255);
      const cg = constrain(zone.c[1] + (rng() - 0.5) * cJit, 0, 255);
      const cb = constrain(zone.c[2] + (rng() - 0.5) * cJit, 0, 255);

      stroke(cr, cg, cb, a);
      strokeWeight(width);
      beginShape();
      curveVertex(x0, y0);
      curveVertex(x0, y0);
      curveVertex(mx, my);
      curveVertex(x1, y1);
      curveVertex(x1, y1);
      endShape();
    }
  }

  blendMode(MULTIPLY);
  for (let i = 0; i < blackN; i++) {
    const x0 = region.x0 + rng() * bw;
    const y0 = region.y0 + rng() * bh;
    const angle = grain(x0 * bNoiseSc, y0 * bNoiseSc) * Math.PI * 2;
    const length = bMinLen + rng() * (bMaxLen - bMinLen);
    const x1 = x0 + Math.cos(angle) * length;
    const y1 = y0 + Math.sin(angle) * length;
    const perp = angle + Math.PI / 2;
    const wob = (rng() - 0.5) * length * 0.18;
    const mx = (x0 + x1) / 2 + Math.cos(perp) * wob;
    const my = (y0 + y1) / 2 + Math.sin(perp) * wob;

    stroke(20, 16, 14, bAlpha * (0.5 + rng() * 0.7));
    strokeWeight(bWidth + (rng() - 0.5) * 0.6);
    beginShape();
    curveVertex(x0, y0);
    curveVertex(x0, y0);
    curveVertex(mx, my);
    curveVertex(x1, y1);
    curveVertex(x1, y1);
    endShape();
  }

  blendMode(BLEND);
  drawingContext.restore();
}
`;
