# Day 81: Let a machine find the bug you'd never guess

## Overview

Use proptest for fast property-based arithmetic testing and Trident for full-program flow-based fuzzing to discover edge-case inputs that bypass human code audits.

## The Goal

Implement proptest fuzzing for a basic deposit arithmetic handler to guarantee balance addition safety, then integrate the Trident fuzzer framework to execute automated, multi-transaction test flows ensuring invariants always hold.

## Steps

### 1. Pure Math Logic

The deposit arithmetic logic is defined in [math.rs](./math.rs). Instead of using raw operators, it employs standard `checked_add` arithmetic logic:

- `apply_deposit` returns `Some(new_balance)` or `None` on overflow.
- A proptest property is defined inside the file, which generates thousands of randomized `u64` input pairs to prove that the deposit function either succeeds and increases the balance (or keeps it equal) or safely overflows.

### 2. Anchor Program Deposit Instruction

The Anchor program defined in [lib.rs](./lib.rs) includes:

- A `deposit` handler that uses `init_if_needed` for state allocation.
- Call to the math helper: `math::apply_deposit(vault.balance, amount).ok_or(VaultError::Overflow)?`.

### 3. Trident Fuzzing Flow

The fuzzer configuration is defined in [test_fuzz.rs](./test_fuzz.rs). Instead of static unit tests, it hooks up a guidance-based flow:

- Initializes fuzz accounts and airdrops SOL.
- Runs `deposit_never_shrinks` by executing transaction calls with randomized amounts.
- Asserts that after processing, the balance of the vault PDA is always greater than or equal to the balance prior to execution.

### 4. Run the Tests

Run the property test:

```bash
cargo test deposit_never_shrinks_a_balance
```

Run the Trident fuzzer (from inside the `trident-tests` directory):

```bash
trident fuzz run fuzz_0
```

## What Was Learnt

- Hand-written unit tests only cover what the developer anticipates; machine-guided input generation finds the edges you missed.
- Splitting business arithmetic from Solana-specific account layout into pure helper functions makes code far easier to property-test.
- Trident's in-process VM allows automated sequence-testing of Anchor programs to prove state invariants under random flows.
