// Parallel high-coverage head-to-head comparator.
//
//   node test/compare.mjs <targetA> <targetB> [count] [seed]
//
// Runs the named scrambles + <count> seeded-random scrambles (default 120)
// through BOTH targets and asserts byte-identical solver output. Work is
// sharded across CPU cores via worker forks, so a few hundred scrambles
// complete in ~1 min instead of ~10. This is the proof gate for risky
// rewrites of goWC / goL2 / solve.
//
// Internally re-invokes itself as a worker with --worker <shardIdx> <shardTotal>.

import os from 'node:os';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { NAMED_SCRAMBLES, genScrambles, runScramble, COMPARE_KEYS } from './lib.mjs';

const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);

function buildScrambles(count, seed) {
  return { ...NAMED_SCRAMBLES, ...genScrambles(count, seed) };
}

// ---- Worker mode: process every Nth scramble, print diffs as JSON lines ----
if (argv[0] === '--worker') {
  const [, idxStr, totalStr, a, b, countStr, seedStr] = argv;
  const idx = parseInt(idxStr, 10), total = parseInt(totalStr, 10);
  const scrambles = buildScrambles(parseInt(countStr, 10), parseInt(seedStr, 10));
  const names = Object.keys(scrambles);
  const diffs = [];
  for (let i = idx; i < names.length; i += total) {
    const name = names[i], fns = scrambles[name];
    const ra = runScramble(a, name, fns, false);
    const rb = runScramble(b, name, fns, false);
    for (const key of COMPARE_KEYS) {
      if (JSON.stringify(ra[key]) !== JSON.stringify(rb[key])) {
        diffs.push(`${name} [${fns.join(' ')}]\n    .${key}  A: ${JSON.stringify(ra[key])}\n            B: ${JSON.stringify(rb[key])}`);
      }
    }
  }
  process.send({ done: names.length === 0 ? 0 : Math.ceil((names.length - idx) / total), diffs });
  process.exit(0);
}

// ---- Coordinator ----
const [a, b, countStr, seedStr] = argv;
if (!a || !b) { console.error('usage: node test/compare.mjs <A> <B> [count] [seed]'); process.exit(2); }
const count = countStr ? parseInt(countStr, 10) : 120;
const seed = seedStr ? parseInt(seedStr, 10) : 12345;
const total = Object.keys(buildScrambles(count, seed)).length;
const workers = Math.min(Math.max(os.cpus().length - 1, 1), total);

process.stderr.write(`comparing ${total} scrambles (named + ${count} seeded@${seed}) across ${workers} workers...\n`);

let pending = workers;
const allDiffs = [];
const t0 = Date.now();
for (let w = 0; w < workers; w++) {
  const child = fork(SELF, ['--worker', String(w), String(workers), a, b, String(count), String(seed)]);
  child.on('message', (m) => { allDiffs.push(...m.diffs); });
  child.on('exit', () => {
    if (--pending === 0) {
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      if (allDiffs.length) {
        console.error(`ALGORITHM DIVERGED — ${allDiffs.length} difference(s) of ${total} scrambles (${secs}s):\n`);
        console.error(allDiffs.slice(0, 50).join('\n'));
        if (allDiffs.length > 50) console.error(`\n...and ${allDiffs.length - 50} more`);
        process.exit(1);
      }
      console.log(`PASS — all ${total} scrambles produce IDENTICAL solutions in both targets (${secs}s).`);
      process.exit(0);
    }
  });
}
