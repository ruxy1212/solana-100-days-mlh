# Day 75: Read a CPI failure like a sentence

## Overview
Build three deliberate CPI failures from the earlier days and read the runtime logs closely enough to map each failure back to its root cause.

## The Goal
Create three controlled CPI failures and write down the exact log line that explains each one.

## Steps

### 1. Baseline
Re-run the working Day 74 CPI flow first and confirm the happy path still passes before changing anything.

### 2. Wrong Signer Seeds
Open the Day 73 vault program in [lib.rs](../day_73/lib.rs). Break the signer seed or bump used for the `withdraw` CPI, rebuild, and run the vault test in [vault.ts](../day_73/vault.ts). Capture the log line that points to the missing or invalid PDA signature.

### 3. Wrong Account Constraint
Restore the Day 73 vault program. Then add or change an account constraint in the Day 74 callee so the caller no longer satisfies it, rebuild, and run the Day 74 test in [compose-lab.ts](../day_74/compose-lab.ts). Capture the log line that names the failing constraint or account.

### 4. Wrong Program ID
Restore the Day 74 callee, then point the caller's CPI at the wrong program id and rerun the Day 74 test. Capture the log line that shows the runtime called a real program that could not handle the instruction.

### 5. Restore the Code
Put the working Day 73 and Day 74 code back after the log mapping is written down.

## What Was Learnt
- CPI failures are usually precise once you read the runtime logs instead of the first error line.
- Signer-seed mistakes, account-constraint mismatches, and wrong program ids produce different log shapes.
- A small local break is often the fastest way to learn what a runtime error actually means.