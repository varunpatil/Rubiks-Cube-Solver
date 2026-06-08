# Solver regression suite

The solver in `js/Rubik.js` was rewritten from a 3,754-line single file into a
~1,100-line data-driven one **without changing the algorithm** (the same
permutation brute-force over the F2L / beginner's method, keeping the shortest
solution across 6 orientations × 24×24 insertion orderings).

These tools load `Rubik.js` into a Node `vm` sandbox (with a mocked DOM and a
frozen clock, so the 800 ms invalid-config timeout never fires and the full
deterministic search runs) and check that it produces the **exact same solution
string** for a scramble — the contract that proves the algorithm is unchanged.

## Files

- `lib.mjs` — shared core: sandbox loader, scramble runner, seeded scramble generator.
- `harness.mjs` — single-file CLI (golden baseline + quick regression check).
- `compare.mjs` — parallel head-to-head comparator (new vs. a reference build).
- `golden.json` — recorded solutions for 14 named scrambles (the regression baseline).
- `Rubik.original.js` — the pre-refactor solver, kept as the equivalence reference.
- `transpile.mjs` — one-time migration tool that generated the `WHITE_CROSS` /
  `SECOND_LAYER` data tables from the original `goWC` / `goL2` ladders.

## Usage

```bash
# Quick regression: does the current solver still match the golden solutions?
node test/harness.mjs js/Rubik.js --check

# (Re)generate the golden baseline, verifying every solution actually solves its cube:
node test/harness.mjs js/Rubik.js --golden

# High-coverage proof: run named + N random scrambles through two builds and
# assert byte-identical solutions (sharded across CPU cores).
node test/compare.mjs js/Rubik.js test/Rubik.original.js 300

# Re-derive the goWC / goL2 lookup tables from the original source:
node test/transpile.mjs > /tmp/tables.js
```

The refactor was validated this way against **1,100+ random scrambles** plus the
named set, all byte-identical to the original.
