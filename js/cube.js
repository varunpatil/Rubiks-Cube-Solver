'use strict';

/* =============================================================================
 * Cube — the cube's state and geometry, with no knowledge of the DOM or the
 * solver. Everything that used to be 18 global arrays + a wall of manual sticker
 * swaps now lives behind this one cloneable object.
 *
 * Model: six faces keyed by colour letter (r w o y b g). Each face is a 10-slot
 * array indexed 1..9 to match the on-screen net (slot 0 is unused, slot 5 is the
 * fixed centre). A sticker holds a colour letter ('R','W','O','Y','B','G') or
 * '0' while unpainted.
 *
 * Moves: F B R L U D turn a face clockwise; primed turns Fs Bs Rs Ls Us Ds are
 * the same turn three times; X Y are whole-cube rotations. Every turn records its
 * letter in `this.log` (uppercase = CW, lowercase via the prime turns). A turn is
 * defined as DATA — a list of 4-cycles of sticker positions — applied by _run().
 * ========================================================================== */

const CENTERS = { r: 'R', w: 'W', o: 'O', y: 'Y', b: 'B', g: 'G' };

// Each move is a set of 4-cycles over sticker positions ('<face><index>').
// A cycle [A,B,C,D] means A<-B, B<-C, C<-D, D<-(old A) — the temp-swap the
// original moves did by hand. Generated from the verified moves by test/gen-cycles.mjs.
const MOVE_CYCLES = {
  F: [['w8', 'w6', 'w2', 'w4'], ['w7', 'w9', 'w3', 'w1'], ['o3', 'g1', 'r1', 'b3'], ['o2', 'g2', 'r2', 'b2'], ['o1', 'g3', 'r3', 'b1']],
  B: [['y7', 'y9', 'y3', 'y1'], ['y4', 'y8', 'y6', 'y2'], ['r9', 'g9', 'o7', 'b7'], ['r8', 'g8', 'o8', 'b8'], ['r7', 'g7', 'o9', 'b9']],
  R: [['w3', 'o3', 'y3', 'r9'], ['w6', 'o6', 'y6', 'r6'], ['w9', 'o9', 'y9', 'r3'], ['g3', 'g9', 'g7', 'g1'], ['g2', 'g6', 'g8', 'g4']],
  L: [['r7', 'y1', 'o1', 'w1'], ['r4', 'y4', 'o4', 'w4'], ['r1', 'y7', 'o7', 'w7'], ['b7', 'b9', 'b3', 'b1'], ['b8', 'b6', 'b2', 'b4']],
  U: [['g1', 'y9', 'b7', 'w1'], ['g4', 'y8', 'b4', 'w2'], ['g7', 'y7', 'b1', 'w3'], ['r1', 'r3', 'r9', 'r7'], ['r6', 'r8', 'r4', 'r2']],
  D: [['b9', 'y3', 'g3', 'w7'], ['b6', 'y2', 'g6', 'w8'], ['b3', 'y1', 'g9', 'w9'], ['o7', 'o9', 'o3', 'o1'], ['o4', 'o8', 'o6', 'o2']],
  // Whole-cube rotations also turn a face first (see X/Y); these are the extra
  // centre/edge cycles that re-label the orientation.
  X_CENTERS: [['o5', 'y5', 'r5', 'w5'], ['o2', 'y2', 'r8', 'w2'], ['o8', 'y8', 'r2', 'w8']],
  Y_CENTERS: [['g5', 'y5', 'b5', 'w5'], ['g2', 'y6', 'b8', 'w4'], ['g8', 'y4', 'b2', 'w6']],
};

// Pre-parse 'w8' -> ['w', 8] once so moves don't parse strings in the hot loop.
const PARSED_CYCLES = {};
for (const [move, cycles] of Object.entries(MOVE_CYCLES)) {
  PARSED_CYCLES[move] = cycles.map((cyc) => cyc.map((p) => [p[0], Number(p.slice(1))]));
}

// Solution letter -> the turn method that plays it (lowercase = prime).
const TURN_METHOD = { R: 'R', L: 'L', U: 'U', D: 'D', F: 'F', B: 'B', r: 'Rs', l: 'Ls', u: 'Us', d: 'Ds', f: 'Fs', b: 'Bs' };

class Cube {
  constructor() { this.reset(); }

  // Blank cube (unpainted) — matches the page's initial editor state.
  reset() {
    this.faces = {};
    for (const [letter, colour] of Object.entries(CENTERS)) {
      const face = new Array(10).fill('0');
      face[5] = colour;
      this.faces[letter] = face;
    }
    this.log = '';
  }

  // Fill every sticker to the solved cube.
  setSolved() {
    for (const [letter, colour] of Object.entries(CENTERS)) {
      for (let i = 1; i <= 9; i++) this.faces[letter][i] = colour;
    }
  }

  faceOf(letter) { return this.faces[letter]; }

  // ---- Move engine ----------------------------------------------------------
  _run(cycles) {
    for (const cyc of cycles) {
      const [f0, i0] = cyc[0];
      const first = this.faces[f0][i0];
      for (let k = 0; k < cyc.length - 1; k++) {
        const [fa, ia] = cyc[k];
        const [fb, ib] = cyc[k + 1];
        this.faces[fa][ia] = this.faces[fb][ib];
      }
      const [fl, il] = cyc[cyc.length - 1];
      this.faces[fl][il] = first;
    }
  }

  F() { this.log += 'F'; this._run(PARSED_CYCLES.F); }
  B() { this.log += 'B'; this._run(PARSED_CYCLES.B); }
  R() { this.log += 'R'; this._run(PARSED_CYCLES.R); }
  L() { this.log += 'L'; this._run(PARSED_CYCLES.L); }
  U() { this.log += 'U'; this._run(PARSED_CYCLES.U); }
  D() { this.log += 'D'; this._run(PARSED_CYCLES.D); }

  // Primed (counter-clockwise) turns = the clockwise turn three times.
  Fs() { this.F(); this.F(); this.F(); }
  Bs() { this.B(); this.B(); this.B(); }
  Rs() { this.R(); this.R(); this.R(); }
  Ls() { this.L(); this.L(); this.L(); }
  Us() { this.U(); this.U(); this.U(); }
  Ds() { this.D(); this.D(); this.D(); }

  // Whole-cube rotations: turn a face, then relabel orientation. The inner turns
  // record themselves in the log exactly as standalone turns would.
  X() { this.R(); this.Ls(); this._run(PARSED_CYCLES.X_CENTERS); }
  Y() { this.U(); this.Ds(); this._run(PARSED_CYCLES.Y_CENTERS); }

  // Play a solution string (e.g. 'URur').
  applyMoves(seq) { for (const c of seq) this[TURN_METHOD[c]](); }

  // ---- Snapshots (replace the *o/*x backup arrays + copyState) --------------
  snapshot() {
    const snap = {};
    for (const letter of Object.keys(this.faces)) snap[letter] = this.faces[letter].slice();
    return snap;
  }
  restore(snap) {
    for (const letter of Object.keys(snap)) {
      for (let i = 1; i <= 9; i++) this.faces[letter][i] = snap[letter][i];
    }
  }
  clone() { const c = new Cube(); c.restore(this.snapshot()); return c; }

  // ---- Serialisation (54 chars, face order R B W G O Y) ---------------------
  toString() {
    let s = '';
    for (const letter of ['r', 'b', 'w', 'g', 'o', 'y']) for (let i = 1; i <= 9; i++) s += this.faces[letter][i];
    return s;
  }
  // Load a 54-char string; returns false (and leaves the cube untouched) unless it
  // has 9 of each colour and the centres are in their canonical positions.
  fromString(s) {
    const t = s.toUpperCase();
    if (!Cube.hasValidColorCounts(t)) return false;
    if (!(t[4] === 'R' && t[13] === 'B' && t[22] === 'W' && t[31] === 'G' && t[40] === 'O' && t[49] === 'Y')) return false;
    const order = ['r', 'b', 'w', 'g', 'o', 'y'];
    for (let face = 0; face < 6; face++) for (let i = 0; i < 9; i++) this.faces[order[face]][i + 1] = t[face * 9 + i];
    return true;
  }

  isSolved() {
    for (const [letter, colour] of Object.entries(CENTERS)) {
      for (let i = 1; i <= 9; i++) if (this.faces[letter][i] !== colour) return false;
    }
    return true;
  }

  // True when a 54-char string has exactly 9 stickers of each cube colour.
  static hasValidColorCounts(s) {
    return s.length === 54 && ['R', 'B', 'W', 'G', 'O', 'Y'].every((c) => s.split(c).length - 1 === 9);
  }
}

// Letter -> turn method, exposed for the UI move pad.
Cube.TURN_METHOD = TURN_METHOD;
