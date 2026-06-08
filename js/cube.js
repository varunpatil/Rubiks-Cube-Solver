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

// ---- Move application -------------------------------------------------------
// Map a solution letter to its turn function (lowercase = prime); applyMoves
// plays a whole sequence string.
const TURNS = { R: R, L: L, U: U, D: D, F: F, B: B, r: Rs, l: Ls, u: Us, d: Ds, f: Fs, b: Bs };
function applyMoves(seq) { for (const c of seq) TURNS[c](); }

// ---- Input validation -------------------------------------------------------
// True when the 54-char string holds exactly 9 stickers of each cube colour.
function hasValidColorCounts(s) {
  return s.length === 54 && ['R', 'B', 'W', 'G', 'O', 'Y'].every((c) => s.split(c).length - 1 === 9);
}
