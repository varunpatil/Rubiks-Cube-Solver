'use strict';

/* =============================================================================
 * Cube-state predicates, installed as methods on Cube. They answer the questions
 * the solver asks while it works: is this F2L slot done? is a last-layer corner
 * present? is each beginner-method stage complete? Each returns 1 or 0.
 * ========================================================================== */

// F2L pair solved? (white + the two side colours of the corner/edge in place)
Cube.prototype.f2l_rb = function () { const { r, w, b } = this.faces; return w[1] === 'W' && r[1] === 'R' && r[4] === 'R' && b[1] === 'B' && b[4] === 'B' ? 1 : 0; };
Cube.prototype.f2l_rg = function () { const { r, w, g } = this.faces; return w[3] === 'W' && r[3] === 'R' && r[6] === 'R' && g[1] === 'G' && g[4] === 'G' ? 1 : 0; };
Cube.prototype.f2l_bo = function () { const { w, o, b } = this.faces; return w[7] === 'W' && o[1] === 'O' && o[4] === 'O' && b[3] === 'B' && b[6] === 'B' ? 1 : 0; };
Cube.prototype.f2l_go = function () { const { w, o, g } = this.faces; return w[9] === 'W' && g[3] === 'G' && g[6] === 'G' && o[3] === 'O' && o[6] === 'O' ? 1 : 0; };

// Last-layer corner present in its slot (any orientation)?
Cube.prototype.rby = function () { const { r, b, y } = this.faces; const s = '' + r[7] + b[7] + y[7]; return s.includes('R') && s.includes('B') && s.includes('Y') ? 1 : 0; };
Cube.prototype.rgy = function () { const { r, g, y } = this.faces; const s = '' + r[9] + g[7] + y[9]; return s.includes('R') && s.includes('G') && s.includes('Y') ? 1 : 0; };
Cube.prototype.ogy = function () { const { o, g, y } = this.faces; const s = '' + o[9] + g[9] + y[3]; return s.includes('O') && s.includes('G') && s.includes('Y') ? 1 : 0; };
Cube.prototype.oby = function () { const { o, b, y } = this.faces; const s = '' + o[7] + b[9] + y[1]; return s.includes('O') && s.includes('B') && s.includes('Y') ? 1 : 0; };

// Beginner-method stage checks, each building on the previous.
Cube.prototype.check_white_cross = function () {
  const { r, w, o, b, g } = this.faces;
  return w[2] === 'W' && w[4] === 'W' && w[6] === 'W' && w[8] === 'W' &&
    r[2] === 'R' && g[2] === 'G' && o[2] === 'O' && b[2] === 'B' ? 1 : 0;
};
Cube.prototype.check_white_face = function () {
  const { r, w, o, b, g } = this.faces;
  return w[1] === 'W' && w[3] === 'W' && w[7] === 'W' && w[9] === 'W' &&
    r[1] === 'R' && r[3] === 'R' && g[1] === 'G' && g[3] === 'G' &&
    b[1] === 'B' && b[3] === 'B' && o[1] === 'O' && o[3] === 'O' &&
    this.check_white_cross() === 1 ? 1 : 0;
};
Cube.prototype.check_layer2 = function () {
  const { r, o, b, g } = this.faces;
  return this.check_white_face() === 1 && r[4] === 'R' && r[6] === 'R' &&
    g[4] === 'G' && g[6] === 'G' && o[4] === 'O' && o[6] === 'O' &&
    b[4] === 'B' && b[6] === 'B' ? 1 : 0;
};
Cube.prototype.check_yellow_cross = function () {
  const { y } = this.faces;
  return this.check_layer2() === 1 && y[2] === 'Y' && y[4] === 'Y' && y[6] === 'Y' && y[8] === 'Y' ? 1 : 0;
};
Cube.prototype.check_ORyellow_cross = function () {
  const { r, o, b, g } = this.faces;
  return this.check_yellow_cross() === 1 && r[8] === 'R' && o[8] === 'O' && g[8] === 'G' && b[8] === 'B' ? 1 : 0;
};
Cube.prototype.check_corner = function () {
  return this.check_ORyellow_cross() && this.rby() && this.rgy() && this.ogy() && this.oby() ? 1 : 0;
};
Cube.prototype.check_if_solved = function () { return this.isSolved() ? 1 : 0; };
