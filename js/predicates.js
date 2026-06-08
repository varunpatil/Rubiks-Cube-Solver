// =============================================================================
// Cube-state predicates: F2L slots, last-layer corners, and per-stage
// completion checks the solver tests against. (Depends on the face arrays and
// FACES from cube.js.)
// =============================================================================
'use strict';

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
