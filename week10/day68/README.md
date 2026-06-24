# Day 68: Try to Make Two PDAs Share an Address

## Overview
The counter program has behaved correctly for three days because its seed design is sound. Today's task deliberately probes the edges: derive PDAs from near-identical seeds and watch the addresses diverge completely, then attempt a spoofed transaction that the program is supposed to reject. Nothing ships — the goal is to build intuition for what the seed array actually controls.

## The Goal
Write a TypeScript exploration script that:
1. Derives per-user PDAs for two wallets and confirms they differ.
2. Derives a "global" PDA (no wallet in seeds) from both wallets' perspectives and confirms they collide.
3. Runs near-miss seed variants to show how one byte change produces a completely different address.
4. Attempts to call `increment` while passing the wrong wallet's counter — and confirms the runtime rejects it.

## Prerequisites
- The Anchor counter project from Day 67 (config singleton + per-user counter + `close_counter`)
- `@anchor-lang/core` and `@solana/web3.js` installed (Anchor scaffolds both)
- A running local validator with the program deployed and config initialized

## Project Structure
```
week10/day68/
├── explore-collisions.ts   ← the exploration script
└── init-config.ts          ← one-shot helper to initialize the config singleton
```

## Setup: Start the Validator and Deploy

These three steps must happen **before** running the main script:

**1. Start a local validator** (leave it running in its own terminal):
```bash
solana-test-validator
```

**2. Deploy the program from the project root:**
```bash
anchor deploy
```

**3. Initialize the config singleton** using [`init-config.ts`](./init-config.ts):
```bash
ANCHOR_PROVIDER_URL="http://127.0.0.1:8899" ANCHOR_WALLET="$HOME/.config/solana/id.json" \
  npx ts-node --transpile-only week10/day68/init-config.ts
```

If the config already exists from a previous run, the call fails with "already in use" — that's fine, the singleton is already there.

## Run the Exploration Script

The main script lives in [`explore-collisions.ts`](./explore-collisions.ts). It funds Wallet B via airdrop, initializes its counter on-chain (so the spoof attempt fails on the constraint, not on "account not initialized"), then prints PDA comparisons and attempts the bad transaction.

```bash
ANCHOR_PROVIDER_URL="http://127.0.0.1:8899" ANCHOR_WALLET="$HOME/.config/solana/id.json" \
  npx ts-node --transpile-only week10/day68/explore-collisions.ts
```

> `AnchorProvider.env()` reads the cluster URL and wallet from `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET`. Without them you get `ANCHOR_PROVIDER_URL is not defined`.
>
> If you see `Cannot find module .../target/types/counter`, check that `package.json` does **not** have `"type": "module"` — that switches ts-node to the ESM loader, which rejects the extensionless relative import.

## What the Script Shows

| Section | What to observe |
|---------|----------------|
| Per-user PDAs | Wallet A and Wallet B produce **different** addresses — `Same address? false` |
| Global PDA (no wallet in seeds) | Both wallets produce the **same** address — `Same address? true`. This is the collision design bug. |
| Near-miss variants | `"counter"` vs `"counters"` vs `"counter\0"` vs `"Counter"` each produce a completely different address |
| Spoof attempt | Wallet A calling `increment` with Wallet B's counter → `Spoof rejected: ...` |

## What Was Learnt
- **Seed design is access control**: including the user's pubkey in the seeds gives each wallet its own namespace. Omitting it creates one address shared by everyone — a first-write-wins collision.
- There is no "close enough" in PDA derivation — a single extra byte, a null terminator, or a capital letter produces an unrelated address.
- Anchor's seed constraint re-derives the PDA at runtime and compares it to the account you supplied. A mismatch is caught **before** the handler runs — not as a logic error inside your code.
- The spoof attempt fails at the constraint layer, not in application logic. This is the correct place for it to fail: the program doesn't need defensive code inside `increment` because the framework's constraint check is already there.
- Understanding what causes PDA collisions vs. separations is the mental model you need to design state layouts for any Solana program.
