# Day 67: Close a PDA Account and Reclaim Rent

## Overview
Every account created on Solana holds a rent-exempt deposit — a small SOL balance that compensates validators for replicating your data. When an account is no longer needed, that deposit should come back. Today's task adds a `close_counter` instruction that drains the counter PDA's lamports to the owner's wallet and zeroes the account, all with a single Anchor attribute.

## The Goal
Add a `close_counter` instruction to the Day 66 counter program. Anchor's `close = <recipient>` constraint handles all the mechanics: lamport transfer, data zeroing, and account de-listing — the handler body itself is empty.

## Prerequisites
- The Anchor counter project from Day 66 (per-user counter + config singleton)
- Anchor CLI, Rust, Node.js 18+, and `solana-test-validator` on your path

## Project Structure
```
programs/counter/src/lib.rs   ← new close_counter instruction + CloseCounter struct
tests/counter.ts              ← new test appended to the existing describe block
```

## Steps

### 1. Review `lib.rs`
The updated program is in [`lib.rs`](./lib.rs). Two additions:

**Handler** — the body does nothing; the constraint layer does everything:
```rust
pub fn close_counter(_ctx: Context<CloseCounter>) -> Result<()> {
    Ok(())
}
```

**`CloseCounter` accounts struct** — four constraints work together:
- `close = user` — drains lamports to `user` and zeros the data after the instruction returns.
- `seeds` + `bump = counter.bump` — verifies the address is the genuine PDA, not a spoofed account.
- `has_one = user` — confirms the stored `user` field matches the signer, so only the owner can close their own counter.

### 2. Build
```bash
anchor build
```

### 3. Review `tests/counter.ts`
The new test in [`counter.ts`](./counter.ts) is added inside the existing `describe` block:

1. Checks whether the counter PDA already exists (previous tests may have incremented it); initializes one if not.
2. Captures the account's current lamport balance and the wallet's SOL balance.
3. Calls `closeCounter()`.
4. Asserts `getAccountInfo` returns `null` — the account has been swept out of existence.
5. Logs the rent refunded and net wallet change for inspection.

> The account disappears because when its lamport balance hits zero, the runtime removes it at the end of the transaction. There is no separate "delete" syscall.

### 4. Run the Tests
```bash
anchor test --validator legacy
```

Watch the console for the two `console.log` lines: the rent refunded (in lamports) and the net wallet change. They won't be identical because the transaction fee comes out of the same wallet.

## What Was Learnt
- Solana's **rent-exempt deposit** is fully refundable — the runtime holds it as collateral for the bytes you occupy and returns it the moment the account closes.
- `close = <account>` is the entire API for closing Anchor accounts: one attribute on the `#[account(...)]` macro, zero handler code.
- **Why the account disappears**: a zero-lamport account is not just empty; the runtime marks it as non-existent. A subsequent `getAccountInfo` returns `null`, not an empty struct.
- The stored `bump` and `has_one = user` constraint together make `close_counter` as safe as `increment` was — only the legitimate owner can reclaim the rent.
- Closing accounts during testing or after debugging matters in practice: every unclosed PDA across many debug runs adds up to a real SOL cost.
