export const selection = `// Click words in the Select tab to populate SELECTION (the pending group).
// Press G to commit it as a saved group in GROUPS, then click more.
// Each group draws as a balloon in a different colour.
function setup() {
  createCanvas(H.page.width, H.page.height);
  if (H.page.image) image(H.page.image, 0, 0);

  const palette = [
    [232, 132, 88],   // group 0
    [88, 196, 132],   // group 1
    [156, 124, 220],  // group 2
    [232, 196, 88],   // group 3
  ];

  // SELECTION and GROUPS are injected by the editor as a read-only header.
  // GROUPS holds saved groups; SELECTION is the pending one.
  const all = [
    ...GROUPS,
    ...(SELECTION.length ? [SELECTION] : []),
  ];

  for (let i = 0; i < all.length; i++) {
    const [r, g, b] = palette[i % palette.length];
    fill(r, g, b, 200);
    stroke(20);
    H.draw.balloon(all[i], { wobble: 0.2, pad: 4 });
  }
  noLoop();
}
function draw() {}
`;
