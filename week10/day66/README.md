# Day 66: Add a Config PDA and Cross-Account Constraints

## Overview
A single PDA enforces per-user ownership. Two PDAs wired together enforce **program-wide policy**. Today's task introduces a `Config` singleton account — one per program, derived from the static seed `["config"]` — and connects it to the per-user counter. The result is a program that can be paused globally by an admin, while still rejecting increment calls from anyone who doesn't own the counter they're touching.

## The Goal
Extend the counter program from Day 65 with:
1. A `Config` singleton PDA holding admin identity, a pause flag, and a user count.
2. An `init_config` instruction (callable once; subsequent calls fail because the account already exists).
3. A `set_paused` instruction gated by `has_one = admin`.
4. `increment` updated to read both the config (pause check) and the counter (ownership check).

## Prerequisites
- The Anchor counter project from Day 65
- Anchor CLI, Rust, Node.js 18+, and the `solana-test-validator` on your path

## Project Structure
```
programs/counter/src/lib.rs   ← updated program with Config + Counter
tests/counter.ts              ← rewritten test suite (full replace)
```

## Steps

### 1. Review `lib.rs`
The full updated program is in [`lib.rs`](./lib.rs). Key additions:

**`Config` account** (singleton, seeds = `["config"]`):
- `admin: Pubkey` — set at init time; never changes.
- `paused: bool` — flipped by `set_paused`.
- `total_counters: u64` — bumped by every `init_counter` call.
- `bump: u8` — stored for efficient PDA verification.

**`has_one = admin` on `SetPaused`** — Anchor reads the `admin` field off the deserialized `Config` account and compares it to the signer. Wrong wallet → transaction rejected before the handler runs.

**`constraint = !config.paused @ CounterError::Paused` on `Increment`** — a free-form boolean guard attached directly to the account constraint. Returns the custom `Paused` error if the flag is set, giving the client a readable message.

**`has_one = user` on `Increment`** — the counter's stored `user` field must match the transaction signer. Combined with the seed check, this is double-layered ownership enforcement.

### 2. Build
```bash
anchor build
```

### 3. Review `tests/counter.ts`
The test file [`counter.ts`](./counter.ts) is a full rewrite covering:

| Test | What it proves |
|------|---------------|
| `initializes config and a counter, then increments` | Happy path: config init → counter init → increment works |
| `refuses to increment when paused` | `setPaused(true)` causes `increment` to throw a `Paused` error; `setPaused(false)` restores normal operation |

### 4. Run the Tests
```bash
anchor test --validator legacy
```

Both tests should pass. If the pause test's caught error message doesn't contain `"Paused"`, inspect the full error output — Anchor prints the constraint name and error code from the enum, which is exactly what a client should receive.

## What Was Learnt
- The **singleton PDA pattern**: deriving from a fixed seed like `["config"]` guarantees at most one instance per program — `init` on an existing account is a hard runtime error.
- `has_one = admin` as **cross-account authorization**: Anchor reads one account's stored field and compares it to another account in the same transaction, entirely in the constraint layer — no handler code required.
- The `constraint = <bool_expr> @ ErrorVariant` syntax: attach any readable Rust expression as a guard to any account, with a named error returned on failure.
- **Composing constraints**: `set_paused` uses `has_one`; `increment` uses `has_one` + `constraint` + `seeds`. Multiple constraints on a single account all run before the handler, in declaration order.
- `total_counters` as a running tally — a lightweight way to expose aggregate state without iterating accounts on-chain.
