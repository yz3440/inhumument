export const hello = `// Simplest possible — paint the page, write the first line.
function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);
  fill(220, 60, 60);
  noStroke();
  for (const w of H.lines[0] ?? []) {
    rect(w.x0, w.y0, w.x1 - w.x0, w.y1 - w.y0);
  }
  noLoop();
}
function draw() {}
`;
