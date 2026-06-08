// Shared core for the solver test harness: loads a target Rubik.js (or a
// comma-separated list of files concatenated in one global scope) into a vm
// sandbox with mocked DOM/Date, and drives the real solver over scrambles.
//
// The contract being protected: the SOLVER ALGORITHM is unchanged. Same
// scrambles in -> byte-identical solutions out. The code may be rewritten
// completely; this proves behaviour did not drift.

import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';

// The solver, split across modules, loaded in dependency order (the page loads
// these same files in the same order). Pass as a single comma-joined target.
export const SOLVER = 'js/cube.js,js/predicates.js,js/tables.js,js/solver.js,js/ui.js';

// The 12 quarter/prime turns, mapped to the global function names the cube exposes.
export const MOVE_FNS = ['R', 'Rs', 'L', 'Ls', 'U', 'Us', 'D', 'Ds', 'F', 'Fs', 'B', 'Bs'];

// Hand-picked deterministic scrambles that target known solver paths.
export const NAMED_SCRAMBLES = {
  solved: [],
  single_R: ['R'],
  single_Fprime: ['Fs'],
  short_1: ['R', 'U', 'F'],
  short_2: ['L', 'Ds', 'B', 'Us'],
  sexy: ['R', 'U', 'Rs', 'Us'],
  sexy_x2: ['R', 'U', 'Rs', 'Us', 'R', 'U', 'Rs', 'Us'],
  tperm_ish: ['R', 'U', 'Rs', 'Us', 'Rs', 'F', 'R', 'F'],
  medium_1: ['F', 'R', 'U', 'Bs', 'L', 'Ds', 'F', 'R'],
  medium_2: ['U', 'R', 'D', 'L', 'F', 'B', 'Rs', 'Us'],
  medium_3: ['D', 'Fs', 'R', 'U', 'Ls', 'B', 'D', 'Rs', 'U'],
  long_1: ['R', 'U', 'F', 'L', 'D', 'B', 'Rs', 'Us', 'Fs', 'Ls', 'Ds', 'Bs'],
  long_2: ['F', 'F', 'R', 'R', 'U', 'U', 'L', 'L', 'B', 'B', 'D', 'D'],
  long_3: ['R', 'L', 'U', 'D', 'F', 'B', 'R', 'L', 'U', 'D', 'F', 'B', 'Rs', 'Us'],
};

// Solution char -> move-fn. After transform(), solutions hold only R/L/U/D/F/B
// and their lowercase primes; no X/Y remain.
export const SOLUTION_CHAR_TO_FN = {
  R: 'R', L: 'L', U: 'U', D: 'D', F: 'F', B: 'B',
  r: 'Rs', l: 'Ls', u: 'Us', d: 'Ds', f: 'Fs', b: 'Bs',
};

// Deterministic PRNG (mulberry32) so "random" scrambles are fully reproducible.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genScrambles(count, seed) {
  const rnd = mulberry32(seed);
  const out = {};
  for (let i = 0; i < count; i++) {
    const len = 6 + Math.floor(rnd() * 19); // 6..24 moves
    const moves = [];
    for (let j = 0; j < len; j++) moves.push(MOVE_FNS[Math.floor(rnd() * MOVE_FNS.length)]);
    out[`rnd_${seed}_${i}`] = moves;
  }
  return out;
}

function makeSandbox() {
  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) elements.set(id, { value: '', innerText: '', className: '', checked: false, id });
    return elements.get(id);
  };
  const alerts = [];
  // Freeze time so the 800ms invalid-config timeout never fires; the full
  // deterministic 6x24x24 search runs regardless of machine speed.
  class FrozenDate { getTime() { return 0; } }
  const sandbox = {
    document: { getElementById: getEl },
    alert: (msg) => alerts.push(String(msg)),
    Date: FrozenDate,
    // The UI's notify() uses these; harness never hits that path for valid cubes,
    // but provide them so it can't throw if it ever does.
    setTimeout: () => 0, clearTimeout: () => {},
    Math, parseInt, parseFloat, String, Number, Array, isNaN, console,
  };
  sandbox.__elements = elements;
  sandbox.__alerts = alerts;
  vm.createContext(sandbox);
  return sandbox;
}

// target := one path or "a.js,b.js" — files concatenated in one global scope.
export function loadCube(target) {
  const files = target.split(',').map((f) => path.resolve(f.trim()));
  const code = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n;\n');
  const sandbox = makeSandbox();
  vm.runInContext(code, sandbox, { filename: files[0] });
  return sandbox;
}

function solutionSolves(target, scrambleFns, solution) {
  const ctx = loadCube(target);
  ctx.SolvedState();
  for (const fn of scrambleFns) ctx[fn]();
  for (const ch of solution) {
    const fn = SOLUTION_CHAR_TO_FN[ch];
    if (!fn) return { ok: false, reason: `unknown solution char '${ch}'` };
    ctx[fn]();
  }
  return { ok: ctx.check_if_solved() === 1 };
}

export function runScramble(target, name, scrambleFns, verify = true) {
  const ctx = loadCube(target);
  ctx.SolvedState();
  for (const fn of scrambleFns) {
    if (typeof ctx[fn] !== 'function') throw new Error(`move fn ${fn} missing in ${target}`);
    ctx[fn]();
  }
  ctx.submit();

  const solution = ctx.minimum;
  const text = ctx.__elements.get('text')?.innerText ?? '';
  const v = !verify || ctx.Invalid ? { ok: ctx.Invalid ? null : undefined } : solutionSolves(target, scrambleFns, solution);

  return {
    name,
    scramble: scrambleFns.join(' '),
    invalid: !!ctx.Invalid,
    color: ctx.col ?? '',
    moveCount: solution.length,
    solution,
    text,
    solves: v.ok,
    verifyReason: v.reason,
  };
}

export function runSet(target, scrambleSet, verify = true) {
  const results = {};
  for (const [name, fns] of Object.entries(scrambleSet)) {
    results[name] = runScramble(target, name, fns, verify);
  }
  return results;
}

export const COMPARE_KEYS = ['invalid', 'color', 'moveCount', 'solution'];

export function diff(a, b, keys = ['invalid', 'color', 'moveCount', 'solution', 'text', 'solves']) {
  const out = [];
  for (const name of Object.keys(a)) {
    const ga = a[name], gb = b[name];
    if (!gb) { out.push(`${name}: MISSING in B`); continue; }
    for (const key of keys) {
      if (JSON.stringify(ga[key]) !== JSON.stringify(gb[key])) {
        out.push(`${name}.${key}:\n    A: ${JSON.stringify(ga[key])}\n    B: ${JSON.stringify(gb[key])}`);
      }
    }
  }
  return out;
}
