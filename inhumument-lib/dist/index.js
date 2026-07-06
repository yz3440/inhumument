// src/index.ts
import {
  Humument as Base
} from "humument";

// src/draw.ts
function target(g) {
  if (g) return g;
  if (typeof window !== "undefined") return window;
  throw new Error("No p5 instance provided and no window global available");
}
function drawBalloon(H, words, opts = {}, pInst) {
  if (!words.length) return;
  const g = target(pInst);
  const pts = H.geom.balloon(H.bboxOf(words), opts);
  g.beginShape();
  g.curveVertex(pts[pts.length - 1].x, pts[pts.length - 1].y);
  for (const pt of pts) g.curveVertex(pt.x, pt.y);
  g.curveVertex(pts[0].x, pts[0].y);
  g.curveVertex(pts[1].x, pts[1].y);
  g.endShape(g.CLOSE);
}
function drawRiver(H, segment, opts = {}, pInst) {
  if (!segment || segment.points.length < 2) return;
  const g = target(pInst);
  const ring = H.geom.channel(segment, opts);
  if (!ring.length) return;
  g.beginShape();
  for (const pt of ring) g.vertex(pt.x, pt.y);
  g.endShape(g.CLOSE);
}
function drawWord(pageImage, word, pInst) {
  const g = target(pInst);
  const w = word.x1 - word.x0;
  const h = word.y1 - word.y0;
  if (w <= 0 || h <= 0) return;
  g.image(pageImage, word.x0, word.y0, w, h, word.x0, word.y0, w, h);
}
function drawImage(pageImage, pInst) {
  const g = target(pInst);
  g.image(pageImage, 0, 0);
}

// src/index.ts
export * from "humument";
async function load(opts) {
  const base = await Base.load(opts);
  const inst = base;
  inst.page.image = null;
  inst.draw = {
    balloon: (words, o, p) => drawBalloon(inst, words, o, p),
    river: (seg, o, p) => drawRiver(inst, seg, o, p),
    word: (w, p) => {
      if (inst.page.image) drawWord(inst.page.image, w, p);
    },
    image: (p) => {
      if (inst.page.image) drawImage(inst.page.image, p);
    }
  };
  return inst;
}
var Humument = {
  ...Base,
  load
};
export {
  Humument,
  drawBalloon,
  drawImage,
  drawRiver,
  drawWord
};
//# sourceMappingURL=index.js.map