# Day 79: Constrain a Vulnerable Instruction Declaratively

## Overview
Yesterday's audit found the shape of a real vulnerability: an account accepted without confirming it belongs to the caller. Today closes that gap without touching the handler body at all. Anchor lets validation live as attributes on the accounts struct, i.e `seeds`, `bump`, `has_one`, so the runtime rejects a bad account before your instruction logic ever runs. The handler stays empty; the struct becomes the single source of truth for what a valid call looks like.

## The Goal
Harden a deliberately insecure `Withdraw` instruction by adding a `Vault` state account and rewriting `Withdraw`'s accounts struct so every account is fully constrained. Then prove it with a clean `anchor build`. No adversarial testing yet; that's tomorrow.

## Prerequisites
- The Anchor counter project from Day 78 (config singleton + per-user counter, already audited clean)
- anchor-cli 1.0.2 and the Solana CLI on your path
- [Day 78's audit notes](../day78/AUDIT.md)

## Project Structure
```
programs/counter/src/lib.rs   ← Vault struct, Withdraw struct, withdraw handler added
```

## Steps

### 1. Read the insecure baseline
The starting point is a `Withdraw` struct with only `authority: Signer<'info>` and `vault: Account<'info, Vault>` marked `mut`. Both types already answer their respective questions in isolation: `Signer` proves who signed, `Account<Vault>` proves the program owns it; but nothing ties the two together. An attacker can sign as themselves and pass in *someone else's* vault, and the handler happily drains it. This version compiles and passes a happy-path test, which is exactly why the bug is dangerous.

### 2. Give `Vault` the fields the constraints need
```rust
#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}
```
`has_one` and `bump = vault.bump` can't check anything without these fields to read from.

### 3. Rewrite `Withdraw` with constraints instead of handler logic
```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
```
`seeds`/`bump` re-derives the PDA from the signer's own key, so no other vault can satisfy it. `has_one = authority` binds the account's stored authority to the live signer. Between the two, account substitution is closed off entirely. `if vault.authority != authority.key()` guard is no longer needed in the handler.

### 4. Add the handler stub
```rust
pub fn withdraw(_ctx: Context<Withdraw>) -> Result<()> {
    Ok(())
}
```
An empty body is correct today, the struct is what's being graded, not transfer logic.

### 5. Build
```bash
anchor build
```
A clean build confirms every field the constraints reference (`vault.bump`, `vault.authority`) actually exists and the types line up. It does **not** confirm the constraints fire correctly against malicious input, yet.

## What Was Learnt
- Declarative constraints on the struct beat imperative checks in the handler: they can't be forgotten in a refactor, and they read as documentation next to the account they guard.
- `seeds` + `bump` is what stops PDA substitution. Without it, `Account<'info, Vault>` only proves *a* valid vault was passed, not *the right one*.
- `has_one` binds stored state to the live signer; on its own, `Signer` and `Account<T>` answer the owner/signer questions independently but say nothing about the *relationship* between two accounts.
- **A clean `anchor build` proves the types line up, but does not prove the logic is secure.** The insecure version of this exact struct also compiled and passed a happy-path test; the compiler only catches missing fields, not missing authorization.
- `withdraw` is scaffolding, not functional yet: no `init_vault` instruction exists, so the PDA it checks for is never created on-chain. That's expected for today's scope, not an oversight.