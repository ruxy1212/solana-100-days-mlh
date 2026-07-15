# Day 78: Audit Your Own Code

## Overview
The most expensive Solana bugs are rarely cryptographic breaks, but accounts the program trusted without checking. Today swaps hats from builder to auditor: instead of "what did I mean this to do," the question is "what did I forget to forbid." Every account in every instruction gets checked against exactly two questions: does it guarantee who owns the data (owner question), and does it guarantee the caller actually signed (signer question).

## The Goal
Audit the Day 67 counter program's `lib.rs` account by account. Produce a clean inventory of every account and the guard that earns it a pass, plus a findings table that calls out consequences, including the `UpdateProfile` specimen supplied by the challenge as an account that fails the signer question.

## Prerequisites
- The Anchor counter project (config singleton + per-user PDA counter, through Day 67's `close_counter`)

## Project Structure
```
programs/counter/src/lib.rs   ← program under audit (unchanged)
README.md                     ← this write-up
AUDIT.md                      ← the both tables for the findings
```

## Steps

### 1. Locate the program
Open [`lib.rs`](./lib.rs) and find every struct tagged `#[derive(Accounts)]`. List every field inside each one — `InitConfig`, `SetPaused`, `InitCounter`, `Increment`, `CloseCounter`.

### 2. Classify each field's type
Mark every account as one of `Signer<'info>`, `Account<'info, T>`, `Program<'info, T>`, or `UncheckedAccount<'info>`/`AccountInfo<'info>`. The type is the security control:
- `Signer` proves identity;
- `Account<T>` proves ownership;
- `Program<T>` proves the target is the executable expected; and
- the last pair proves nothing at all.

### 3. Build the inventory table
For every account, answer the owner question (does the program guarantee who owns this account's data) and the signer question (does the program require this account to actually sign). Columns: `Instruction | Account | Type | Owner question | Signer question | Verdict`.

The pattern to notice: `Signer` accounts get "n/a" on the owner question because they carry no state data for the logic to trust; and `Account<T>` state accounts get "n/a" on the signer question because they're not authorizing the action, but being acted on.

### 4. Build the findings table
Combine instruction and account into one label (e.g. `UpdateProfile.authority`). For every account, record its type, which question it fails (`None` if it passes both), and the consequence an attacker could exploit (`✅ None` if it passes). The one flagged row is the `UpdateProfile` specimen from the challenge text — not a bug in this program, but the example of the opposite result.

### 5. Confirm with grep
```bash
grep -rn "UncheckedAccount\|AccountInfo\|/// CHECK" programs/*/src
```
Empty output confirms no escape hatches exist anywhere in the counter program — matching the clean sweep in the inventory table.

## What Was Learnt
- The owner question and the signer question target different roles: one guards *data you read*, the other guards *who's allowed to act*. A single account is rarely subject to both.
- `Account<'info, T>` and `Signer<'info>` are doing real security work on every line they appear, even when written without a second thought.
- `has_one` only proves a stored public key matches an account passed in — it is a key comparison, not proof that the private key holder approved the transaction. It must be paired with `Signer` to mean anything.
- A "clean" audit is still a real deliverable: naming the exact guard that earns each account its pass is the artifact, not just the absence of findings.

*[See the complete tables, both for inventory and findings](./AUDIT.md)*