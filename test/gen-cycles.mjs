// Extract the sticker 4-cycles from the verified swap-based moves in js/cube.js
// so the OO Cube can drive moves from DATA instead of a wall of manual swaps.
// A block `t = A; A = B; B = C; C = D; D = t;` is the cycle [A,B,C,D]
// (A<-B, B<-C, C<-D, D<-old A). Prints MOVE_CYCLES as a JS literal. One-time tool.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'js/cube.js'), 'utf8');

function body(name) {
  const start = src.indexOf(`function ${name}()`);
  let i = src.indexOf('{', start), depth = 0, open = i;
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}' && --depth === 0) break; }
  return src.slice(open + 1, i);
}

const STICKER = /^([rwoybg])\[(\d)\]$/;
function cycles(name) {
  const out = [];
  let cur = null;
  for (let stmt of body(name).split(';')) {
    stmt = stmt.trim();
    if (!stmt) continue;
    const m = stmt.match(/^(?:let\s+)?(.+?)\s*=\s*(.+)$/);
    if (!m) continue;
    const lhs = m[1].trim(), rhs = m[2].trim();
    if (lhs === 't') { cur = []; continue; }       // `t = A` opens a cycle
    if (cur === null) continue;                     // ignore non-cycle statements (e.g. R(), this.log)
    const ls = lhs.match(STICKER);
    if (!ls) { cur = null; continue; }
    cur.push(ls[1] + ls[2]);                         // push this LHS position
    if (rhs === 't') { out.push(cur); cur = null; }  // `D = t` closes the cycle
  }
  return out;
}

const MOVE = {};
for (const n of ['F', 'B', 'R', 'L', 'U', 'D']) MOVE[n] = cycles(n);
MOVE.X_CENTERS = cycles('X'); // X = R + Ls + these centre cycles
MOVE.Y_CENTERS = cycles('Y'); // Y = U + Ds + these centre cycles

const fmtCyc = (c) => `[${c.map((p) => `'${p}'`).join(', ')}]`;
let s = 'const MOVE_CYCLES = {\n';
for (const [k, cs] of Object.entries(MOVE)) {
  s += `  ${k}: [${cs.map(fmtCyc).join(', ')}],\n`;
}
s += '};\n';
process.stderr.write('cycle counts: ' + Object.entries(MOVE).map(([k, v]) => `${k}=${v.length}`).join(' ') + '\n');
process.stdout.write(s);
