export const river = `// Just the rivers — a Dijkstra path through the whitespace gutters
// connecting four chunks, drawn as a wavy black ribbon over the page.
function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);

  const phrases = H.selectChunks({ nSeeds: 4, minLineDist: 3, seed: 99 });
  noStroke();
  fill(20, 16, 14);
  for (let i = 0; i < phrases.length - 1; i++) {
    const a = phrases[i][phrases[i].length - 1];
    const b = phrases[i + 1][0];
    const seg = H.river.between(a, b);
    if (seg) H.draw.river(seg, { halfWidth: 5, meander: 0.7, jitter: 1.6, seed: i * 7 });
  }
  noLoop();
}
function draw() {}
`;
