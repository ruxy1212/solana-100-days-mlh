# Day 80: Write tests that try to rob you

## Overview

Build a minimal vault program and write a dedicated adversarial unit test module using LiteSVM to aggressively attack its security boundaries, ensuring the program rejects malicious exploits for the exact right reasons.

## The Goal

Add a `withdraw` instruction guarded by strict Anchor constraints, then write tests that mimic real-world penetration testing strategies to prove your program survives underflows, wrong signers, and look-alike account exploits.

## Steps

### 1. Program Logic

The program is defined in [lib.rs](./lib.rs). It does the following:

- Implements a single high-value `withdraw` instruction.
- Protects the vault with three distinct lines of defense: a `has_one = authority` constraint, deterministic PDA seed derivation (`b"vault"` + authority key), and a safe `checked_sub` arithmetic overflow check.

### 2. Rust Adversarial Tests

The test file is in [adversarial.rs](./adversarial.rs). Instead of checking the happy path, it acts as a pessimist by sending malicious transactions using a fast, in-process LiteSVM environment. It tests:

- **The Wrong Signer:** An attacker signs with their own key, which is caught by the seed mismatch constraint.
- **The Look-Alike Account:** An attacker swaps the canonical vault PDA with an unapproved decoy account.
- **The Overdraw:** A valid user tries to drain more funds than they own, triggering an intentional arithmetic safety block.

Every negative test enforces strict checking of the specific Anchor error code (e.g., `2006` or `6000`) so unrelated transaction mistakes cannot masquerade as security successes.

### 3. The Positive Control

`fn legitimate_owner_can_withdraw() {...}`

To make sure our strict security guards don't accidentally lock out real users, we added a standard _Positive Control_ test. It performs a normal, authorized withdrawal of 200 lamports from a vault seeded with 500 lamports, verifies the execution returns clean metadata, and asserts that the remaining balance decreases to exactly 300.

### 4. Run the Tests

Run:

```bash
anchor build && cargo test --manifest-path programs/vault/Cargo.toml

```

## What Was Learnt

- Security constraints are only theoretical until you write an adversarial test that proves they fail exactly how you intended.
- Testing for basic "transaction failures" is dangerous; you must assert the exact custom or constraint error code to rule out false positives.
- A balanced test suite requires adversarial tests to challenge the locks, alongside a positive control test to ensure the key still works for legitimate users.