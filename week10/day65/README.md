# Day 65: Build a Per-User Counter with PDA State

## Overview
Yesterday, PDAs lived in a one-off derivation script. Today they move into the program itself. The key shift: instead of the client generating a keypair and passing it in, the program **owns and derives** the counter address from the signer's public key. Every wallet that calls `init_counter` gets its own isolated state account — no keypair tracking required.

## The Goal
Rewrite the Anchor counter program to use PDA-backed, per-user state. Each counter's address is derived from the seeds `["counter", user_pubkey]`, so a different wallet always produces a different account.

## Prerequisites
- Anchor CLI installed and on your path
- Rust toolchain (Cargo)
- Node.js 18+ with `ts-mocha` available
- A funded devnet/local wallet

## Project Structure
```
counter/
├── programs/counter/src/lib.rs   ← the Anchor program
├── tests/counter.ts              ← TypeScript test suite
└── Anchor.toml                   ← project config & test script
```

## Steps

### 1. Update `lib.rs`
Replace the program body with the per-user PDA version in [`lib.rs`](./lib.rs). Key points:

- **`InitCounter`** uses `seeds = [b"counter", user.key().as_ref()]` — the counter's address is bound to the signer's pubkey. Anchor computes the canonical bump automatically.
- **`Increment`** re-derives the address from the same seeds, so passing someone else's counter address simply produces a constraint mismatch — no manual ownership check needed.
- **`Counter` struct** stores `user`, `count`, and `bump`. The `bump` is stored so Anchor can verify the PDA on subsequent calls without re-searching.
- `8 + Counter::INIT_SPACE` — the `8` accounts for Anchor's discriminator prefix; forgetting it corrupts the account layout.

### 2. Build
```bash
anchor build
```
If program IDs have drifted between `declare_id!` and `Anchor.toml`, run `anchor keys sync` first, then build again.

### 3. Configure the Test Script
In `Anchor.toml`, change the `[scripts]` section so `anchor test` runs the TypeScript suite:

```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### 4. Review `tests/counter.ts`
The test in [`counter.ts`](./counter.ts) exercises the full per-user isolation:

1. Initializes a counter for **Alice** (the provider wallet) and **Bob** (a freshly generated keypair, airdropped 2 SOL).
2. Increments Alice's counter twice and Bob's once.
3. Fetches both accounts by their derived PDAs and asserts: Alice = 2, Bob = 1.

The `counterPda` helper derives the address client-side using the same seeds as the program — this must match exactly for Anchor's constraint check to pass.

### 5. Run the Tests
```bash
anchor test --validator legacy
```

> `--validator legacy` tells Anchor to use the `solana-test-validator` from your Solana toolchain instead of the default `surfpool`, which requires a separate install.

Both `initCounter` calls, three `increment` calls, and all assertions should pass.

## What Was Learnt
- PDAs as per-row state: the same seed scheme as `(user_id, "counter")` in a relational DB, but enforced on-chain with no additional lookup.
- Storing the canonical bump in the account avoids a re-search on every subsequent instruction — a small but meaningful efficiency.
- The seed derivation **is** the access control: Anchor re-derives the address from the provided signer and rejects the transaction if it doesn't match the supplied account, before any handler code runs.
- `anchor keys sync` as a safety valve: if build order ever causes a program ID mismatch, one command reconciles `declare_id!`, `Anchor.toml`, and the on-disk keypair.
