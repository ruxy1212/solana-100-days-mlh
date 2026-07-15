# Day 64: Derive Your First PDA from Seeds

## Overview
Program Derived Addresses (PDAs) are the cornerstone of on-chain state ownership in Solana. Unlike the keypair-based accounts built in previous weeks, a PDA has **no private key** — it sits off the ed25519 curve, meaning only the program that owns it can sign for it. Today's task explores the mechanics of PDA derivation in isolation: no program changes, just a script that prints addresses and makes the determinism tangible.

## The Goal
Write a TypeScript script that calls `PublicKey.findProgramAddressSync` with different seed combinations, observe how seeds map deterministically to addresses, and confirm that the same seeds always yield the same PDA.

## Prerequisites
- The Anchor counter project from Week 9 (with a valid `declare_id!` in `lib.rs` and a matching program ID in `Anchor.toml`)
- Node.js and the `@solana/web3.js` package (already present in every Anchor project)

## Key Concept: How PDA Derivation Works
`findProgramAddressSync` hashes the seeds together with the program ID and a one-byte **bump**, starting at 255 and counting down, until the result lands at a point **not** on the ed25519 curve. The first bump that produces an off-curve address is the **canonical bump** — always the same for a given seed + program ID pair.

## Steps

### 1. Locate Your Program ID
Open `Anchor.toml` and copy the value under `[programs.localnet]`. This must match the `declare_id!` in `programs/counter/src/lib.rs`.

### 2. Run the Derivation Script
The script lives at [`derive-pda.ts`](./derive-pda.ts). It runs four derivations:

| Run | Seeds | Expected result |
|-----|-------|----------------|
| 1 | `["counter"]` | Base PDA |
| 2 | `["counter", "alice"]` | Different address |
| 3 | `["counter", "bob"]` | Different address again |
| 4 | `["counter"]` | **Identical to Run 1** — determinism check |

```bash
npx ts-node --transpile-only week_10/day_64/derive-pda.ts
```

> **Note:** The `--transpile-only` flag skips whole-program type checking, which is necessary because the default Anchor `tsconfig.json` only declares `mocha` and `chai` types and would otherwise complain about `Buffer` and `console`.

### 3. Observe the Output
- Run 1 and Run 4 produce **the exact same PDA** — same seeds, same program ID → same address, always.
- Runs 2 and 3 produce completely different addresses despite sharing the `"counter"` prefix, because the second seed changes the hash input.
- The canonical bump will typically be `254` or `255` for short seed lists, with lower values appearing occasionally.

## What Was Learnt
- A PDA is a **deterministic hash output** — treat it like a database primary key derived from your program logic.
- The bump is an artefact of collision-avoidance: the runtime counts down from 255 until the address lands off-curve. The **canonical bump** is always stored and reused, never re-searched at runtime.
- Changing even one seed byte yields a completely different address — there is no "close enough" in PDA-land.
- The same computation runs identically client-side (TypeScript) and on-chain (Rust), which is what makes PDAs trustless: the client and the program always agree on the address without any communication.
