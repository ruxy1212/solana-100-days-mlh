# Day 71: Move SOL from inside your program with a CPI

## Overview
A Solana program can pause in the middle of its own instruction, call a completely different program, and then pick up where it left off once that program returns. That call is a cross-program invocation, or CPI. Today's task writes the smallest possible CPI: an instruction in your own Anchor program that calls the System Program's transfer instruction to send SOL from a signer to a recipient.

## The Goal
Create an Anchor program `sol_mover` with a `sol_transfer` instruction that performs a CPI to the System Program to transfer SOL from a signer (`sender`) to a `recipient` account.

## Prerequisites
- Solana CLI, Rust, and the Anchor CLI (targeting Anchor 1.0.x)
- Surfpool local validator (`surfpool`) for running `anchor test`
- Code editor

## Project Structure
```
lib.rs         ← Rust source code with the sol_transfer instruction
sol-mover.ts   ← TypeScript test file to verify the SOL transfer
```

## Steps

### 1. Program Logic
The program is defined in [lib.rs](./lib.rs). It does the following:
- Defines the `SolTransfer` accounts struct containing `sender` (`mut`, `Signer`), `recipient` (`mut`, `SystemAccount`), and `system_program` (`Program<'info, System>`).
- Prepares a `Transfer` struct from `anchor_lang::system_program`.
- Creates a `CpiContext` using `CpiContext::new` pointing to the System Program with the accounts.
- Invokes the `transfer` CPI helper.

### 2. TypeScript Tests
The test file is in [sol-mover.ts](./sol-mover.ts). It:
- Sets up an Anchor provider and defines the program.
- Generates a recipient keypair.
- Captures the initial balance, invokes the program's `solTransfer` method, and checks the recipient's balance increases by 0.25 SOL.

### 3. Run the Tests
Ensure `Anchor.toml` is configured with:
```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```
Then run:
```bash
anchor keys sync
anchor build
anchor test
```

## What Was Learnt
- A Cross-Program Invocation (CPI) allows Solana programs to call instructions in other programs.
- Anchor provides the `CpiContext` and ready-made structs/helpers like `Transfer` and `transfer` to simplify System Program CPIs.
- The signature of a signer in the outer transaction is automatically forwarded into the CPI.
- In Anchor 1.0.x, the first argument to `CpiContext::new` is the program's `Pubkey` (e.g. `system_program.key()`), not its `AccountInfo`.
