// Generates a clean isometric 3x3 cube as inline SVG for the "how to hold" card:
// RED top, WHITE front-left, GREEN right. Pure geometry; print to stdout.
const ax = [30, 17];   // +x screen step (right-down)
const ay = [-30, 17];  // +y screen step (left-down)
const az = [0, -34];   // +z screen step (up)
const P = (x, y, z) => [x * ax[0] + y * ay[0] + z * az[0], x * ax[1] + y * ay[1] + z * az[1]];

const faces = [
  // [fixedAxis, fixedVal, varA, varB, fill, shade] — shade darkens for depth
  { name: 'top', fill: '#f0473d', build: (i, j) => [P(i, j, 3), P(i + 1, j, 3), P(i + 1, j + 1, 3), P(i, j + 1, 3)] },
  { name: 'left', fill: '#e9edf6', build: (i, k) => [P(i, 3, k), P(i + 1, 3, k), P(i + 1, 3, k + 1), P(i, 3, k + 1)] },
  { name: 'right', fill: '#1fae54', build: (j, k) => [P(3, j, k), P(3, j + 1, k), P(3, j + 1, k + 1), P(3, j, k + 1)] },
];

const polys = [];
let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
for (const f of faces) {
  for (let a = 2; a >= 0; a--) for (let b = 2; b >= 0; b--) {
    const pts = f.build(a, b);
    for (const [px, py] of pts) { minX = Math.min(minX, px); minY = Math.min(minY, py); maxX = Math.max(maxX, px); maxY = Math.max(maxY, py); }
    polys.push({ fill: f.fill, pts });
  }
}
const pad = 10;
const w = Math.round(maxX - minX + pad * 2);
const h = Math.round(maxY - minY + pad * 2);
const fmt = (pts) => pts.map(([x, y]) => `${(x - minX + pad).toFixed(1)},${(y - minY + pad).toFixed(1)}`).join(' ');

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Isometric cube: red on top, white facing front, green on the right.">\n`;
for (const p of polys) {
  svg += `  <polygon points="${fmt(p.pts)}" fill="${p.fill}" stroke="#0c1018" stroke-width="2.4" stroke-linejoin="round"/>\n`;
}
svg += `</svg>`;
process.stdout.write(svg + '\n');
