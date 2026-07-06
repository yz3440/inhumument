export const rectangles = `// Outline every word's bbox, colour-coded by part of speech.
const COLOR = {
  NOUN: [220, 60, 60], PROPN: [220, 60, 60],
  VERB: [60, 160, 220],
  ADJ: [220, 160, 60], ADV: [220, 160, 60],
  DET: [120, 120, 120], PRON: [120, 120, 120],
  ADP: [180, 80, 200],
};

function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);
  noFill();
  strokeWeight(1);
  for (const w of H.words) {
    const c = COLOR[w.pos] ?? [80, 80, 80];
    stroke(c[0], c[1], c[2], 220);
    rect(w.x0, w.y0, w.x1 - w.x0, w.y1 - w.y0);
  }
  noLoop();
}
function draw() {}
`;
