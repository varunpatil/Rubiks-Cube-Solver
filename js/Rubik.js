/* =============================================================================
 * Rubik's Cube Solver
 *
 * Solving method (unchanged from the original): a beginner's / F2L method, brute
 * forced for the shortest move sequence. For every one of the 6 ways to orient
 * the cube (each colour as the starting cross), solve() tries all 24x24 orderings
 * of edge / second-layer insertions and keeps the shortest result; All_Face_solve
 * keeps the shortest across the 6 orientations.
 *
 * Cube model
 * ----------
 * Six faces, each a 3x3 grid stored 1..9 (index 0 unused, index 5 is the fixed
 * centre). Face arrays are named by colour: r=red w=white o=orange y=yellow
 * b=blue g=green. Each cell holds a colour letter ('R','W','O','Y','B','G') or
 * '0' while unset. Hold the cube white-front, red-up, green-right; sticker
 * numbering matches the on-screen net (see help()).
 *
 * Moves
 * -----
 * F B R L U D turn a face clockwise; each mutates the face arrays and appends its
 * letter to `original` (the running move log). Primed turns Fs Bs Rs Ls Us Ds are
 * the same turn three times. X and Y are whole-cube rotations used to re-orient.
 * A solution is a string of move letters (uppercase = clockwise, lowercase =
 * prime); compress()/recompress() cancel redundant turns.
 * ========================================================================== */

'use strict';

// ---- Cube state -------------------------------------------------------------
// Working faces, plus two backups: *o snapshots the user's input (restored on a
// failed/timed-out solve), *x snapshots the per-orientation start inside solve().
const r = ['0', '0', '0', '0', '0', 'R', '0', '0', '0', '0'];
const w = ['0', '0', '0', '0', '0', 'W', '0', '0', '0', '0'];
const o = ['0', '0', '0', '0', '0', 'O', '0', '0', '0', '0'];
const y = ['0', '0', '0', '0', '0', 'Y', '0', '0', '0', '0'];
const b = ['0', '0', '0', '0', '0', 'B', '0', '0', '0', '0'];
const g = ['0', '0', '0', '0', '0', 'G', '0', '0', '0', '0'];

const ro = ['0', '0', '0', '0', '0', 'R', '0', '0', '0', '0'];
const wo = ['0', '0', '0', '0', '0', 'W', '0', '0', '0', '0'];
const oo = ['0', '0', '0', '0', '0', 'O', '0', '0', '0', '0'];
const yo = ['0', '0', '0', '0', '0', 'Y', '0', '0', '0', '0'];
const bo = ['0', '0', '0', '0', '0', 'B', '0', '0', '0', '0'];
const go = ['0', '0', '0', '0', '0', 'G', '0', '0', '0', '0'];

const rx = ['0', '0', '0', '0', '0', 'R', '0', '0', '0', '0'];
const wx = ['0', '0', '0', '0', '0', 'W', '0', '0', '0', '0'];
const ox = ['0', '0', '0', '0', '0', 'O', '0', '0', '0', '0'];
const yx = ['0', '0', '0', '0', '0', 'Y', '0', '0', '0', '0'];
const bx = ['0', '0', '0', '0', '0', 'B', '0', '0', '0', '0'];
const gx = ['0', '0', '0', '0', '0', 'G', '0', '0', '0', '0'];

// Faces grouped for whole-state copies. Index order is arbitrary but consistent.
const WORK = [r, w, o, y, b, g];
const INPUT_BACKUP = [ro, wo, oo, yo, bo, go];
const SOLVE_BACKUP = [rx, wx, ox, yx, bx, gx];

// Face lookup by letter, for the data-driven step solvers and the UI.
const FACES = { r: r, w: w, o: o, y: y, b: b, g: g };

// Copy every sticker (1..9) of each face from src faces into dst faces.
function copyState(dst, src) {
  for (let f = 0; f < 6; f++) for (let i = 1; i <= 9; i++) dst[f][i] = src[f][i];
}

// ---- Solver bookkeeping ------------------------------------------------------
const SOLUTION_CAP = 200; // unreachable upper bound on solution length; used as a sentinel
const maxTime = 800;      // ms budget; a longer search means an invalid configuration

// These three are declared with `var` on purpose: the page and the test harness
// read them off the global object by name, which only `var`/function do.
var minimum = 'a'.repeat(SOLUTION_CAP); // best (shortest) solution found so far
var col = '';        // name of the winning starting-cross colour
var Invalid = false; // set when the input cannot be solved

// Internal solver bookkeeping.
let selected_color = '0';
let original = '';   // raw move log appended to by every turn
let final = '';      // compress() output
let mini = 'a'.repeat(SOLUTION_CAP); // best across orientations, in All_Face_solve
let rev = false;     // "reverse solution" toggle
let color = 0;
let startT = new Date().getTime();

// ---- Turns ------------------------------------------------------------------
// Each turn cycles the affected stickers (4-cycles via a temp) and logs itself.
function F() {
  original += 'F';
  let t = w[8]; w[8] = w[6]; w[6] = w[2]; w[2] = w[4]; w[4] = t;
  t = w[7]; w[7] = w[9]; w[9] = w[3]; w[3] = w[1]; w[1] = t;
  t = o[3]; o[3] = g[1]; g[1] = r[1]; r[1] = b[3]; b[3] = t;
  t = o[2]; o[2] = g[2]; g[2] = r[2]; r[2] = b[2]; b[2] = t;
  t = o[1]; o[1] = g[3]; g[3] = r[3]; r[3] = b[1]; b[1] = t;
}
function B() {
  original += 'B';
  let t = y[7]; y[7] = y[9]; y[9] = y[3]; y[3] = y[1]; y[1] = t;
  t = y[4]; y[4] = y[8]; y[8] = y[6]; y[6] = y[2]; y[2] = t;
  t = r[9]; r[9] = g[9]; g[9] = o[7]; o[7] = b[7]; b[7] = t;
  t = r[8]; r[8] = g[8]; g[8] = o[8]; o[8] = b[8]; b[8] = t;
  t = r[7]; r[7] = g[7]; g[7] = o[9]; o[9] = b[9]; b[9] = t;
}
function R() {
  original += 'R';
  let t = w[3]; w[3] = o[3]; o[3] = y[3]; y[3] = r[9]; r[9] = t;
  t = w[6]; w[6] = o[6]; o[6] = y[6]; y[6] = r[6]; r[6] = t;
  t = w[9]; w[9] = o[9]; o[9] = y[9]; y[9] = r[3]; r[3] = t;
  t = g[3]; g[3] = g[9]; g[9] = g[7]; g[7] = g[1]; g[1] = t;
  t = g[2]; g[2] = g[6]; g[6] = g[8]; g[8] = g[4]; g[4] = t;
}
function L() {
  original += 'L';
  let t = r[7]; r[7] = y[1]; y[1] = o[1]; o[1] = w[1]; w[1] = t;
  t = r[4]; r[4] = y[4]; y[4] = o[4]; o[4] = w[4]; w[4] = t;
  t = r[1]; r[1] = y[7]; y[7] = o[7]; o[7] = w[7]; w[7] = t;
  t = b[7]; b[7] = b[9]; b[9] = b[3]; b[3] = b[1]; b[1] = t;
  t = b[8]; b[8] = b[6]; b[6] = b[2]; b[2] = b[4]; b[4] = t;
}
function U() {
  original += 'U';
  let t = g[1]; g[1] = y[9]; y[9] = b[7]; b[7] = w[1]; w[1] = t;
  t = g[4]; g[4] = y[8]; y[8] = b[4]; b[4] = w[2]; w[2] = t;
  t = g[7]; g[7] = y[7]; y[7] = b[1]; b[1] = w[3]; w[3] = t;
  t = r[1]; r[1] = r[3]; r[3] = r[9]; r[9] = r[7]; r[7] = t;
  t = r[6]; r[6] = r[8]; r[8] = r[4]; r[4] = r[2]; r[2] = t;
}
function D() {
  original += 'D';
  let t = b[9]; b[9] = y[3]; y[3] = g[3]; g[3] = w[7]; w[7] = t;
  t = b[6]; b[6] = y[2]; y[2] = g[6]; g[6] = w[8]; w[8] = t;
  t = b[3]; b[3] = y[1]; y[1] = g[9]; g[9] = w[9]; w[9] = t;
  t = o[7]; o[7] = o[9]; o[9] = o[3]; o[3] = o[1]; o[1] = t;
  t = o[4]; o[4] = o[8]; o[8] = o[6]; o[6] = o[2]; o[2] = t;
}

// Primed (counter-clockwise) turns = the clockwise turn three times.
function Fs() { F(); F(); F(); }
function Bs() { B(); B(); B(); }
function Rs() { R(); R(); R(); }
function Ls() { L(); L(); L(); }
function Us() { U(); U(); U(); }
function Ds() { D(); D(); D(); }

// Whole-cube rotations (used to re-orient before solving from another colour).
function X() {
  R(); Ls();
  let t = o[5]; o[5] = y[5]; y[5] = r[5]; r[5] = w[5]; w[5] = t;
  t = o[2]; o[2] = y[2]; y[2] = r[8]; r[8] = w[2]; w[2] = t;
  t = o[8]; o[8] = y[8]; y[8] = r[2]; r[2] = w[8]; w[8] = t;
}
function Y() {
  U(); Ds();
  let t = g[5]; g[5] = y[5]; y[5] = b[5]; b[5] = w[5]; w[5] = t;
  t = g[2]; g[2] = y[6]; y[6] = b[8]; b[8] = w[4]; w[4] = t;
  t = g[8]; g[8] = y[4]; y[4] = b[2]; b[2] = w[6]; w[6] = t;
}

// ---- Move-sequence compression ---------------------------------------------
// compress(): scan `original`; 3 identical turns in a row collapse to one prime
// (lowercase), 4 collapse to nothing. recompress(): expand primes back to triples
// and compress() repeatedly until the length stops shrinking.
function compress() {
  final = '';
  for (let i = 0; i < original.length; i++) {
    if (i + 2 < original.length && original[i] === original[i + 1] && original[i] === original[i + 2]) {
      if (original[i] !== original[i + 3]) { final += original[i].toLowerCase(); i += 2; }
      else { i += 3; }
    } else {
      final += original[i];
    }
  }
}
function recompress() {
  let prev = '';
  while (prev !== minimum) {
    prev = minimum;
    original = '';
    final = '';
    for (let i = 0; i < minimum.length; i++) {
      const c = minimum[i];
      original += c > 'a' ? c.toUpperCase().repeat(3) : c;
    }
    compress();
    minimum = final;
  }
}

// transform(): resolve whole-cube rotations recorded in `minimum`. Walking from
// the end, every X (or Y) relabels all following face turns as if the cube had
// been rotated, then the X/Y markers are stripped.
function transform() {
  const X_MAP = { U: 'F', D: 'B', F: 'D', B: 'U', u: 'f', d: 'b', f: 'd', b: 'u' };
  const Y_MAP = { R: 'B', L: 'F', F: 'R', B: 'L', r: 'b', l: 'f', f: 'r', b: 'l' };
  const ch = minimum.split('');
  for (let i = ch.length - 1; i >= 0; i--) {
    const map = ch[i] === 'X' ? X_MAP : ch[i] === 'Y' ? Y_MAP : null;
    if (!map) continue;
    for (let j = i + 1; j < ch.length; j++) if (map[ch[j]]) ch[j] = map[ch[j]];
  }
  minimum = ch.filter((c) => c !== 'X' && c !== 'Y').join('');
  if (minimum.length < 90) recompress();
}

// The n-th permutation of {0,1,2,3} (factorial-base / Lehmer code), as a 4-element
// array. solve() uses it to pick the order in which to insert the 4 cross edges /
// 4 second-layer pairs, sweeping n = 0..23 to try every ordering.
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

// ---- Predicates -------------------------------------------------------------
// F2L slot solved? (white + the two side colours of a corner/edge pair in place)
function f2l_rb() { return w[1] === 'W' && r[1] === 'R' && r[4] === 'R' && b[1] === 'B' && b[4] === 'B' ? 1 : 0; }
function f2l_rg() { return w[3] === 'W' && r[3] === 'R' && r[6] === 'R' && g[1] === 'G' && g[4] === 'G' ? 1 : 0; }
function f2l_bo() { return w[7] === 'W' && o[1] === 'O' && o[4] === 'O' && b[3] === 'B' && b[6] === 'B' ? 1 : 0; }
function f2l_go() { return w[9] === 'W' && g[3] === 'G' && g[6] === 'G' && o[3] === 'O' && o[6] === 'O' ? 1 : 0; }

// Last-layer corner present in its slot (any orientation)?
function rby() { return ('' + r[7] + b[7] + y[7]).includes('R') && ('' + r[7] + b[7] + y[7]).includes('B') && ('' + r[7] + b[7] + y[7]).includes('Y') ? 1 : 0; }
function rgy() { return ('' + r[9] + g[7] + y[9]).includes('R') && ('' + r[9] + g[7] + y[9]).includes('G') && ('' + r[9] + g[7] + y[9]).includes('Y') ? 1 : 0; }
function ogy() { return ('' + o[9] + g[9] + y[3]).includes('O') && ('' + o[9] + g[9] + y[3]).includes('G') && ('' + o[9] + g[9] + y[3]).includes('Y') ? 1 : 0; }
function oby() { return ('' + o[7] + b[9] + y[1]).includes('O') && ('' + o[7] + b[9] + y[1]).includes('B') && ('' + o[7] + b[9] + y[1]).includes('Y') ? 1 : 0; }

// Stage-completion checks, each building on the previous.
function check_white_cross() {
  return w[2] === 'W' && w[4] === 'W' && w[6] === 'W' && w[8] === 'W' &&
    r[2] === 'R' && g[2] === 'G' && o[2] === 'O' && b[2] === 'B' ? 1 : 0;
}
function check_white_face() {
  return w[1] === 'W' && w[3] === 'W' && w[7] === 'W' && w[9] === 'W' &&
    r[1] === 'R' && r[3] === 'R' && g[1] === 'G' && g[3] === 'G' &&
    b[1] === 'B' && b[3] === 'B' && o[1] === 'O' && o[3] === 'O' &&
    check_white_cross() === 1 ? 1 : 0;
}
function check_layer2() {
  return check_white_face() === 1 && r[4] === 'R' && r[6] === 'R' &&
    g[4] === 'G' && g[6] === 'G' && o[4] === 'O' && o[6] === 'O' &&
    b[4] === 'B' && b[6] === 'B' ? 1 : 0;
}
function check_yellow_cross() {
  return check_layer2() === 1 && y[2] === 'Y' && y[4] === 'Y' && y[6] === 'Y' && y[8] === 'Y' ? 1 : 0;
}
function check_ORyellow_cross() {
  return check_yellow_cross() === 1 && r[8] === 'R' && o[8] === 'O' && g[8] === 'G' && b[8] === 'B' ? 1 : 0;
}
function check_corner() {
  return check_ORyellow_cross() && rby() && rgy() && ogy() && oby() ? 1 : 0;
}
function check_if_solved() {
  for (let i = 1; i <= 9; i++) {
    if (!(r[i] === 'R' && w[i] === 'W' && o[i] === 'O' && y[i] === 'Y' && b[i] === 'B' && g[i] === 'G')) return 0;
  }
  return 1;
}

// ---- Step-solver engine (data-driven goWC / goL2) ---------------------------
// The white-cross and second-layer solvers are large "sticker pattern -> move
// sequence" lookup tables (below). A pattern (`when`) is a list of clauses, ALL
// of which must hold; each clause is '|'-separated alternatives; each alternative
// is space-separated `<face><index>=<colour>` terms (e.g. 'w4=W b2=B'). Moves are
// strings of solution letters (uppercase = turn, lowercase = prime).
const TURNS = { R: R, L: L, U: U, D: D, F: F, B: B, r: Rs, l: Ls, u: Us, d: Ds, f: Fs, b: Bs };
function applyMoves(seq) { for (const c of seq) TURNS[c](); }

// Compile a `when` (array of clause strings) into nested arrays of [faceArray,
// index, colour] for fast matching at solve time.
function compileWhen(when) {
  return when.map((clause) =>
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

const WHITE_CROSS = [
  { // 0: blue-white edge
    solved: ["w4=W b2=B"],
    cases: [
      [["w2=W r2=B"], 'UUBLL'],
      [["w2=B r2=W"], 'UL'],
      [["w4=B b2=W"], 'FUfL'],
      [["w6=W g2=B"], 'RRBBLL'],
      [["w6=B g2=W"], 'fUFL'],
      [["w8=W o2=B"], 'FlfL'],
      [["w8=B o2=W"], 'dl'],
      [["b6=W o4=B"], 'fDF'],
      [["b6=B o4=W"], 'l'],
      [["o6=W g6=B"], 'FFRFF'],
      [["o6=B g6=W"], 'DbdLL'],
      [["g4=W r6=B"], 'FUf'],
      [["g4=B r6=W"], 'UULUU'],
      [["r4=W b4=B"], 'L'],
      [["r4=B b4=W"], 'Fuf'],
      [["y2=W o8=B"], 'bLL'],
      [["y2=B o8=W"], 'Dld'],
      [["y4=W b8=B"], 'LL'],
      [["y4=B b8=W"], 'LFuf'],
      [["y6=W g8=B"], 'BBLL'],
      [["y6=B g8=W"], 'FBufL'],
      [["y8=W r8=B"], 'BLL'],
      [["y8=B r8=W"], 'uLU'],
    ],
  },
  { // 1: red-white edge
    solved: ["w2=W r2=R"],
    cases: [
      [["w2=R r2=W"], 'flFu'],
      [["w4=W b2=R"], 'FUfu'],
      [["w4=R b2=W"], 'lu'],
      [["w6=W g2=R"], 'fUFu'],
      [["w6=R g2=W"], 'RU'],
      [["w8=W o2=R"], 'DRRURR'],
      [["w8=R o2=W"], 'dflF'],
      [["b6=W o4=R"], 'FFDFF'],
      [["b6=R o4=W"], 'flF'],
      [["o6=W g6=R"], 'FRf'],
      [["o6=R g6=W"], 'FFdFF'],
      [["g4=W r6=R"], 'U'],
      [["g4=R r6=W"], 'Frf'],
      [["r4=W b4=R"], 'fLF'],
      [["r4=R b4=W"], 'u'],
      [["y2=W o8=R"], 'BBUU'],
      [["y2=R o8=W"], 'bLul'],
      [["y4=W b8=R"], 'bUU'],
      [["y4=R b8=W"], 'Lul'],
      [["y6=W g8=R"], 'BUU'],
      [["y6=R g8=W"], 'rUR'],
      [["y8=W r8=R"], 'UU'],
      [["y8=R r8=W"], 'ufLF'],
    ],
  },
  { // 2: orange-white edge
    solved: ["w8=W o2=O"],
    cases: [
      [["w2=W r2=O"], 'UUBBDD'],
      [["w2=O r2=W"], 'UFLf'],
      [["w4=W b2=O"], 'dfDF'],
      [["w4=O b2=W"], 'LD'],
      [["w6=W g2=O"], 'rfRF'],
      [["w6=O g2=W"], 'rd'],
      [["w8=O o2=W"], 'DfRF'],
      [["b6=W o4=O"], 'D'],
      [["b6=O o4=W"], 'Flf'],
      [["o6=W g6=O"], 'fRF'],
      [["o6=O g6=W"], 'd'],
      [["g4=W r6=O"], 'RRdRR'],
      [["g4=O r6=W"], 'frF'],
      [["r4=W b4=O"], 'FLf'],
      [["r4=O b4=W"], 'FFuFF'],
      [["y2=W o8=O"], 'DD'],
      [["y2=O o8=W"], 'dfRF'],
      [["y4=W b8=O"], 'BDD'],
      [["y4=O b8=W"], 'lDL'],
      [["y6=W g8=O"], 'bDD'],
      [["y6=O g8=W"], 'Rdr'],
      [["y8=W r8=O"], 'BBDD'],
      [["y8=O r8=W"], 'BlDL'],
    ],
  },
  { // 3: green-white edge
    solved: ["w6=W g2=G"],
    cases: [
      [["w2=W r2=G"], 'FRfr'],
      [["w2=G r2=W"], 'ur'],
      [["w4=W b2=G"], 'LLBBRR'],
      [["w4=G b2=W"], 'lfuF'],
      [["w6=G g2=W"], 'RfUF'],
      [["w8=W o2=G"], 'fRFr'],
      [["w8=G o2=W"], 'DR'],
      [["b6=W o4=G"], 'FDf'],
      [["b6=G o4=W"], 'DDRDD'],
      [["o6=W g6=G"], 'R'],
      [["o6=G g6=W"], 'Fdf'],
      [["g4=W r6=G"], 'fUF'],
      [["g4=G r6=W"], 'r'],
      [["r4=W b4=G"], 'UUrUU'],
      [["r4=G b4=W"], 'fuF'],
      [["y2=W o8=G"], 'BRR'],
      [["y2=G o8=W"], 'dRD'],
      [["y4=W b8=G"], 'BBRR'],
      [["y4=G b8=W"], 'BdRD'],
      [["y6=W g8=G"], 'RR'],
      [["y6=G g8=W"], 'rfUF'],
      [["y8=W r8=G"], 'bRR'],
      [["y8=G r8=W"], 'Uru'],
    ],
  },
];

const SECOND_LAYER = [
  { // 0: blue-red pair
    guard: 'f2l_rb',
    stages: [
      { name: 'firstToThird', cases: [
        [["w1=W r1=R b1=B|w1=B r1=W b1=R|w1=R r1=B b1=W"], 'lbL'],
        [["w3=W r3=B g1=R|w3=R r3=W g1=B|w3=B r3=R g1=W"], 'Rbr'],
        [["w9=W g3=B o3=R|w9=R g3=W o3=B|w9=B g3=R o3=W"], 'rbR'],
        [["w7=W b3=R o1=B|w7=B b3=W o1=R|w7=R b3=B o1=W"], 'Lbl'],
      ] },
      { name: 'secondToThird', cases: [
        [["r4=R b4=B|r4=B b4=R","r7=R b7=W y7=B|r7=B b7=R y7=W|r7=W b7=B y7=R"], 'Ubu'],
        [["r4=R b4=B|r4=B b4=R"], 'UBu'],
        [["r6=R g4=B|r6=B g4=R","r9=W g7=R y9=B|r9=B g7=W y9=R|r9=R g7=B y9=W"], 'Rbr'],
        [["r6=R g4=B|r6=B g4=R"], 'RBr'],
        [["g6=R o6=B|g6=B o6=R","g9=W o9=R y3=B|g9=B o9=W y3=R|g9=R o9=B y3=W"], 'Dbd'],
        [["g6=R o6=B|g6=B o6=R"], 'DBd'],
        [["b6=R o4=B|b6=B o4=R","o7=W b9=R y1=B|o7=B b9=W y1=R|o7=R b9=B y1=W"], 'Lbl'],
        [["b6=R o4=B|b6=B o4=R"], 'LBl'],
      ] },
      { name: 'pairUp', cases: [
        [["r7=W b7=B b8=B y4=R y7=R"], 'blBL', 1],
        [["r8=B r9=B y8=R y9=R g7=W"], 'lBL', 1],
        [["o9=W g8=B g9=B y3=R y6=R"], 'BlBL', 1],
        [["o7=B o8=B y1=R y2=R b9=W"], 'BBlBL', 1],
      ] },
      { name: 'breakUp', cases: [
        [["o7=B b9=W y1=R|o7=R b9=B y1=W|o7=W b9=R y1=B","o8=R y2=B|o8=B y2=R"], 'lBL'],
        [["r7=W b7=B y7=R|r7=R b7=W y7=B|r7=B b7=R y7=W","b8=R y4=B|b8=B y4=R"], 'BlBL'],
        [["r9=B g7=W y9=R|r9=R g7=B y9=W|r9=W g7=R y9=B","r8=R y8=B|r8=B y8=R"], 'BBlBL'],
        [["o9=W g9=B y3=R|o9=R g9=W y3=B|o9=B g9=R y3=W","g8=R y6=B|g8=B y6=R"], 'blBL'],
      ] },
      { name: 'badPairs', cases: [
        [["o7=B b9=W y1=R|o7=R b9=B y1=W|o7=W b9=R y1=B","b8=R y4=B|b8=B y4=R"], 'BBUbu'],
        [["r7=W b7=B y7=R|r7=R b7=W y7=B|r7=B b7=R y7=W","r8=R y8=B|r8=B y8=R"], 'bUbu'],
        [["r9=B g7=W y9=R|r9=R g7=B y9=W|r9=W g7=R y9=B","g8=R y6=B|g8=B y6=R"], 'Ubu'],
        [["o9=W g9=B y3=R|o9=R g9=W y3=B|o9=B g9=R y3=W","o8=R y2=B|o8=B y2=R"], 'BUbu'],
      ] },
      { name: 'whiteOnTop', cases: [
        [["g9=R o9=B y3=W b8=B y4=R"], 'lbLblBL', 1],
        [["b9=B o7=R y1=W r8=B y8=R"], 'BlbLblBL', 1],
        [["r7=B b7=R y7=W y6=R g8=B"], 'BBlbLblBL', 1],
        [["r9=R g7=B y9=W y2=R o8=B"], 'blbLblBL', 1],
        [["r9=R g7=B y9=W y4=R b8=B"], 'lBBLblBL', 1],
        [["g9=R o9=B y3=W r8=B y8=R"], 'BlBBLblBL', 1],
        [["b9=B o7=R y1=W g8=B y6=R"], 'BBlBBLblBL', 1],
        [["r7=B b7=R y7=W y2=R o8=B"], 'blBBLblBL', 1],
        [["g9=R o9=B y3=W r8=R y8=B"], 'UBuBUbu', 1],
        [["b9=B o7=R y1=W g8=R y6=B"], 'BUBuBUbu', 1],
        [["r7=B b7=R y7=W y2=B o8=R"], 'BBUBuBUbu', 1],
        [["r9=R g7=B y9=W y4=B b8=R"], 'bUBuBUbu', 1],
        [["b9=B o7=R y1=W r8=R y8=B"], 'UBBuBUbu', 1],
        [["r7=B b7=R y7=W y6=B g8=R"], 'BUBBuBUbu', 1],
        [["r9=R g7=B y9=W y2=B o8=R"], 'BBUBBuBUbu', 1],
        [["g9=R o9=B y3=W b8=R y4=B"], 'bUBBuBUbu', 1],
        [["r9=W g7=R y9=B y2=B o8=R"], 'UBuBBUbu', 1],
        [["g9=W o9=R y3=B b8=R y4=B"], 'BUBuBBUbu', 1],
        [["o7=W y1=B b9=R y8=B r8=R"], 'BBUBuBBUbu', 1],
        [["b7=W r7=R y7=B y6=B g8=R"], 'bUBuBBUbu', 1],
        [["r9=W g7=R y9=B y4=B b8=R"], 'UBBuBBUbu', 1],
        [["g9=W o9=R y3=B y8=B r8=R"], 'BUBBuBBUbu', 1],
        [["o7=W y1=B b9=R y6=B g8=R"], 'BBUBBuBBUbu', 1],
        [["b7=W r7=R y7=B y2=B o8=R"], 'bUBBuBBUbu', 1],
        [["b9=W o7=B y1=R y6=R g8=B"], 'lbLBBlBL', 1],
        [["r7=W b7=B y7=R y2=R o8=B"], 'BlbLBBlBL', 1],
        [["g7=W r9=B y9=R y4=R b8=B"], 'BBlbLBBlBL', 1],
        [["o9=W g9=B y3=R y8=R r8=B"], 'blbLBBlBL', 1],
        [["b9=W o7=B y1=R y8=R r8=B"], 'lBBLBBlBL', 1],
        [["r7=W b7=B y7=R y6=R g8=B"], 'BlBBLBBlBL', 1],
        [["g7=W r9=B y9=R y2=R o8=B"], 'BBlBBLBBlBL', 1],
        [["o9=W g9=B y3=R y4=R b8=B"], 'blBBLBBlBL', 1],
        [["r7=W b7=B y7=R y6=B g8=R"], 'UBu'],
        [["g7=W r9=B y9=R y2=B o8=R"], 'BUBu'],
        [["o9=W g9=B y3=R y4=B b8=R"], 'BBUBu'],
        [["b9=W o7=B y1=R y8=B r8=R"], 'bUBu'],
        [["b9=W o7=B y1=R y6=B g8=R"], 'lBLbUBu'],
        [["r7=W b7=B y7=R y2=B o8=R"], 'BlBLbUBu'],
        [["g7=W r9=B y9=R y4=B b8=R"], 'BBlBLbUBu'],
        [["o9=W g9=B y3=R y8=B r8=R"], 'blBLbUBu'],
        [["b7=W r7=R y7=B y2=R o8=B"], 'lbL'],
        [["r9=W g7=R y9=B y4=R b8=B"], 'BlbL'],
        [["g9=W o9=R y3=B y8=R r8=B"], 'BBlbL'],
        [["o7=W y1=B b9=R y6=R g8=B"], 'blbL'],
        [["o7=W y1=B b9=R y8=R r8=B"], 'lbLblbL'],
        [["b7=W r7=R y7=B y6=R g8=B"], 'BlbLblbL'],
        [["r9=W g7=R y9=B y2=R o8=B"], 'BBlbLblbL'],
        [["g9=W o9=R y3=B y4=R b8=B"], 'blbLblbL'],
      ] },
    ],
  },
  { // 1: red-green pair
    guard: 'f2l_rg',
    stages: [
      { name: 'firstToThird', cases: [
        [["w1=R r1=W b1=G|w1=G r1=R b1=W|w1=W r1=G b1=R"], 'lbL'],
        [["w3=G r3=W g1=R|w3=R r3=G g1=W|w3=W r3=R g1=G"], 'Rbr'],
        [["w9=W g3=R o3=G|w9=G g3=W o3=R|w9=R g3=G o3=W"], 'rbR'],
        [["w7=W b3=G o1=R|w7=R b3=W o1=G|w7=G b3=R o1=W"], 'Lbl'],
      ] },
      { name: 'secondToThird', cases: [
        [["r4=R b4=G|r4=G b4=R","r7=G b7=W y7=R|r7=R b7=G y7=W|r7=W b7=R y7=G"], 'Ubu'],
        [["r4=R b4=G|r4=G b4=R"], 'UBu'],
        [["r6=R g4=G|r6=G g4=R","r9=G g7=R y9=W|r9=W g7=G y9=R|r9=R g7=W y9=G"], 'Rbr'],
        [["r6=R g4=G|r6=G g4=R"], 'RBr'],
        [["g6=R o6=G|g6=G o6=R","g9=W o9=G y3=R|g9=R o9=W y3=G|g9=G o9=R y3=W"], 'Dbd'],
        [["g6=R o6=G|g6=G o6=R"], 'DBd'],
        [["b6=R o4=G|b6=G o4=R","o7=W b9=G y1=R|o7=R b9=W y1=G|o7=G b9=R y1=W"], 'Lbl'],
        [["b6=R o4=G|b6=G o4=R"], 'LBl'],
      ] },
      { name: 'pairUp', cases: [
        [["r7=W b7=R b8=R y4=G y7=G"], 'BBuBU', 1],
        [["r8=R r9=R y8=G y9=G g7=W"], 'buBU', 1],
        [["o9=W g8=R g9=R y3=G y6=G"], 'uBU', 1],
        [["o7=R o8=R y1=G y2=G b9=W"], 'BuBU', 1],
      ] },
      { name: 'breakUp', cases: [
        [["o7=R b9=W y1=G|o7=G b9=R y1=W|o7=W b9=G y1=R","b8=R y4=G|b8=G y4=R"], 'BRbr'],
        [["r7=W b7=R y7=G|r7=G b7=W y7=R|r7=R b7=G y7=W","r8=R y8=G|r8=G y8=R"], 'BBRbr'],
        [["r9=R g7=W y9=G|r9=G g7=R y9=W|r9=W g7=G y9=R","g8=R y6=G|g8=G y6=R"], 'bRbr'],
        [["o9=W g9=R y3=G|o9=G g9=W y3=R|o9=R g9=G y3=W","o8=R y2=G|o8=G y2=R"], 'Rbr'],
      ] },
      { name: 'badPairs', cases: [
        [["o7=R b9=W y1=G|o7=G b9=R y1=W|o7=W b9=G y1=R","o8=R y2=G|o8=G y2=R"], 'buBU'],
        [["r7=W b7=R y7=G|r7=G b7=W y7=R|r7=R b7=G y7=W","b8=R y4=G|b8=G y4=R"], 'uBU'],
        [["r9=R g7=W y9=G|r9=G g7=R y9=W|r9=W g7=G y9=R","r8=R y8=G|r8=G y8=R"], 'BuBU'],
        [["o9=W g9=R y3=G|o9=G g9=W y3=R|o9=R g9=G y3=W","g8=R y6=G|g8=G y6=R"], 'BBuBU'],
      ] },
      { name: 'whiteOnTop', cases: [
        [["g9=G o9=R y3=W b8=G y4=R"], 'BBRBBrBRbr', 1],
        [["b9=R o7=G y1=W r8=G y8=R"], 'bRBBrBRbr', 1],
        [["r7=R b7=G y7=W y6=R g8=G"], 'RBBrBRbr', 1],
        [["r9=G g7=R y9=W y2=R o8=G"], 'BRBBrBRbr', 1],
        [["r9=G g7=R y9=W y4=R b8=G"], 'BBRBrBRbr', 1],
        [["g9=G o9=R y3=W r8=G y8=R"], 'bRBrBRbr', 1],
        [["b9=R o7=G y1=W g8=G y6=R"], 'RBrBRbr', 1],
        [["r7=R b7=G y7=W y2=R o8=G"], 'BRBrBRbr', 1],
        [["g9=G o9=R y3=W r8=R y8=G"], 'uBBUbuBU', 1],
        [["b9=R o7=G y1=W g8=R y6=G"], 'BuBBUbuBU', 1],
        [["r7=R b7=G y7=W y2=G o8=R"], 'BBuBBUbuBU', 1],
        [["r9=G g7=R y9=W y4=G b8=R"], 'buBBUbuBU', 1],
        [["b9=R o7=G y1=W r8=R y8=G"], 'ubUbuBU', 1],
        [["r7=R b7=G y7=W y6=G g8=R"], 'BubUbuBU', 1],
        [["r9=G g7=R y9=W y2=G o8=R"], 'BBubUbuBU', 1],
        [["g9=G o9=R y3=W b8=R y4=G"], 'bubUbuBU', 1],
        [["r9=R g7=W y9=G y2=G o8=R"], 'BuBBUBBuBU', 1],
        [["g9=R o9=W y3=G b8=R y4=G"], 'BBuBBUBBuBU', 1],
        [["o7=R y1=G b9=W y8=G r8=R"], 'buBBUBBuBU', 1],
        [["b7=R r7=W y7=G y6=G g8=R"], 'uBBUBBuBU', 1],
        [["r9=R g7=W y9=G y4=G b8=R"], 'BubUBBuBU', 1],
        [["g9=R o9=W y3=G y8=G r8=R"], 'BBubUBBuBU', 1],
        [["o7=R y1=G b9=W y6=G g8=R"], 'bubUBBuBU', 1],
        [["b7=R r7=W y7=G y2=G o8=R"], 'ubUBBuBU', 1],
        [["b9=G o7=W y1=R y6=R g8=G"], 'BRBBrBBRbr', 1],
        [["r7=G b7=W y7=R y2=R o8=G"], 'BBRBBrBBRbr', 1],
        [["g7=G r9=W y9=R y4=R b8=G"], 'bRBBrBBRbr', 1],
        [["o9=G g9=W y3=R y8=R r8=G"], 'RBBrBBRbr', 1],
        [["b9=G o7=W y1=R y8=R r8=G"], 'BRBrBBRbr', 1],
        [["r7=G b7=W y7=R y6=R g8=G"], 'BBRBrBBRbr', 1],
        [["g7=G r9=W y9=R y2=R o8=G"], 'bRBrBBRbr', 1],
        [["o9=G g9=W y3=R y4=R b8=G"], 'RBrBBRbr', 1],
        [["r7=G b7=W y7=R y6=G g8=R"], 'ubUbubU', 1],
        [["g7=G r9=W y9=R y2=G o8=R"], 'BubUbubU', 1],
        [["o9=G g9=W y3=R y4=G b8=R"], 'BBubUbubU', 1],
        [["b9=G o7=W y1=R y8=G r8=R"], 'bubUbubU', 1],
        [["b9=G o7=W y1=R y6=G g8=R"], 'BBubU', 1],
        [["r7=G b7=W y7=R y2=G o8=R"], 'bubU', 1],
        [["g7=G r9=W y9=R y4=G b8=R"], 'ubU', 1],
        [["o9=G g9=W y3=R y8=G r8=R"], 'BubU', 1],
        [["b7=R r7=W y7=G y2=R o8=G"], 'uBUbRBr', 1],
        [["r9=R g7=W y9=G y4=R b8=G"], 'BuBUbRBr', 1],
        [["g9=R o9=W y3=G y8=R r8=G"], 'BBuBUbRBr', 1],
        [["o7=R b9=W y1=G y6=R g8=G"], 'buBUbRBr', 1],
        [["o7=R b9=W y1=G y8=R r8=G"], 'BBRBr', 1],
        [["b7=R r7=W y7=G y6=R g8=G"], 'bRBr', 1],
        [["r9=R g7=W y9=G y2=R o8=G"], 'RBr', 1],
        [["g9=R o9=W y3=G y4=R b8=G"], 'BRBr', 1],
      ] },
    ],
  },
  { // 2: orange-green pair
    guard: 'f2l_go',
    stages: [
      { name: 'firstToThird', cases: [
        [["w1=O r1=G b1=W|w1=W r1=O b1=G|w1=G r1=W b1=O"], 'lbL'],
        [["w3=W r3=G g1=O|w3=O r3=W g1=G|w3=G r3=O g1=W"], 'Rbr'],
        [["w9=W g3=G o3=O|w9=O g3=W o3=G|w9=G g3=O o3=W"], 'rbR'],
        [["w7=W b3=O o1=G|w7=G b3=W o1=O|w7=O b3=G o1=W"], 'Lbl'],
      ] },
      { name: 'secondToThird', cases: [
        [["r4=O b4=G|r4=G b4=O","r7=W b7=G y7=O|r7=O b7=W y7=G|r7=G b7=O y7=W"], 'Ubu'],
        [["r4=O b4=G|r4=G b4=O"], 'UBu'],
        [["r6=O g4=G|r6=G g4=O","r9=G g7=W y9=O|r9=O g7=G y9=W|r9=W g7=O y9=G"], 'Rbr'],
        [["r6=O g4=G|r6=G g4=O"], 'RBr'],
        [["g6=O o6=G|g6=G o6=O","g9=G o9=W y3=O|g9=O o9=G y3=W|g9=W o9=O y3=G"], 'Dbd'],
        [["g6=O o6=G|g6=G o6=O"], 'DBd'],
        [["b6=O o4=G|b6=G o4=O","o7=O b9=G y1=W|o7=W b9=O y1=G|o7=G b9=W y1=O"], 'Lbl'],
        [["b6=O o4=G|b6=G o4=O"], 'LBl'],
      ] },
      { name: 'pairUp', cases: [
        [["r9=W g7=O g8=O y6=G y9=G"], 'Dbd', 1],
        [["g9=W o8=O o9=O y2=G y3=G"], 'BDbd', 1],
        [["o7=W b8=O b9=O y1=G y4=G"], 'BBDbd', 1],
        [["b7=W r7=O r8=O y7=G y8=G"], 'bDbd', 1],
      ] },
      { name: 'breakUp', cases: [
        [["o7=O b9=G y1=W|o7=W b9=O y1=G|o7=G b9=W y1=O","o8=O y2=G|o8=G y2=O"], 'BBrBR'],
        [["r7=G b7=O y7=W|r7=W b7=G y7=O|r7=O b7=W y7=G","b8=O y4=G|b8=G y4=O"], 'brBR'],
        [["r9=O g7=G y9=W|r9=W g7=O y9=G|r9=G g7=W y9=O","r8=O y8=G|r8=G y8=O"], 'rBR'],
        [["o9=G g9=O y3=W|o9=W g9=G y3=O|o9=O g9=W y3=G","g8=O y6=G|g8=G y6=O"], 'BrBR'],
      ] },
      { name: 'badPairs', cases: [
        [["o7=O b9=G y1=W|o7=W b9=O y1=G|o7=G b9=W y1=O","b8=O y4=G|b8=G y4=O"], 'Dbd'],
        [["r7=G b7=O y7=W|r7=W b7=G y7=O|r7=O b7=W y7=G","r8=O y8=G|r8=G y8=O"], 'BDbd'],
        [["r9=O g7=G y9=W|r9=W g7=O y9=G|r9=G g7=W y9=O","g8=O y6=G|g8=G y6=O"], 'BBDbd'],
        [["o9=G g9=O y3=W|o9=W g9=G y3=O|o9=O g9=W y3=G","o8=O y2=G|o8=G y2=O"], 'bDbd'],
      ] },
      { name: 'whiteOnTop', cases: [
        [["g9=O o9=G y3=W b8=G y4=O"], 'BBrbRbrBR', 1],
        [["b9=G o7=O y1=W r8=G y8=O"], 'brbRbrBR', 1],
        [["r7=G b7=O y7=W y6=O g8=G"], 'rbRbrBR', 1],
        [["r9=O g7=G y9=W y2=O o8=G"], 'BrbRbrBR', 1],
        [["r9=O g7=G y9=W b8=G y4=O"], 'BBrBBRbrBR', 1],
        [["g9=O o9=G y3=W r8=G y8=O"], 'brBBRbrBR', 1],
        [["b9=G o7=O y1=W g8=G y6=O"], 'rBBRbrBR', 1],
        [["r7=G b7=O y7=W o8=G y2=O"], 'BrBBRbrBR', 1],
        [["g9=O o9=G y3=W r8=O y8=G"], 'BBDBdBDbd', 1],
        [["b9=G o7=O y1=W g8=O y6=G"], 'bDBdBDbd', 1],
        [["r7=G b7=O y7=W y2=G o8=O"], 'DBdBDbd', 1],
        [["r9=O g7=G y9=W y4=G b8=O"], 'BDBdBDbd', 1],
        [["b9=G o7=O y1=W r8=O y8=G"], 'BBDBBdBDbd', 1],
        [["r7=G b7=O y7=W y6=G g8=O"], 'bDBBdBDbd', 1],
        [["r9=O g7=G y9=W y2=G o8=O"], 'DBBdBDbd', 1],
        [["g9=O o9=G y3=W b8=O y4=G"], 'BDBBdBDbd', 1],
        [["r9=W g7=O y9=G y2=G o8=O"], 'BBDBdBBDbd', 1],
        [["g9=W o9=O y3=G y4=G b8=O"], 'bDBdBBDbd', 1],
        [["o7=W b9=O y1=G y8=G r8=O"], 'DBdBBDbd', 1],
        [["b7=W r7=O y7=G y6=G g8=O"], 'BDBdBBDbd', 1],
        [["r9=W g7=O y9=G y4=G b8=O"], 'BBDBBdBBDbd', 1],
        [["g9=W o9=O y3=G y8=G r8=O"], 'bDBBdBBDbd', 1],
        [["o7=W b9=O y1=G y6=G g8=O"], 'DBBdBBDbd', 1],
        [["b7=W r7=O y7=G y2=G o8=O"], 'BDBBdBBDbd', 1],
        [["b9=W o7=G y1=O y6=O g8=G"], 'BBrbRBBrBR', 1],
        [["r7=W b7=G y7=O y2=O o8=G"], 'brbRBBrBR', 1],
        [["g7=W r9=G y9=O y4=O b8=G"], 'rbRBBrBR', 1],
        [["o9=W g9=G y3=O y8=O r8=G"], 'BrbRBBrBR', 1],
        [["b9=W o7=G y1=O y8=O r8=G"], 'BBrBBRBBrBR', 1],
        [["r7=W b7=G y7=O y6=O g8=G"], 'brBBRBBrBR', 1],
        [["g7=W r9=G y9=O y2=O o8=G"], 'rBBRBBrBR', 1],
        [["o9=W g9=G y3=O y4=O b8=G"], 'BrBBRBBrBR', 1],
        [["r7=W b7=G y7=O y6=G g8=O"], 'BBDBd', 1],
        [["g7=W r9=G y9=O y2=G o8=O"], 'bDBd', 1],
        [["o9=W g9=G y3=O y4=G b8=O"], 'DBd', 1],
        [["b9=W o7=G y1=O y8=G r8=O"], 'BDBd', 1],
        [["b9=W o7=G y1=O y6=G g8=O"], 'BBrBRbDBd', 1],
        [["r7=W b7=G y7=O y2=G o8=O"], 'brBRbDBd', 1],
        [["g7=W r9=G y9=O y4=G b8=O"], 'rBRbDBd', 1],
        [["o9=W g9=G y3=O y8=G r8=O"], 'BrBRbDBd', 1],
        [["b7=W r7=O y7=G y2=O o8=G"], 'BBrbR', 1],
        [["r9=W g7=O y9=G y4=O b8=G"], 'brbR', 1],
        [["g9=W o9=O y3=G y8=O r8=G"], 'rbR', 1],
        [["o7=W b9=O y1=G y6=O g8=G"], 'BrbR', 1],
        [["o7=W b9=O y1=G y8=O r8=G"], 'BBrbRbrbR', 1],
        [["b7=W r7=O y7=G y6=O g8=G"], 'brbRbrbR', 1],
        [["r9=W g7=O y9=G y2=O o8=G"], 'rbRbrbR', 1],
        [["g9=W o9=O y3=G y4=O b8=G"], 'BrbRbrbR', 1],
      ] },
    ],
  },
  { // 3: orange-blue pair
    guard: 'f2l_bo',
    stages: [
      { name: 'firstToThird', cases: [
        [["w1=W r1=B b1=O|w1=O r1=W b1=B|w1=B r1=O b1=W"], 'lbL'],
        [["w3=W r3=O g1=B|w3=B r3=W g1=O|w3=O r3=B g1=W"], 'Rbr'],
        [["w9=W g3=O o3=B|w9=B g3=W o3=O|w9=O g3=B o3=W"], 'rbR'],
        [["w7=B b3=O o1=W|w7=W b3=B o1=O|w7=O b3=W o1=B"], 'Lbl'],
      ] },
      { name: 'secondToThird', cases: [
        [["r4=O b4=B|r4=B b4=O","r7=W b7=O y7=B|r7=B b7=W y7=O|r7=O b7=B y7=W"], 'Ubu'],
        [["r4=O b4=B|r4=B b4=O"], 'UBu'],
        [["r6=O g4=B|r6=B g4=O","r9=W g7=B y9=O|r9=O g7=W y9=B|r9=B g7=O y9=W"], 'Rbr'],
        [["r6=O g4=B|r6=B g4=O"], 'RBr'],
        [["g6=O o6=B|g6=B o6=O","g9=O o9=W y3=B|g9=B o9=O y3=W|g9=W o9=B y3=O"], 'Dbd'],
        [["g6=O o6=B|g6=B o6=O"], 'DBd'],
        [["b6=O o4=B|b6=B o4=O","o7=B b9=O y1=W|o7=W b9=B y1=O|o7=O b9=W y1=B"], 'Lbl'],
        [["b6=O o4=B|b6=B o4=O"], 'LBl'],
      ] },
      { name: 'pairUp', cases: [
        [["r9=W g7=B g8=B y6=O y9=O"], 'bLbl', 1],
        [["g9=W o8=B o9=B y2=O y3=O"], 'Lbl', 1],
        [["o7=W b8=B b9=B y1=O y4=O"], 'BLbl', 1],
        [["b7=W r7=B r8=B y7=O y8=O"], 'BBLbl', 1],
      ] },
      { name: 'breakUp', cases: [
        [["o7=B b9=O y1=W|o7=W b9=B y1=O|o7=O b9=W y1=B","o8=O y2=B|o8=B y2=O"], 'BdBD'],
        [["r7=O b7=B y7=W|r7=W b7=O y7=B|r7=B b7=W y7=O","b8=O y4=B|b8=B y4=O"], 'BBdBD'],
        [["r9=B g7=O y9=W|r9=W g7=B y9=O|r9=O g7=W y9=B","r8=O y8=B|r8=B y8=O"], 'bdBD'],
        [["o9=O g9=B y3=W|o9=W g9=O y3=B|o9=B g9=W y3=O","g8=O y6=B|g8=B y6=O"], 'dBD'],
      ] },
      { name: 'badPairs', cases: [
        [["o7=B b9=O y1=W|o7=W b9=B y1=O|o7=O b9=W y1=B","b8=O y4=B|b8=B y4=O"], 'bLbl'],
        [["r7=O b7=B y7=W|r7=W b7=O y7=B|r7=B b7=W y7=O","r8=O y8=B|r8=B y8=O"], 'Lbl'],
        [["r9=B g7=O y9=W|r9=W g7=B y9=O|r9=O g7=W y9=B","g8=O y6=B|g8=B y6=O"], 'BLbl'],
        [["o9=O g9=B y3=W|o9=W g9=O y3=B|o9=B g9=W y3=O","o8=O y2=B|o8=B y2=O"], 'BBLbl'],
      ] },
      { name: 'whiteOnTop', cases: [
        [["g9=B o9=O y3=W b8=B y4=O"], 'LBBlBLbl', 1],
        [["b9=O o7=B y1=W r8=B y8=O"], 'BLBBlBLbl', 1],
        [["r7=O b7=B y7=W y6=O g8=B"], 'BBLBBlBLbl', 1],
        [["r9=B g7=O y9=W y2=O o8=B"], 'bLBBlBLbl', 1],
        [["r9=B g7=O y9=W b8=B y4=O"], 'LBlBLbl', 1],
        [["g9=B o9=O y3=W r8=B y8=O"], 'BLBlBLbl', 1],
        [["b9=O o7=B y1=W g8=B y6=O"], 'BBLBlBLbl', 1],
        [["r7=O b7=B y7=W o8=B y2=O"], 'bLBlBLbl', 1],
        [["g9=B o9=O y3=W r8=O y8=B"], 'BBdBBDbdBD', 1],
        [["b9=O o7=B y1=W g8=O y6=B"], 'bdBBDbdBD', 1],
        [["r7=O b7=B y7=W y2=B o8=O"], 'dBBDbdBD', 1],
        [["r9=B g7=O y9=W y4=B b8=O"], 'BdBBDbdBD', 1],
        [["b9=O o7=B y1=W r8=O y8=B"], 'BBdbDbdBD', 1],
        [["r7=O b7=B y7=W y6=B g8=O"], 'bdbDbdBD', 1],
        [["r9=B g7=O y9=W y2=B o8=O"], 'dbDbdBD', 1],
        [["g9=B o9=O y3=W b8=O y4=B"], 'BdbDbdBD', 1],
        [["r9=O g7=W y9=B y2=B o8=O"], 'bdBBDBBdBD', 1],
        [["g9=O o9=W y3=B y4=B b8=O"], 'dBBDBBdBD', 1],
        [["o7=O b9=W y1=B y8=B r8=O"], 'BdBBDBBdBD', 1],
        [["b7=O r7=W y7=B y6=B g8=O"], 'BBdBBDBBdBD', 1],
        [["r9=O g7=W y9=B y4=B b8=O"], 'bdbDBBdBD', 1],
        [["g9=O o9=W y3=B y8=B r8=O"], 'dbDBBdBD', 1],
        [["o7=O b9=W y1=B y6=B g8=O"], 'BdbDBBdBD', 1],
        [["b7=O r7=W y7=B y2=B o8=O"], 'BBdbDBBdBD', 1],
        [["b9=B o7=W y1=O y6=O g8=B"], 'bLBBlBBLbl', 1],
        [["r7=B b7=W y7=O y2=O o8=B"], 'LBBlBBLbl', 1],
        [["g7=B r9=W y9=O y4=O b8=B"], 'BLBBlBBLbl', 1],
        [["o9=B g9=W y3=O y8=O r8=B"], 'BBLBBlBBLbl', 1],
        [["b9=B o7=W y1=O y8=O r8=B"], 'bLBlBBLbl', 1],
        [["r7=B b7=W y7=O y6=O g8=B"], 'LBlBBLbl', 1],
        [["g7=B r9=W y9=O y2=O o8=B"], 'BLBlBBLbl', 1],
        [["o9=B g9=W y3=O y4=O b8=B"], 'BBLBlBBLbl', 1],
        [["r7=B b7=W y7=O y6=B g8=O"], 'BBdbDbdbD', 1],
        [["g7=B r9=W y9=O y2=B o8=O"], 'bdbDbdbD', 1],
        [["o9=B g9=W y3=O y4=B b8=O"], 'dbDbdbD', 1],
        [["b9=B o7=W y1=O y8=B r8=O"], 'BdbDbdbD', 1],
        [["b9=B o7=W y1=O y6=B g8=O"], 'dbD', 1],
        [["r7=B b7=W y7=O y2=B o8=O"], 'BdbD', 1],
        [["g7=B r9=W y9=O y4=B b8=O"], 'BBdbD', 1],
        [["o9=B g9=W y3=O y8=B r8=O"], 'bdbD', 1],
        [["b7=O r7=W y7=B y2=O o8=B"], 'LBlBLBl', 1],
        [["r9=O g7=W y9=B y4=O b8=B"], 'BLBlBLBl', 1],
        [["g9=O o9=W y3=B y8=O r8=B"], 'BBLBlBLBl', 1],
        [["o7=O b9=W y1=B y6=O g8=B"], 'bLBlBLBl', 1],
        [["o7=O b9=W y1=B y8=O r8=B"], 'LBl', 1],
        [["b7=O r7=W y7=B y6=O g8=B"], 'BLBl', 1],
        [["r9=O g7=W y9=B y2=O o8=B"], 'BBLBl', 1],
        [["g9=O o9=W y3=B y4=O b8=B"], 'bLBl', 1],
      ] },
    ],
  },
];

// Compile every table pattern once at load (string form above stays readable;
// runtime uses fast [faceArray, index, colour] tuples).
for (const branch of WHITE_CROSS) {
  branch.solved = compileWhen(branch.solved);
  branch.cases = branch.cases.map(([when, moves]) => ({ when: compileWhen(when), moves }));
}
for (const pair of SECOND_LAYER) {
  for (const stage of pair.stages) {
    stage.cases = stage.cases.map(([when, moves, brk]) => ({ when: compileWhen(when), moves, brk: !!brk }));
  }
}
const F2L_GUARD = { f2l_rb: f2l_rb, f2l_rg: f2l_rg, f2l_go: f2l_go, f2l_bo: f2l_bo };

// Insert one white-cross edge (n = which of the 4 edges). No-op if it is already
// placed; otherwise apply the first matching case's moves.
function goWC(n) {
  const branch = WHITE_CROSS[n];
  if (!branch || whenMatches(branch.solved)) return;
  for (const c of branch.cases) {
    if (whenMatches(c.when)) { applyMoves(c.moves); return; }
  }
}

// Insert one second-layer pair (n = which of the 4 pairs). No-op if already
// placed. Otherwise run the stages in order; within a stage the first matching
// case fires, then we advance to the next stage — unless that case is terminal
// (it completed the pair), which ends the call. Earlier stages deliberately fall
// through so a later stage re-reads the now-mutated cube.
function goL2(n) {
  const pair = SECOND_LAYER[n];
  if (!pair || F2L_GUARD[pair.guard]()) return;
  for (const stage of pair.stages) {
    for (const c of stage.cases) {
      if (whenMatches(c.when)) { applyMoves(c.moves); if (c.brk) return; break; }
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
function abortInvalid() { copyState(WORK, INPUT_BACKUP); alert('Invalid configuration'); Invalid = true; }

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

// True when the 54-char string holds exactly 9 stickers of each cube colour.
function hasValidColorCounts(s) {
  return s.length === 54 && ['R', 'B', 'W', 'G', 'O', 'Y'].every((c) => s.split(c).length - 1 === 9);
}

function All_Face_solve() {
  const s = document.getElementById('textarea').value;
  if (!hasValidColorCounts(s)) { alert('Invalid configuration'); return; }

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

/* =============================================================================
 * UI / DOM layer — the only code that touches the page.
 * ========================================================================== */

// Reset all six faces to a solved cube.
function setSolved() {
  for (let i = 1; i <= 9; i++) { r[i] = 'R'; w[i] = 'W'; o[i] = 'O'; y[i] = 'Y'; b[i] = 'B'; g[i] = 'G'; }
}

// Paint the clicked sticker with the currently selected colour.
function buttonClick(click_id) {
  if (selected_color === '0') return;
  document.getElementById(click_id).className = 'button ' + selected_color;
  FACES[click_id[0].toLowerCase()][parseInt(click_id[1], 10)] = selected_color;
}

// Choose the paint colour from the picker.
function pickColor(click_id) {
  selected_color = click_id;
  document.getElementById('selectedColor').className = 'button ' + click_id;
}

// Serialise the painted cube into the 54-char input string (order R B W G O Y).
function print() {
  let s = '';
  for (const face of [r, b, w, g, o, y]) for (let i = 1; i <= 9; i++) s += face[i];
  if (!s.includes('0')) document.getElementById('textarea').value = s;
}

// Load a 54-char string into the cube (must have 9 of each colour and correct centres).
function stringInput() {
  const s = document.getElementById('textarea').value.toUpperCase();
  if (hasValidColorCounts(s) && s[4] === 'R' && s[13] === 'B' && s[22] === 'W' && s[31] === 'G' && s[40] === 'O' && s[49] === 'Y') {
    const faces = [r, b, w, g, o, y];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 9; i++) faces[f][i + 1] = s[f * 9 + i];
    paste();
  } else {
    alert('Invalid Input');
  }
}

// Render the solution text (grouped 4 moves per line, with move count + colour).
function printSoln() {
  if (rev === true) reverse();
  recompress();
  let str = '';
  for (let i = 0; i < minimum.length; i++) {
    if (i % 4 === 0 && i !== 0) str += '\n';
    str += minimum[i] + ' ';
  }
  str += '\nNo of Moves = ' + String(minimum.length) + '\n' + col;
  if (minimum.length > 0) document.getElementById('text').innerText = str;
}

// Invert the solution (reverse order, swap turn <-> prime) for the "reverse" toggle.
function reverse() {
  let temp = '';
  for (let i = minimum.length - 1; i >= 0; i--) temp += minimum[i] > 'a' ? minimum[i].toUpperCase() : minimum[i].toLowerCase();
  minimum = temp;
}
function Rev() {
  const showing = document.getElementById('text').innerText !== '';
  if (document.getElementById('checkbox').checked === true) {
    rev = false;
    if (showing) { reverse(); printSoln(); }
  } else {
    rev = true;
    if (showing) printSoln();
  }
}

// Solve the painted/typed cube.
function submit() {
  document.getElementById('text').innerText = '';
  Invalid = false;
  startT = new Date().getTime();
  copyState(INPUT_BACKUP, WORK);
  print();
  All_Face_solve();
  if (Invalid === true) return;
  printSoln();
  paste();
}

function clearAll() { location.reload(); }

// Repaint every tile from the current cube state (centres keep their fixed-centre class).
function paste() {
  for (const letter of Object.keys(FACES)) {
    const face = FACES[letter];
    const id = letter.toUpperCase();
    for (let i = 1; i <= 9; i++) {
      document.getElementById(id + i).className = (i === 5 ? 'button center ' : 'button ') + face[i];
    }
  }
}

// A move button on the move pad turns the cube and repaints (reuses TURNS).
function Mclick(click_id) {
  const move = TURNS[click_id[1]];
  if (move) { move(); paste(); }
}

// Apply 100 random turns to a solved cube.
function Scramble() {
  document.getElementById('text').innerText = '';
  setSolved();
  const moves = [B, U, F, D, R, L, Rs, Ls, Fs, Us, Bs, Ds];
  for (let i = 0; i < 100; i++) moves[Math.floor(Math.random() * 12)]();
  paste();
}

function SolvedState() {
  document.getElementById('text').innerText = '';
  setSolved();
  paste();
}

function help() {
  const s = '   ';
  const S = '                      ';
  let A = '\n';
  A += S + 'R7 R8 R9\n' + S + 'R4 R5 R6\n' + S + 'R1 R2 R3\n\n';
  A += s + 'B7 B4 B1' + s + 'W1 W2 W3' + s + 'G1 G4 G7\n';
  A += s + 'B8 B5 B2' + s + 'W4 W5 W6' + s + 'G2 G5 G8\n';
  A += s + 'B9 B6 B3' + s + 'W7 W8 W9' + s + 'G3 G6 G9\n\n';
  A += S + 'O1 O2 O3\n' + S + 'O4 O5 O6\n' + S + 'O7 O8 O9\n\n';
  A += S + 'Y1 Y2 Y3\n' + S + 'Y4 Y5 Y6\n' + S + 'Y7 Y8 Y9\n\n';
  A += 'HOLD THE CUBE WITH THE WHITE CENTER FACING YOU, RED CENTER POINTING UP AND GREEN CENTER POINTING RIGHT AS SHOWN ABOVE AND IN THE IMAGE\n\n';
  A += 'NOW ENTER THE THE FACE VALUE ( R / B / W / G / O / Y) ONLY\n\n';
  A += 'ENTER STARTING FROM R1 TO R9 THEN B1 TO B9 THEN W1 TO W9 THEN G1 TO G9 THEN O1 TO O9 THEN Y1 TO Y9 RESPECTIVELY';
  alert(A);
}
function help2() {
  alert('When ON, the solution will be the set of moves that will transform a Solved Cube into the Input State');
}
