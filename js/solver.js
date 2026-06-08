'use strict';

/* =============================================================================
 * The solver. Operates on a Cube instance: walks the lookup tables in tables.js,
 * runs the brute force over all insertion orderings × the 6 cube orientations,
 * and keeps the shortest move sequence. Pure string helpers (compress/transform)
 * have no cube state. Depends on cube.js, predicates.js, tables.js.
 * ========================================================================== */

// Shared result state, read by the page + test harness — kept as `var`/function
// globals on purpose so they are reachable by name from the page and the sandbox.
var minimum = '';   // best (shortest) solution found
var col = '';       // name of the winning starting-cross colour
var Invalid = false;// set when the input cannot be solved
var startT = 0;     // timeout clock origin (set when a solve begins)
const maxTime = 800;        // ms budget; a longer search means an invalid configuration
const SOLUTION_CAP = 200;   // unreachable upper bound on solution length (sentinel)

// ---- Move-sequence compression (pure) ---------------------------------------
// compress: 3 identical turns in a row -> one prime (lowercase), 4 -> nothing.
function compress(seq) {
  let out = '';
  for (let i = 0; i < seq.length; i++) {
    if (i + 2 < seq.length && seq[i] === seq[i + 1] && seq[i] === seq[i + 2]) {
      if (seq[i] !== seq[i + 3]) { out += seq[i].toLowerCase(); i += 2; }
      else { i += 3; }
    } else {
      out += seq[i];
    }
  }
  return out;
}
// recompress: expand primes back to triples and compress() until length stabilises.
function recompress(seq) {
  let prev = '';
  while (prev !== seq) {
    prev = seq;
    let expanded = '';
    for (let i = 0; i < seq.length; i++) {
      const c = seq[i];
      expanded += c > 'a' ? c.toUpperCase().repeat(3) : c;
    }
    seq = compress(expanded);
  }
  return seq;
}
// transform: resolve whole-cube rotations recorded as X/Y. Walking from the end,
// every X (or Y) relabels all following face turns, then the markers are stripped.
function transform(seq) {
  const X_MAP = { U: 'F', D: 'B', F: 'D', B: 'U', u: 'f', d: 'b', f: 'd', b: 'u' };
  const Y_MAP = { R: 'B', L: 'F', F: 'R', B: 'L', r: 'b', l: 'f', f: 'r', b: 'l' };
  const ch = seq.split('');
  for (let i = ch.length - 1; i >= 0; i--) {
    const map = ch[i] === 'X' ? X_MAP : ch[i] === 'Y' ? Y_MAP : null;
    if (!map) continue;
    for (let j = i + 1; j < ch.length; j++) if (map[ch[j]]) ch[j] = map[ch[j]];
  }
  let result = ch.filter((c) => c !== 'X' && c !== 'Y').join('');
  if (result.length < 90) result = recompress(result);
  return result;
}
// The n-th permutation of {0,1,2,3} (Lehmer code), as a 4-element array; solve()
// sweeps n = 0..23 to try every insertion ordering.
function permutation(n) {
  const digits = [0, 0, 0, 0];
  const used = [0, 0, 0, 0];
  let i = 1;
  while (n > 0) { i++; digits[i - 1] = n % i; n = n / i; }
  const perm = [];
  for (i = 3; i >= 0; i--) {
    let k = digits[i];
    let j = 0;
    while (k >= 0) { if (used[j] === 0) { k--; j++; } else { j++; } }
    j--;
    perm.push(j);
    used[j] = 1;
  }
  return perm;
}

// ---- Pattern matching against the lookup tables -----------------------------
// Compile a `when` (one clause string, or an array of clause strings ANDed) into
// nested [faceLetter, index, colour] tuples. The letter is resolved against the
// live cube at match time, so a compiled table works for any Cube instance.
function compileWhen(when) {
  const clauses = typeof when === 'string' ? [when] : when;
  return clauses.map((clause) =>
    clause.split('|').map((conj) =>
      conj.trim().split(/\s+/).map((term) => {
        const eq = term.indexOf('=');
        return [term[0], Number(term.slice(1, eq)), term.slice(eq + 1)];
      })));
}
function whenMatches(compiled, cube) {
  for (const clause of compiled) {
    let ok = false;
    for (const conj of clause) {
      let all = true;
      for (const [letter, idx, colour] of conj) if (cube.faces[letter][idx] !== colour) { all = false; break; }
      if (all) { ok = true; break; }
    }
    if (!ok) return false;
  }
  return true;
}

// Compile the tables once at load (face letters are instance-independent).
for (const branch of WHITE_CROSS) {
  branch.solved = compileWhen(branch.solved);
  for (const c of branch.cases) c.when = compileWhen(c.when);
}
for (const pair of SECOND_LAYER) {
  for (const stage of pair.stages) for (const c of stage.cases) c.when = compileWhen(c.when);
}

// Insert one white-cross edge (n = which of the 4). No-op if already placed;
// otherwise play the first matching rule.
function goWC(cube, n) {
  const branch = WHITE_CROSS[n];
  if (!branch || whenMatches(branch.solved, cube)) return;
  for (const c of branch.cases) {
    if (whenMatches(c.when, cube)) { cube.applyMoves(c.do); return; }
  }
}

// Insert one second-layer pair (n = which of the 4). No-op if already placed.
// Run the phases in order; the first matching rule in a phase fires, then we
// advance to the next phase — unless that rule is `end` (the pair is finished).
// Earlier phases deliberately fall through so a later one re-reads the cube.
function goL2(cube, n) {
  const pair = SECOND_LAYER[n];
  if (!pair || cube[pair.guard]()) return;
  for (const stage of pair.stages) {
    for (const c of stage.cases) {
      if (whenMatches(c.when, cube)) { cube.applyMoves(c.do); if (c.end) return; break; }
    }
  }
}

// ---- Re-orientation ---------------------------------------------------------
// Cycle the four colours of `order` on every sticker (C[k] -> C[k+1]), then turn
// the whole cube, so a different colour becomes the starting cross.
function cycleColors(cube, order) {
  const next = {};
  for (let i = 0; i < order.length; i++) next[order[i]] = order[(i + 1) % order.length];
  for (const face of Object.values(cube.faces)) {
    for (let i = 1; i <= 9; i++) if (next[face[i]] !== undefined) face[i] = next[face[i]];
  }
}
function Ocenter(cube) { cycleColors(cube, ['W', 'R', 'Y', 'O']); cube.X(); }
function Ycenter(cube) { Ocenter(cube); Ocenter(cube); }
function Rcenter(cube) { Ocenter(cube); Ocenter(cube); Ocenter(cube); }
function Gcenter(cube) { cycleColors(cube, ['W', 'B', 'Y', 'G']); cube.Y(); }
function Bcenter(cube) { Gcenter(cube); Gcenter(cube); Gcenter(cube); }

// ---- The brute-force solver -------------------------------------------------
// Recurring last-layer algorithms (each cycles three last-layer pieces), named
// by the face they target and the variant.
const LL = {
  R1: 'UBBubUbudBBDBdBD', R2: 'dbDbdBBDUBuBUBBu',
  B1: 'LBBlbLblrBBRBrBR', B2: 'rbRbrBBRLBlBLBBl',
  O1: 'DBBdbDbduBBUBuBU', O2: 'ubUbuBBUDBdBDBBd',
  G1: 'RBBrbRbrlBBLBlBL', G2: 'lbLblBBLRBrBRBBr',
};

function timedOut() { return new Date().getTime() - startT > maxTime; }
function abortInvalid(cube, inputBackup) {
  cube.restore(inputBackup);
  notify("That cube can't be solved — check the colours", 'error');
  Invalid = true;
}

// Try every ordering of the 4 white-cross edge insertions and the 4 second-layer
// pair insertions, solving fully each time and keeping the shortest in `minimum`.
function solve(cube, inputBackup) {
  const { r, w, o, y, b, g } = cube.faces; // stable refs (restore mutates in place)
  BRsolve: {
    while (minimum.length < SOLUTION_CAP) minimum += 'a';
    const start = cube.snapshot();

    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j <= 23; j++) {
        cube.log = '';
        cube.restore(start);

        const crossOrder = permutation(i); // order to insert the 4 white-cross edges
        const pairOrder = permutation(j);  // order to insert the 4 second-layer pairs

        // 1. White cross
        while (cube.check_white_cross() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          goWC(cube, crossOrder[0]); goWC(cube, crossOrder[1]); goWC(cube, crossOrder[2]); goWC(cube, crossOrder[3]);
        }

        // 2. First two layers
        while (cube.check_layer2() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          goL2(cube, pairOrder[0]); goL2(cube, pairOrder[1]); goL2(cube, pairOrder[2]); goL2(cube, pairOrder[3]);
        }

        // 3. Yellow cross
        while (cube.check_yellow_cross() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          if ((y[8] === 'Y' && y[6] === 'Y' && y[2] !== 'Y' && y[4] !== 'Y') || (y[2] !== 'Y' && y[4] !== 'Y' && y[6] !== 'Y' && y[8] !== 'Y') || (y[4] === 'Y' && y[6] === 'Y' && y[2] !== 'Y' && y[8] !== 'Y')) cube.applyMoves('URBrbu');
          else if ((y[8] === 'Y' && y[4] === 'Y' && y[2] !== 'Y' && y[6] !== 'Y') || (y[2] === 'Y' && y[8] === 'Y' && y[4] !== 'Y' && y[6] !== 'Y')) cube.applyMoves('LUBubl');
          else if (y[4] === 'Y' && y[2] === 'Y' && y[8] !== 'Y' && y[6] !== 'Y') cube.applyMoves('DLBlbd');
          else if (y[6] === 'Y' && y[2] === 'Y' && y[4] !== 'Y' && y[8] !== 'Y') cube.applyMoves('RDBdbr');
        }

        // 4. Orient the yellow cross edges (permute via B until two are aligned)
        while (cube.check_ORyellow_cross() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          while (!((r[8] === 'R' && b[8] === 'B') || (r[8] === 'R' && g[8] === 'G') || (r[8] === 'R' && o[8] === 'O') || (b[8] === 'B' && g[8] === 'G') || (b[8] === 'B' && o[8] === 'O') || (g[8] === 'G' && o[8] === 'O'))) cube.B();
          if (g[8] === 'G' && o[8] === 'O') cube.applyMoves('UBBubUbub');
          else if (b[8] === 'B' && o[8] === 'O') cube.applyMoves('RBBrbRbrb');
          else if (b[8] === 'B' && g[8] === 'G') cube.applyMoves('UBBubUbubLBBlbLblb');
          else if (r[8] === 'R' && o[8] === 'O') cube.applyMoves('LBBlbLblbDBBdbDbdb');
          else if (r[8] === 'R' && g[8] === 'G') cube.applyMoves('LBBlbLblb');
          else if (r[8] === 'R' && b[8] === 'B') cube.applyMoves('DBBdbDbdb');
        }

        // 5. Position the last-layer corners
        while (cube.check_corner() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          if (cube.rby()) {
            if ((r[9] === 'B' && g[7] === 'Y' && y[9] === 'O') || (r[9] === 'O' && g[7] === 'B' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'O' && y[9] === 'B')) cube.applyMoves('dBUbDBub');
            else cube.applyMoves('BUbdBubD');
          } else if (cube.oby()) {
            if ((r[9] === 'R' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'R' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'B' && y[9] === 'R')) cube.applyMoves('rBLbRBlb');
            else cube.applyMoves('BLbrBlbR');
          } else if (cube.ogy()) {
            if ((r[9] === 'R' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'R' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'B' && y[9] === 'R')) cube.applyMoves('uBDbUBdb');
            else cube.applyMoves('BDbuBdbU');
          } else {
            // The first disjunct intentionally reads r[1]/b[7]/y[7] (not the r[9]/g[7]/y[9]
            // family of the sibling branches) — faithful to the original last-corner case.
            if ((r[1] === 'Y' && b[7] === 'B' && y[7] === 'O') || (r[9] === 'O' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'O' && y[9] === 'Y')) cube.applyMoves('lBRbLBrb');
            else cube.applyMoves('BRblBrbL');
          }
        }

        // 6. Orient the last-layer corners (cycle three pieces at a time)
        while (cube.check_if_solved() === 0) {
          if (timedOut()) { abortInvalid(cube, inputBackup); break BRsolve; }
          // two adjacent pieces flipped
          if (y[1] === 'Y' && y[3] === 'Y') cube.applyMoves(r[7] === 'Y' && r[9] === 'Y' ? LL.R1 : LL.R2);
          else if (y[3] === 'Y' && y[9] === 'Y') cube.applyMoves(b[7] === 'Y' && b[9] === 'Y' ? LL.B1 : LL.B2);
          else if (y[7] === 'Y' && y[9] === 'Y') cube.applyMoves(o[7] === 'Y' && o[9] === 'Y' ? LL.O1 : LL.O2);
          else if (y[1] === 'Y' && y[7] === 'Y') cube.applyMoves(g[7] === 'Y' && g[9] === 'Y' ? LL.G1 : LL.G2);
          // two diagonal pieces
          else if (y[1] === 'Y' && y[9] === 'Y') cube.applyMoves(r[7] === 'Y' && g[9] === 'Y' ? LL.R1 + LL.G1 : LL.R2 + LL.G2);
          else if (y[3] === 'Y' && y[7] === 'Y') cube.applyMoves(g[7] === 'Y' && o[7] === 'Y' ? LL.G1 + LL.O1 : LL.G2 + LL.O2);
          // three correct on top
          else if (y[1] === 'Y') cube.applyMoves(r[7] === 'Y' && g[7] === 'G' && o[9] === 'Y' ? LL.R1 + LL.G2 : LL.R2 + LL.G1);
          else if (y[3] === 'Y') cube.applyMoves(b[9] === 'Y' && r[7] === 'Y' && g[7] === 'Y' ? LL.B1 + LL.R2 : LL.B2 + LL.R1);
          else if (y[7] === 'Y') cube.applyMoves(g[7] === 'Y' && o[9] === 'Y' && b[9] === 'Y' ? LL.G1 + LL.O2 : LL.G2 + LL.O1);
          else if (y[9] === 'Y') cube.applyMoves(r[7] === 'Y' && b[9] === 'Y' && o[9] === 'Y' ? LL.O1 + LL.B2 : LL.O2 + LL.B1);
          // all four mis-oriented
          else if (r[7] === 'Y' && r[9] === 'Y') cube.applyMoves(LL.R1);
          else if (b[7] === 'Y' && g[7] === 'Y') cube.applyMoves(LL.R2);
          else if (b[7] === 'Y' && b[9] === 'Y') cube.applyMoves(LL.B1);
          else if (b[7] === 'R' && b[9] === 'O') cube.applyMoves(LL.B2);
          else if (o[7] === 'Y' && o[9] === 'Y') cube.applyMoves(LL.O1);
          else if (o[7] === 'B' && o[9] === 'G') cube.applyMoves(LL.O2);
          else if (g[7] === 'Y' && g[9] === 'Y') cube.applyMoves(LL.G1);
          else if (g[7] === 'R' && g[9] === 'O') cube.applyMoves(LL.G2);
        }

        const result = compress(cube.log);
        if (minimum.length > result.length) minimum = result;
      }
    }
  }
}

// The 6 cube orientations to solve from; the shortest wins. Each (except white)
// re-centres the cube, prepends the rotation markers, then transform() rewrites
// the moves back into the original frame.
const ORIENTATIONS = [
  { recenter: null, prefix: '', color: 1, name: 'WHITE' },
  { recenter: Ocenter, prefix: 'X', color: 2, name: 'ORANGE' },
  { recenter: Ycenter, prefix: 'XX', color: 3, name: 'YELLOW' },
  { recenter: Rcenter, prefix: 'XXX', color: 4, name: 'RED' },
  { recenter: Gcenter, prefix: 'Y', color: 5, name: 'GREEN' },
  { recenter: Bcenter, prefix: 'YYY', color: 6, name: 'BLUE' },
];

// Solve `cube` from its current state; on success sets `minimum` (the solution)
// and `col` (the winning cross colour). `s` is the validated 54-char input string.
function All_Face_solve(cube, s) {
  startT = new Date().getTime();
  if (!Cube.hasValidColorCounts(s)) { notify('Fill in all 54 stickers (9 of each colour) first', 'error'); return; }
  const inputBackup = cube.snapshot();
  let winningColor = 1;

  // First orientation (white): solve and seed the best result.
  solve(cube, inputBackup);
  if (Invalid === true) return;
  minimum = recompress(minimum);
  let best = minimum;

  // Remaining orientations: re-centre, solve, translate back, keep the shortest.
  for (let k = 1; k < ORIENTATIONS.length; k++) {
    const orient = ORIENTATIONS[k];
    cube.restore(inputBackup);
    orient.recenter(cube);
    solve(cube, inputBackup);
    minimum = recompress(transform(orient.prefix + minimum));
    if (best.length > minimum.length) { best = minimum; winningColor = orient.color; }
  }

  minimum = best;
  col = ORIENTATIONS.find((orient) => orient.color === winningColor).name;
}
