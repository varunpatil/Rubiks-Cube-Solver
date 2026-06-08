'use strict';

/* =============================================================================
 * UI / DOM layer — the only code that touches the page. Owns the single live
 * Cube, wires the buttons / pickers / text I/O / move pad to it and the solver,
 * and exposes the thin global names the inline onclick handlers (and the test
 * harness) call. Depends on every other module.
 * ========================================================================== */

const cube = new Cube();
let selected_color = '0';
let rev = false; // "reverse solution" toggle

// ---- In-page notifications (replace old-school alert dialogs) ---------------
let toastTimer = 0;
// Brief auto-dismissing message, bottom-centre, for transient errors.
function notify(message, kind) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.className = 'toast show' + (kind ? ' toast-' + kind : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3400);
}
// Modal dialog for longer content (instructions / explanations).
function openModal(title, bodyHtml) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  modal.className = 'modal-overlay open';
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.className = 'modal-overlay';
}

// ---- Editor ----------------------------------------------------------------
// Paint the clicked sticker with the currently selected colour.
function buttonClick(click_id) {
  if (selected_color === '0') return;
  document.getElementById(click_id).className = 'button ' + selected_color;
  cube.faceOf(click_id[0].toLowerCase())[parseInt(click_id[1], 10)] = selected_color;
}
// Choose the paint colour from the picker.
function pickColor(click_id) {
  selected_color = click_id;
  document.getElementById('selectedColor').className = 'button ' + click_id;
}
// Push the painted/typed cube string into the input box (only when complete).
function print() {
  const s = cube.toString();
  if (!s.includes('0')) document.getElementById('textarea').value = s;
}
// Load a 54-char string into the cube, or toast why it was rejected.
function stringInput() {
  if (cube.fromString(document.getElementById('textarea').value)) {
    paste();
  } else {
    notify('Invalid input — need 54 letters (9 each of R B W G O Y) with centres in place', 'error');
  }
}
// Repaint every tile from the current cube state (centres keep their fixed class).
function paste() {
  for (const letter of Object.keys(cube.faces)) {
    const face = cube.faceOf(letter);
    const id = letter.toUpperCase();
    for (let i = 1; i <= 9; i++) {
      document.getElementById(id + i).className = (i === 5 ? 'button center ' : 'button ') + face[i];
    }
  }
}

// ---- Solve / solution output ------------------------------------------------
function submit() {
  document.getElementById('text').innerText = '';
  Invalid = false;
  print();
  All_Face_solve(cube, document.getElementById('textarea').value);
  if (Invalid === true) return;
  printSoln();
  paste();
}
// Render the solution text (grouped 4 moves per line, with move count + colour).
function printSoln() {
  if (rev === true) minimum = reverse(minimum);
  minimum = recompress(minimum);
  let str = '';
  for (let i = 0; i < minimum.length; i++) {
    if (i % 4 === 0 && i !== 0) str += '\n';
    str += minimum[i] + ' ';
  }
  str += '\nNo of Moves = ' + String(minimum.length) + '\n' + col;
  if (minimum.length > 0) document.getElementById('text').innerText = str;
}
// Invert a solution (reverse order, swap turn <-> prime) for the "reverse" toggle.
function reverse(seq) {
  let temp = '';
  for (let i = seq.length - 1; i >= 0; i--) temp += seq[i] > 'a' ? seq[i].toUpperCase() : seq[i].toLowerCase();
  return temp;
}
function Rev() {
  const showing = document.getElementById('text').innerText !== '';
  if (document.getElementById('checkbox').checked === true) {
    rev = false;
    if (showing) { minimum = reverse(minimum); printSoln(); }
  } else {
    rev = true;
    if (showing) printSoln();
  }
}

// ---- Cube manipulation ------------------------------------------------------
function clearAll() { location.reload(); }
// A move-pad button turns the cube and repaints.
function Mclick(click_id) {
  const method = Cube.TURN_METHOD[click_id[1]];
  if (method) { cube[method](); paste(); }
}
// Apply 100 random turns to a solved cube.
function Scramble() {
  document.getElementById('text').innerText = '';
  cube.setSolved();
  const moves = ['B', 'U', 'F', 'D', 'R', 'L', 'Rs', 'Ls', 'Fs', 'Us', 'Bs', 'Ds'];
  for (let i = 0; i < 100; i++) cube[moves[Math.floor(Math.random() * 12)]]();
  paste();
}
function SolvedState() {
  document.getElementById('text').innerText = '';
  cube.setSolved();
  paste();
}

// ---- Help dialogs -----------------------------------------------------------
function help() {
  openModal('Entering your cube', [
    '<p>Hold the cube with the <b style="color:#f4f6fb">white</b> centre facing you, ',
    '<b style="color:#ef4444">red</b> centre on top, and <b style="color:#22c55e">green</b> centre on the right.</p>',
    '<p>Type 54 colour letters (<code>R B W G O Y</code>), reading each face left&rarr;right, ',
    'top&rarr;bottom, in this face order:</p>',
    '<p class="modal-order">Red &middot; Blue &middot; White &middot; Green &middot; Orange &middot; Yellow</p>',
    '<p>Each face is numbered 1&ndash;9 with 5 the fixed centre. Prefer clicking? ',
    'Skip the box entirely and just paint the tiles on the net.</p>',
  ].join(''));
}
function help2() {
  openModal('Reverse solution', '<p>When this is <b>on</b>, the solution becomes the moves that turn a ' +
    '<b>solved</b> cube <b>into</b> your scrambled input — the inverse of the normal solution.</p>');
}

// Esc closes the modal (guarded: the test harness's mocked document has no addEventListener).
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// ---- Global shims so the test harness can drive the cube by move name -------
// (The page's inline onclick handlers above are already globals; these expose the
// 12 turns + a couple of queries the harness invokes.)
function R() { cube.R(); } function Rs() { cube.Rs(); }
function L() { cube.L(); } function Ls() { cube.Ls(); }
function U() { cube.U(); } function Us() { cube.Us(); }
function D() { cube.D(); } function Ds() { cube.Ds(); }
function F() { cube.F(); } function Fs() { cube.Fs(); }
function B() { cube.B(); } function Bs() { cube.Bs(); }
function check_if_solved() { return cube.check_if_solved(); }
