// =============================================================================
// UI / DOM layer — the only code that touches the page. Wires the buttons,
// pickers, text I/O, and move pad to the solver. Depends on every other module.
// =============================================================================
'use strict';

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
    notify('Invalid input — need 54 letters (9 each of R B W G O Y) with centres in place', 'error');
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

// Instructions for the string-input field.
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
// Explains the reverse-solution toggle.
function help2() {
  openModal('Reverse solution', '<p>When this is <b>on</b>, the solution becomes the moves that turn a ' +
    '<b>solved</b> cube <b>into</b> your scrambled input — the inverse of the normal solution.</p>');
}

// Esc closes the modal (guarded: the test harness's mocked document has no addEventListener).
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}
