export const balloons = `// Black-out the page; render selected phrases as white balloons.
function setup() {
  createCanvas(H.page.width, H.page.height);
  background(20, 16, 14);

  const phrases = H.selectChunks({ nSeeds: 5, minLineDist: 2, seed: 13 });
  fill(245);
  noStroke();
  for (const ph of phrases) {
    H.draw.balloon(ph, { pad: 6, wobble: 0.2, samples: 40, seed: ph[0].id });
  }
  if (H.page.image) {
    for (const ph of phrases) for (const w of ph) H.draw.word(w);
  }
  noLoop();
}
function draw() {}
`;
