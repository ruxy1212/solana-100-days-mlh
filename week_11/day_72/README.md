# Day 72: Mint Token-2022 tokens from inside your program

## Overview
New tokens do not come from nowhere. Somewhere a program holding mint authority calls into the token program, asks it to create some units, and the supply ticks up. Today, we make that request from inside our own Anchor program via a cross-program invocation (CPI) to the Token-2022 program.

## The Goal
Add a `mint_tokens` instruction to an Anchor program that performs a CPI to the Token-2022 Program to mint a specified amount of tokens to a destination token account.

## Prerequisites
- Solana CLI, Rust, and the Anchor CLI (targeting Anchor 1.0.x)
- Surfpool local validator (`surfpool`) for running `anchor test`
- Code editor

## Project Structure
```
lib.rs          ← Rust source code with the mint_tokens instruction
token-cpi.ts    ← TypeScript test file to verify token minting via CPI
```

## Steps

### 1. Configure Dependencies
Add `anchor-spl` to `Cargo.toml` dependencies under `[dependencies]`:
```toml
anchor-lang = "1.0"
anchor-spl = { version = "1.0", features = ["idl-build"] }
```

### 2. Program Logic
The program is defined in [lib.rs](./lib.rs). It does the following:
- Defines the `MintTokens` accounts struct containing `signer` (`mut`, `Signer`), `mint` (`mut`, `InterfaceAccount<'info, Mint>`), `token_account` (`mut`, `InterfaceAccount<'info, TokenAccount>`), and `token_program` (`Interface<'info, TokenInterface>`).
- Prepares a `MintTo` accounts struct from `anchor_spl::token_interface`.
- Creates a `CpiContext` targeting `token_program`.
- Calls `token_interface::mint_to` to perform the invocation.

### 3. TypeScript Tests
The test file is in [token-cpi.ts](./token-cpi.ts). It:
- Sets up an Anchor provider and defines the program.
- Creates a Token-2022 mint and an associated token account owned by the payer.
- Invokes the `mintTokens` method of the program, passing the required accounts.
- Asserts that the balance in the token account matches the minted amount.

### 4. Run the Tests
Ensure `Anchor.toml` is configured with:
```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```
Run the test:
```bash
anchor test
```

## What Was Learnt
- CPIs allow a program to call into token programs (like Token-2022) to perform state modifications such as minting tokens.
- Using Anchor's `InterfaceAccount` and `Interface` types makes the program code compatible with both the legacy Token Program and the newer Token-2022 Program.
- Signer authorization flows automatically through CPIs: because the mint authority signed the outer transaction, its signature is validated in the inner token program instruction.
