// =============================================================================
// The solver: it walks the lookup tables in tables.js, runs the brute force
// over all insertion orderings and the 6 cube orientations, and keeps the
// shortest move sequence. Depends on cube.js, predicates.js, and tables.js.
// =============================================================================
'use strict';

// ---- Pattern matching against the lookup tables -----------------------------
// Compile a `when` (a clause string, or an array of clause strings that must
// all hold) into nested [faceArray, index, colour] tuples for fast matching.
function compileWhen(when) {
  const clauses = typeof when === 'string' ? [when] : when;
  return clauses.map((clause) =>
    clause.split('|').map((conj) =>
      conj.trim().split(/\s+/).map((term) => {
        const eq = term.indexOf('=');
        return [FACES[term[0]], Number(term.slice(1, eq)), term.slice(eq + 1)];
      })));
}
function whenMatches(compiled) {
  for (const clause of compiled) {
    let ok = false;
    for (const conj of clause) {
      let all = true;
      for (const [face, idx, colour] of conj) if (face[idx] !== colour) { all = false; break; }
      if (all) { ok = true; break; }
    }
    if (!ok) return false;
  }
  return true;
}

// ---- Compile the tables once at load, then the two step solvers -------------
for (const branch of WHITE_CROSS) {
  branch.solved = compileWhen(branch.solved);
  for (const c of branch.cases) c.when = compileWhen(c.when);
}
for (const pair of SECOND_LAYER) {
  for (const stage of pair.stages) for (const c of stage.cases) c.when = compileWhen(c.when);
}
const F2L_GUARD = { f2l_rb, f2l_rg, f2l_go, f2l_bo };

// Insert one white-cross edge (n = which of the 4). No-op if already placed;
// otherwise play the first matching rule.
function goWC(n) {
  const branch = WHITE_CROSS[n];
  if (!branch || whenMatches(branch.solved)) return;
  for (const c of branch.cases) {
    if (whenMatches(c.when)) { applyMoves(c.do); return; }
  }
}

// Insert one second-layer pair (n = which of the 4). No-op if already placed.
// Run the phases in order; the first matching rule in a phase fires, then we
// advance to the next phase — unless that rule is `end` (the pair is finished).
// Earlier phases deliberately fall through so a later one re-reads the cube.
function goL2(n) {
  const pair = SECOND_LAYER[n];
  if (!pair || F2L_GUARD[pair.guard]()) return;
  for (const stage of pair.stages) {
    for (const c of stage.cases) {
      if (whenMatches(c.when)) { applyMoves(c.do); if (c.end) return; break; }
    }
  }
}

// ---- Re-orientation ---------------------------------------------------------
// Cycle the four colours of `order` on every sticker (C[k] -> C[k+1]). Used to
// relabel the cube so a different colour becomes the starting cross.
function cycleColors(order) {
  const next = {};
  for (let i = 0; i < order.length; i++) next[order[i]] = order[(i + 1) % order.length];
  for (const face of WORK) for (let i = 1; i <= 9; i++) if (next[face[i]] !== undefined) face[i] = next[face[i]];
}
function Ocenter() { cycleColors(['W', 'R', 'Y', 'O']); X(); }
function Ycenter() { Ocenter(); Ocenter(); }
function Rcenter() { Ocenter(); Ocenter(); Ocenter(); }
function Gcenter() { cycleColors(['W', 'B', 'Y', 'G']); Y(); }
function Bcenter() { Gcenter(); Gcenter(); Gcenter(); }

// ---- The brute-force solver -------------------------------------------------
// Recurring last-layer algorithms (each cycles three last-layer pieces). Named
// by the face they target and which of the two variants.
const LL = {
  R1: 'UBBubUbudBBDBdBD', R2: 'dbDbdBBDUBuBUBBu',
  B1: 'LBBlbLblrBBRBrBR', B2: 'rbRbrBBRLBlBLBBl',
  O1: 'DBBdbDbduBBUBuBU', O2: 'ubUbuBBUDBdBDBBd',
  G1: 'RBBrbRbrlBBLBlBL', G2: 'lbLblBBLRBrBRBBr',
};

function timedOut() { return new Date().getTime() - startT > maxTime; }
function abortInvalid() { copyState(WORK, INPUT_BACKUP); notify("That cube can't be solved — check the colours", 'error'); Invalid = true; }

// Try every ordering of the 4 white-cross edge insertions and the 4 second-layer
// pair insertions, solving fully each time and keeping the shortest in `minimum`.
function solve() {
  BRsolve: {
    while (minimum.length < SOLUTION_CAP) minimum += 'a';
    copyState(SOLVE_BACKUP, WORK);

    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j <= 23; j++) {
        original = '';
        final = '';
        copyState(WORK, SOLVE_BACKUP);

        const crossOrder = permutation(i); // order to insert the 4 white-cross edges
        const pairOrder = permutation(j);  // order to insert the 4 second-layer pairs

        // 1. White cross
        while (check_white_cross() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          goWC(crossOrder[0]); goWC(crossOrder[1]); goWC(crossOrder[2]); goWC(crossOrder[3]);
        }

        // 2. First two layers
        while (check_layer2() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          goL2(pairOrder[0]); goL2(pairOrder[1]); goL2(pairOrder[2]); goL2(pairOrder[3]);
        }

        // 3. Yellow cross
        while (check_yellow_cross() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          if ((y[8] === 'Y' && y[6] === 'Y' && y[2] !== 'Y' && y[4] !== 'Y') || (y[2] !== 'Y' && y[4] !== 'Y' && y[6] !== 'Y' && y[8] !== 'Y') || (y[4] === 'Y' && y[6] === 'Y' && y[2] !== 'Y' && y[8] !== 'Y')) applyMoves('URBrbu');
          else if ((y[8] === 'Y' && y[4] === 'Y' && y[2] !== 'Y' && y[6] !== 'Y') || (y[2] === 'Y' && y[8] === 'Y' && y[4] !== 'Y' && y[6] !== 'Y')) applyMoves('LUBubl');
          else if (y[4] === 'Y' && y[2] === 'Y' && y[8] !== 'Y' && y[6] !== 'Y') applyMoves('DLBlbd');
          else if (y[6] === 'Y' && y[2] === 'Y' && y[4] !== 'Y' && y[8] !== 'Y') applyMoves('RDBdbr');
        }

        // 4. Orient the yellow cross edges (permute via B until two are aligned)
        while (check_ORyellow_cross() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          while (!((r[8] === 'R' && b[8] === 'B') || (r[8] === 'R' && g[8] === 'G') || (r[8] === 'R' && o[8] === 'O') || (b[8] === 'B' && g[8] === 'G') || (b[8] === 'B' && o[8] === 'O') || (g[8] === 'G' && o[8] === 'O'))) B();
          if (g[8] === 'G' && o[8] === 'O') applyMoves('UBBubUbub');
          else if (b[8] === 'B' && o[8] === 'O') applyMoves('RBBrbRbrb');
          else if (b[8] === 'B' && g[8] === 'G') applyMoves('UBBubUbubLBBlbLblb');
          else if (r[8] === 'R' && o[8] === 'O') applyMoves('LBBlbLblbDBBdbDbdb');
          else if (r[8] === 'R' && g[8] === 'G') applyMoves('LBBlbLblb');
          else if (r[8] === 'R' && b[8] === 'B') applyMoves('DBBdbDbdb');
        }

        // 5. Position the last-layer corners
        while (check_corner() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          if (rby()) {
            if ((r[9] === 'B' && g[7] === 'Y' && y[9] === 'O') || (r[9] === 'O' && g[7] === 'B' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'O' && y[9] === 'B')) applyMoves('dBUbDBub');
            else applyMoves('BUbdBubD');
          } else if (oby()) {
            if ((r[9] === 'R' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'R' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'B' && y[9] === 'R')) applyMoves('rBLbRBlb');
            else applyMoves('BLbrBlbR');
          } else if (ogy()) {
            if ((r[9] === 'R' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'R' && y[9] === 'Y') || (r[9] === 'Y' && g[7] === 'B' && y[9] === 'R')) applyMoves('uBDbUBdb');
            else applyMoves('BDbuBdbU');
          } else {
            // The first disjunct intentionally reads r[1]/b[7]/y[7] (not the r[9]/g[7]/y[9]
            // family of the sibling branches) — faithful to the original last-corner case.
            if ((r[1] === 'Y' && b[7] === 'B' && y[7] === 'O') || (r[9] === 'O' && g[7] === 'Y' && y[9] === 'B') || (r[9] === 'B' && g[7] === 'O' && y[9] === 'Y')) applyMoves('lBRbLBrb');
            else applyMoves('BRblBrbL');
          }
        }

        // 6. Orient the last-layer corners (cycle three pieces at a time)
        while (check_if_solved() === 0) {
          if (timedOut()) { abortInvalid(); break BRsolve; }
          // two adjacent pieces flipped
          if (y[1] === 'Y' && y[3] === 'Y') applyMoves(r[7] === 'Y' && r[9] === 'Y' ? LL.R1 : LL.R2);
          else if (y[3] === 'Y' && y[9] === 'Y') applyMoves(b[7] === 'Y' && b[9] === 'Y' ? LL.B1 : LL.B2);
          else if (y[7] === 'Y' && y[9] === 'Y') applyMoves(o[7] === 'Y' && o[9] === 'Y' ? LL.O1 : LL.O2);
          else if (y[1] === 'Y' && y[7] === 'Y') applyMoves(g[7] === 'Y' && g[9] === 'Y' ? LL.G1 : LL.G2);
          // two diagonal pieces
          else if (y[1] === 'Y' && y[9] === 'Y') applyMoves(r[7] === 'Y' && g[9] === 'Y' ? LL.R1 + LL.G1 : LL.R2 + LL.G2);
          else if (y[3] === 'Y' && y[7] === 'Y') applyMoves(g[7] === 'Y' && o[7] === 'Y' ? LL.G1 + LL.O1 : LL.G2 + LL.O2);
          // three correct on top
          else if (y[1] === 'Y') applyMoves(r[7] === 'Y' && g[7] === 'G' && o[9] === 'Y' ? LL.R1 + LL.G2 : LL.R2 + LL.G1);
          else if (y[3] === 'Y') applyMoves(b[9] === 'Y' && r[7] === 'Y' && g[7] === 'Y' ? LL.B1 + LL.R2 : LL.B2 + LL.R1);
          else if (y[7] === 'Y') applyMoves(g[7] === 'Y' && o[9] === 'Y' && b[9] === 'Y' ? LL.G1 + LL.O2 : LL.G2 + LL.O1);
          else if (y[9] === 'Y') applyMoves(r[7] === 'Y' && b[9] === 'Y' && o[9] === 'Y' ? LL.O1 + LL.B2 : LL.O2 + LL.B1);
          // all four mis-oriented
          else if (r[7] === 'Y' && r[9] === 'Y') applyMoves(LL.R1);
          else if (b[7] === 'Y' && g[7] === 'Y') applyMoves(LL.R2);
          else if (b[7] === 'Y' && b[9] === 'Y') applyMoves(LL.B1);
          else if (b[7] === 'R' && b[9] === 'O') applyMoves(LL.B2);
          else if (o[7] === 'Y' && o[9] === 'Y') applyMoves(LL.O1);
          else if (o[7] === 'B' && o[9] === 'G') applyMoves(LL.O2);
          else if (g[7] === 'Y' && g[9] === 'Y') applyMoves(LL.G1);
          else if (g[7] === 'R' && g[9] === 'O') applyMoves(LL.G2);
        }

        compress();
        if (minimum.length > final.length) minimum = final;
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

function All_Face_solve() {
  const s = document.getElementById('textarea').value;
  if (!hasValidColorCounts(s)) { notify('Fill in all 54 stickers (9 of each colour) first', 'error'); return; }

  // First orientation (white): solve and seed the best result.
  color = 1;
  solve();
  if (Invalid === true) return;
  recompress();
  mini = minimum;

  // Remaining orientations: re-centre, solve, translate back, keep the shortest.
  for (let k = 1; k < ORIENTATIONS.length; k++) {
    const orient = ORIENTATIONS[k];
    copyState(WORK, INPUT_BACKUP);
    orient.recenter();
    solve();
    minimum = orient.prefix + minimum;
    transform();
    recompress();
    if (mini.length > minimum.length) { mini = minimum; color = orient.color; }
  }

  minimum = mini;
  col = ORIENTATIONS.find((orient) => orient.color === color).name;
}
