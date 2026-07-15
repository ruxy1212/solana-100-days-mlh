# Day 73: Withdraw SOL from a vault your program signs for

## Overview
Build a vault PDA that can receive SOL from a user and later send it back out, with the withdraw CPI signed by the program through PDA seeds.

## The Goal
Add `deposit` and `withdraw` instructions to an Anchor program, then prove the vault balance goes up and back to zero.

## Steps

### 1. Program Logic
The program is defined in [lib.rs](./lib.rs). It does the following:
- Defines `deposit` and `withdraw` instructions against a PDA vault derived from `b"vault"` and the user's public key.
- Uses a plain `CpiContext::new` for `deposit` because the user already signed the outer transaction.
- Uses `.with_signer(...)` for `withdraw` so the program can sign for the vault with its seeds and bump.

### 2. TypeScript Tests
The test file is in [vault.ts](./vault.ts). It:
- Derives the vault PDA with the same seeds used by the program.
- Deposits SOL into the vault, checks the vault balance, then withdraws the same amount.
- Verifies the vault balance returns to zero after the withdraw.

### 3. Run the Tests
Run:
```bash
anchor test
```

## What Was Learnt
- A PDA can hold SOL even though it has no private key.
- A program can authorize a CPI for its PDA by supplying the correct signer seeds and bump.
- The same seed recipe must be used on both chain and in the test to derive the vault address.