// One-time migration tool: parse the ORIGINAL goWC(n)/goL2(n) source and emit
// clean data tables. The giants are pure "sticker-pattern -> move-sequence"
// lookups; this converts ~2100 lines of copy-pasted if/else ladders into
// compact, readable tables that an interpreter walks.
//
// The output is verified equivalent by test/compare.mjs (hundreds of scrambles),
// so any parser imperfection is caught. This tool can be deleted afterwards.
//
//   node test/transpile.mjs > test/_tables.generated.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'Rubik.original.js'), 'utf8');

// ---- extract a function body by name (balanced braces) ----
function funcBody(name) {
  const start = SRC.indexOf(`function ${name}(n)`);
  if (start < 0) throw new Error(`${name} not found`);
  let i = SRC.indexOf('{', start), depth = 0, open = i;
  for (; i < SRC.length; i++) {
    if (SRC[i] === '{') depth++;
    else if (SRC[i] === '}' && --depth === 0) break;
  }
  return SRC.slice(open + 1, i);
}

// ---- tokenizer ----
function tokenize(code) {
  const toks = [];
  const re = /\s+|\/\/[^\n]*|==|&&|\|\||!|[(){};]|'[^']'|[A-Za-z_]\w*|\d+|\[|\]/g;
  let m;
  while ((m = re.exec(code))) {
    const t = m[0];
    if (/^\s+$/.test(t) || t.startsWith('//')) continue;
    toks.push(t);
  }
  return toks;
}

// ---- recursive-descent parser ----
function parse(toks) {
  let p = 0;
  const peek = () => toks[p];
  const eat = (t) => { if (t && toks[p] !== t) throw new Error(`expected ${t} got ${toks[p]} @${p}`); return toks[p++]; };

  function parseStatements(stopAt) {
    const out = [];
    while (p < toks.length && peek() !== stopAt) out.push(parseStatement());
    return out;
  }
  function parseStatement() {
    const t = peek();
    if (t === 'if') return parseIfChain();
    if (t === '{') { eat('{'); const body = parseStatements('}'); eat('}'); return { type: 'block', body }; }
    if (t === 'break') { eat('break'); const label = eat(); eat(';'); return { type: 'break', label }; }
    // labeled block `p1: { ... }` — the ':' is stripped by the tokenizer, so an
    // identifier immediately followed by '{' is a label; skip it and parse the block.
    if (/^[A-Za-z_]\w*$/.test(t) && toks[p + 1] === '{') { p++; return parseStatement(); }
    // a move call: IDENT ( ) ;
    const name = eat();
    eat('('); eat(')'); eat(';');
    return { type: 'move', name };
  }
  function parseIfChain() {
    const arms = [];
    eat('if'); eat('(');
    arms.push({ cond: parseCondTokens(), body: parseStatement() });
    let elseBody = null;
    while (peek() === 'else') {
      eat('else');
      if (peek() === 'if') { eat('if'); eat('('); arms.push({ cond: parseCondTokens(), body: parseStatement() }); }
      else { elseBody = parseStatement(); break; }
    }
    return { type: 'ifchain', arms, elseBody };
  }
  // collect raw tokens until the matching ')' (depth 0), then parse boolean expr
  function parseCondTokens() {
    const raw = [];
    let depth = 0;
    while (p < toks.length) {
      const t = toks[p];
      if (t === '(') depth++;
      else if (t === ')') { if (depth === 0) break; depth--; }
      raw.push(t); p++;
    }
    eat(')');
    return parseBool(raw);
  }

  const stmts = parseStatements(undefined);
  return stmts;
}

// ---- boolean expression parser over a raw token list ----
function parseBool(toks) {
  let p = 0;
  const peek = () => toks[p];
  const parseOr = () => {
    const kids = [parseAnd()];
    while (peek() === '||') { p++; kids.push(parseAnd()); }
    return kids.length === 1 ? kids[0] : { op: 'or', kids };
  };
  const parseAnd = () => {
    const kids = [parsePrimary()];
    while (peek() === '&&') { p++; kids.push(parsePrimary()); }
    return kids.length === 1 ? kids[0] : { op: 'and', kids };
  };
  const parsePrimary = () => {
    if (peek() === '!') { p++; if (peek() === '(') { p++; const e = parseOr(); if (peek() === ')') p++; return { op: 'not', kid: e }; } }
    if (peek() === '(') { p++; const e = parseOr(); if (peek() === ')') p++; return e; }
    const id = toks[p++];
    if (peek() === '(') { // function call like f2l_rb()==0
      p++; if (peek() === ')') p++; if (peek() === '==') { p++; const num = toks[p++]; return { fcall: id, eq: num }; }
      return { fcall: id };
    }
    // sticker term: IDENT [ NUM ] == 'C'
    if (peek() === '[') { p++; const idx = toks[p++]; if (peek() === ']') p++; if (peek() === '==') p++; const lit = toks[p++]; return { term: [id, Number(idx), lit.replace(/'/g, '')] }; }
    // scalar comparison like n==0 (outer dispatch) — not a sticker, recorded but unused
    if (peek() === '==') { p++; const num = toks[p++]; return { var: id, eq: Number(num) }; }
    throw new Error(`bad primary near ${id} ${peek()}`);
  };
  return parseOr();
}

// ---- AST -> clause strings ----
const serTerm = ([f, i, c]) => `${f}${i}=${c}`;
const conjStr = (node) => {
  if (node.term) return serTerm(node.term);
  if (node.op === 'and') return node.kids.map(conjStr).join(' ');
  throw new Error('conjStr: unexpected ' + JSON.stringify(node));
};
function toClauses(node) {
  if (!node) return [];
  if (node.term) return [serTerm(node.term)];
  if (node.op === 'or') return [node.kids.map(conjStr).join('|')];
  if (node.op === 'and') {
    const terms = [], clauses = [];
    for (const k of node.kids) {
      if (k.term) terms.push(serTerm(k.term));
      else if (k.op === 'or') clauses.push(node => 0, k); // placeholder; handled below
    }
    // rebuild preserving: merged bare terms first, then each OR child as its own clause
    const out = [];
    if (terms.length) out.push(terms.join(' '));
    for (const k of node.kids) {
      if (k.op === 'or') out.push(toClauses(k)[0]);
      else if (k.op === 'and') out.push(...toClauses(k)); // nested AND -> flatten
    }
    return out;
  }
  throw new Error('toClauses: unexpected ' + JSON.stringify(node));
}

// ---- move name -> solution char (Rs->r, R->R) ----
const moveChar = (name) => (name.length === 1 ? name : name[0].toLowerCase());

// ---- flatten an if/else chain into ordered first-match cases ----
function flattenBody(body, prefix) {
  const stmts = body.type === 'block' ? body.body : [body];
  const chains = stmts.filter((s) => s.type === 'ifchain');
  if (chains.length) {
    if (!stmts.every((s) => s.type === 'ifchain')) throw new Error('mixed nested if + moves');
    return chains.flatMap((ch) => flattenChain(ch, prefix));
  }
  const moves = stmts.filter((s) => s.type === 'move').map((s) => moveChar(s.name)).join('');
  const brk = stmts.some((s) => s.type === 'break');
  return [{ when: prefix, moves, brk }];
}
function flattenChain(chain, prefix) {
  const cases = [];
  for (const arm of chain.arms) cases.push(...flattenBody(arm.body, prefix.concat(toClauses(arm.cond))));
  if (chain.elseBody) cases.push(...flattenBody(chain.elseBody, prefix));
  return cases;
}

// ============ goWC ============
function extractWhiteCross() {
  const stmts = parse(tokenize(funcBody('goWC')));
  // top-level: single ifchain on n==0/1/2/3
  const chain = stmts.find((s) => s.type === 'ifchain');
  const out = [];
  chain.arms.forEach((arm) => {
    // arm.body is a block containing the guard ifchain `if(!(solved)){ ladder }`
    const inner = (arm.body.body || []).find((s) => s.type === 'ifchain');
    const guard = inner.arms[0].cond; // {op:'not', kid:<solved>}
    const solved = toClauses(guard.kid);
    const ladder = inner.arms[0].body; // block with the case ladder
    const cases = flattenBody(ladder, []);
    out.push({ solved, cases });
  });
  return out;
}

// ============ goL2 ============
const STAGE_LABELS = ['firstToThird', 'secondToThird', 'pairUp', 'breakUp', 'badPairs', 'whiteOnTop'];
function extractSecondLayer() {
  const stmts = parse(tokenize(funcBody('goL2')));
  const chain = stmts.find((s) => s.type === 'ifchain');
  const out = [];
  chain.arms.forEach((arm) => {
    // arm.body block -> labeled block pN { if(fxx()==0){ stages } }
    // our parser treats `p1:` ... actually labels: `p1:` then `{...}` — handle below
    let block = arm.body;
    // unwrap any label syntax wasn't tokenized as label; the body is `{ ... }`
    const stageHost = findGuardBlock(block);
    const guardChain = stageHost.guardChain;
    const guardFn = guardChain.arms[0].cond.fcall;
    const stageStmts = (guardChain.arms[0].body.body || []).filter((s) => s.type === 'ifchain');
    if (stageStmts.length !== 6) throw new Error(`expected 6 stages, got ${stageStmts.length}`);
    const stages = stageStmts.map((ch, i) => ({ label: STAGE_LABELS[i], cases: flattenChain(ch, []) }));
    out.push({ guard: guardFn, stages });
  });
  return out;
}
// the pN: label appears as IDENT ';'? No — `p1:` is a label statement. Our tokenizer
// produced `p1` then `:`? ':' is not in our token regex, so it's dropped. So inside
// arm.body we see: block { ... } where the first meaningful child is the guard ifchain,
// possibly preceded by the bare `p1` identifier token turned into a move-parse error.
// To avoid that, locate the guard ifchain directly.
function findGuardBlock(node) {
  // walk to find an ifchain whose first arm cond is an fcall (f2l_xx()==0)
  let found = null;
  const visit = (n) => {
    if (!n || found) return;
    if (n.type === 'ifchain' && n.arms[0].cond && n.arms[0].cond.fcall) { found = n; return; }
    if (n.type === 'block') n.body.forEach(visit);
    if (n.type === 'ifchain') { n.arms.forEach((a) => visit(a.body)); visit(n.elseBody); }
  };
  visit(node);
  if (!found) throw new Error('guard block not found');
  return { guardChain: found };
}

// ---- serialize tables as readable JS ----
function ser(v) { return JSON.stringify(v); }
function emitWhiteCross(wc) {
  const colorName = ['blue-white', 'red-white', 'orange-white', 'green-white'];
  let s = 'const WHITE_CROSS = [\n';
  wc.forEach((b, i) => {
    s += `  { // ${i}: ${colorName[i]} edge\n`;
    s += `    solved: ${ser(b.solved)},\n    cases: [\n`;
    for (const c of b.cases) s += `      [${ser(c.when)}, '${c.moves}'],\n`;
    s += '    ],\n  },\n';
  });
  return s + '];\n';
}
function emitSecondLayer(sl) {
  const pairName = ['blue-red', 'red-green', 'orange-green', 'orange-blue'];
  let s = 'const SECOND_LAYER = [\n';
  sl.forEach((b, i) => {
    s += `  { // ${i}: ${pairName[i]} pair\n    guard: '${b.guard}',\n    stages: [\n`;
    for (const st of b.stages) {
      s += `      { name: '${st.name || st.label}', cases: [\n`;
      for (const c of st.cases) s += `        [${ser(c.when)}, '${c.moves}'${c.brk ? ', 1' : ''}],\n`;
      s += '      ] },\n';
    }
    s += '    ],\n  },\n';
  });
  return s + '];\n';
}

const wc = extractWhiteCross();
const sl = extractSecondLayer();
process.stderr.write(`goWC: ${wc.length} branches, cases per branch: ${wc.map((b) => b.cases.length).join(',')}\n`);
process.stderr.write(`goL2: ${sl.length} pairs, total cases: ${sl.map((b) => b.stages.reduce((a, s) => a + s.cases.length, 0)).join(',')}\n`);
process.stdout.write(emitWhiteCross(wc) + '\n' + emitSecondLayer(sl));
