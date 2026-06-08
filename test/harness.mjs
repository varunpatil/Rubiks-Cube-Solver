// CLI for the solver behavioural harness (single-threaded).
//
//   node test/harness.mjs <target> --golden   # write test/golden.json (+verify each solves)
//   node test/harness.mjs <target> --check     # diff named scrambles vs golden.json
//   node test/harness.mjs <target>             # print results as JSON
//
// <target> is a path, or "a.js,b.js" loaded in order in one global scope.
// For high-coverage head-to-head comparison use test/compare.mjs (parallel).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NAMED_SCRAMBLES, runSet, diff, COMPARE_KEYS, SOLVER } from './lib.mjs';

const GOLDEN = path.join(path.dirname(fileURLToPath(import.meta.url)), 'golden.json');
// `node test/harness.mjs --check` uses the split SOLVER module set by default;
// pass an explicit target to check a different build.
const args = process.argv.slice(2);
const [target, mode] = args[0] && args[0].startsWith('--') ? [SOLVER, args[0]] : args;
if (!target) { console.error('usage: node test/harness.mjs [<target>] [--golden|--check]'); process.exit(2); }

// Only --golden needs the (expensive) independent re-solve verification.
const results = runSet(target, NAMED_SCRAMBLES, mode === '--golden');

if (mode === '--golden') {
  fs.writeFileSync(GOLDEN, JSON.stringify(results, null, 2) + '\n');
  console.log(`Wrote golden baseline for ${Object.keys(results).length} scrambles -> ${GOLDEN}`);
  const bad = Object.values(results).filter((r) => !r.invalid && r.solves !== true);
  if (bad.length) {
    console.error(`WARNING: ${bad.length} scramble(s) did NOT solve their cube:`);
    for (const b of bad) console.error(`  ${b.name}: ${b.verifyReason ?? 'did not solve'}`);
    process.exit(1);
  }
  console.log('All solutions verified to solve their scramble.');
} else if (mode === '--check') {
  if (!fs.existsSync(GOLDEN)) { console.error('no golden.json — run --golden first'); process.exit(2); }
  const golden = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
  const diffs = diff(golden, results, COMPARE_KEYS.concat('text'));
  if (diffs.length) {
    console.error(`BEHAVIOR CHANGED — ${diffs.length} difference(s):\n`);
    console.error(diffs.join('\n'));
    process.exit(1);
  }
  console.log(`PASS — all ${Object.keys(golden).length} scrambles produce identical output.`);
} else {
  console.log(JSON.stringify(results, null, 2));
}
