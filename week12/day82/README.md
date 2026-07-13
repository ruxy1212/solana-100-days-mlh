# Day 82: Rebuild the $326M Wormhole bug yourself

## Overview

Rebuild a classic Solana vulnerability—the unchecked account owner exploit that drained the Wormhole bridge—and demonstrate how it allows attackers to bypass core security checks, followed by applying the Anchor fix.

## The Goal

Scaffold a program with a vulnerable instruction that deserializes configuration data from an arbitrary unchecked account, write an exploit using LiteSVM that mocks the Wormhole and Cashio attacks, and then implement account verification to stop the exploit.

## Steps

### 1. The Vulnerable Program

The initial program is defined in [lib.rs](./lib.rs). It has a single `withdraw` instruction that:

- Accepts an `UncheckedAccount` for config data.
- Deserializes config bytes manually using `Config::try_deserialize(&mut &data[..])?`.
- Authorizes withdrawals by comparing the stored config admin key with the transaction signer, but forgets to check who owns the config account itself.

### 2. The LiteSVM Exploit

The exploit script in [attack.rs](./attack.rs) shows how easy it is to forge state when identity checks are omitted:

- Generates an attacker keypair and air-drops SOL.
- Forges a fake `Config` layout prepended with Anchor's discriminator, assigning the attacker as the admin.
- Registers this fake account in LiteSVM under the ownership of the standard System Program (not the vault program).
- Executes the `withdraw` transaction, which sails through successfully, authorizing the attacker.

### 3. The Secure Fix

We update the program to use Anchor's native account verification wrapper:

- Change `UncheckedAccount<'info>` to `Account<'info, Config>`.
- Remove manual deserialization because `Account<'info, T>` automatically validates the account owner and discriminator, aborting the transaction with `AccountOwnedByWrongProgram` if it doesn't match the program ID.

### 4. Run the Exploit & Verification

Run the test suite to observe the exploit and verify the fix works:

```bash
anchor build && cargo test --package leaky_vault attack_drains_vault
```

## What Was Learnt

- Deserializing raw account data without checking its owner allows attackers to pass forged accounts they fully control.
- Anchor's typed `Account<'info, T>` wrapper is a critical safety net that handles discriminator and program owner validation automatically.
- Rebuilding real-world exploits in an in-process VM like LiteSVM helps developer understanding by visualizing the mechanics of the bug and proving the fix works.
