# ship-loop-demo

A small invoice module used to demonstrate ship-loop. TypeScript, strict mode, Vitest.

- Money is always integer cents. Never use floats for amounts.
- Every exported function has a test in the matching `*.test.ts` file.
- Keep functions pure; no I/O in `src/`.
