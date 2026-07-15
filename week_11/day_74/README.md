# Day 74: Make one of your programs call the other

## Overview
Deploy a counter program and a second program that reaches across to it with a CPI, proving that local program-to-program calls work the same way as external CPIs.

## The Goal
Use the counter program's IDL to generate a CPI client, then call `increment` through the caller program.

## Steps

### 1. Callee Program
The callee is defined in [counter-_-lib.rs](./counter-_-lib.rs). It does the following:
- Defines a `Tally` account with a `count` field.
- Exposes `initialize` to create the tally and set it to zero.
- Exposes `increment` to increase the count by one.

### 2. Caller Program
The caller program is defined in [compose-lab-_-lib.rs](./compose-lab-_-lib.rs). It does the following:
- Uses `declare_program!(counter)` to load the counter IDL from `idls/counter.json`.
- Builds a CPI context for the counter's `increment` instruction.
- Calls `cpi::increment(...)` so the caller program bumps the counter on the user's behalf.

### 3. TypeScript Tests
The test file is in [compose-lab.ts](./compose-lab.ts). It:
- Initializes the counter account directly through the counter program.
- Calls the caller program's `bump` instruction.
- Fetches the counter account and checks that the count increased to one.

### 4. Run the Tests
Run:
```bash
anchor build
anchor test
```

## What Was Learnt
- A program can CPI into another program you wrote just as easily as into the System Program.
- Anchor's generated CPI client uses the callee's IDL as the interface contract.
- `Program<'info, Counter>` validates that the caller is talking to the right program id.