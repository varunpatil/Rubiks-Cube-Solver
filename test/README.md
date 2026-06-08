# Solver regression suite

The solver was rewritten from a single 3,754-line file into small modules
(`js/cube.js`, `js/predicates.js`, `js/tables.js`, `js/solver.js`, `js/ui.js`)
**without changing the algorithm** — the same permutation brute-force over the
F2L / beginner's method, keeping the shortest solution across 6 orientations ×
24×24 insertion orderings.

These tools load the solver into a Node `vm` sandbox (mocked DOM, frozen clock so
the 800 ms invalid-config timeout never fires and the full deterministic search
runs) and check that it produces the **exact same solution string** for a given
scramble — the contract that proves the algorithm is unchanged.

## Files

- `lib.mjs` — shared core: sandbox loader, scramble runner, seeded generator. Exports
  `SOLVER`, the module list loaded in dependency order (same order as `index.html`).
- `harness.mjs` — quick CLI: golden baseline + regression check.
- `compare.mjs` — parallel head-to-head comparator (new vs. a reference build).
- `golden.json` — recorded solutions for 14 named scrambles (the regression baseline).
- `Rubik.original.js` — the pre-refactor solver, kept as the equivalence reference.
- `transpile.mjs` — generated `js/tables.js` (the `WHITE_CROSS` / `SECOND_LAYER`
  lookup tables) from the original `goWC` / `goL2` ladders.
- `gen-cycles.mjs` — extracted the `Cube.MOVE_CYCLES` data (the data-driven turns)
  from the verified swap-based moves.
- `gen-svg.mjs` — generated `images/orientation.svg` (the isometric "how to hold" cube).

## Usage

```bash
# Quick regression: does the split solver still match the golden solutions?
node test/harness.mjs --check

# (Re)generate the golden baseline, verifying every solution actually solves its cube:
node test/harness.mjs --golden

# High-coverage proof: run named + N random scrambles through both builds and
# assert byte-identical solutions (sharded across CPU cores).
node test/compare.mjs "js/cube.js,js/predicates.js,js/tables.js,js/solver.js,js/ui.js" test/Rubik.original.js 300

# Regenerate the generated assets:
node test/transpile.mjs > js/tables.js
node test/gen-svg.mjs   > images/orientation.svg
```

The refactor was validated this way against **1,600+ random scrambles** plus the
named set, all byte-identical to the original.
