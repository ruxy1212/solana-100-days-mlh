# Day 61: Break Your Program on Purpose and Watch the Tests Catch It

## The Goal
Deliberately introduce three bugs into the counter program, observe the test failures each produces, then restore the program to its correct state — confirming the suite returns to green after each revert.

## Prerequisites
- Anchor counter program from Days 58–60
- Three-test LiteSVM suite: one happy-path test and two failure tests
- `anchor` and `cargo` installed
- A clean git working tree (so each revert is one command away)

## Steps Taken

### Baseline Check
Before changing anything, confirm everything is healthy:
```bash
git status
anchor build && cargo test -p counter
```
All three tests must pass. If anything is red, fix it first.

---

### Experiment 1: Weaken the Authority Check

**The change:** Open `programs/counter/src/lib.rs`. Find the `Increment` accounts struct:

```rust
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]  // remove "has_one = authority"
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
```

Delete `has_one = authority` so only `#[account(mut)]` remains.

**Run:**
```bash
anchor build && cargo test -p counter
```

**Expected result:** `increment_fails_when_wrong_authority_signs` **fails**. The program now happily accepts the unauthorized call, and the assertion that expected an error no longer holds. This is the most important moment of the day — your negative test just caught a real regression.

**Revert:** Restore `has_one = authority`, save, re-run, confirm green.

---

### Experiment 2: Break the Arithmetic

**The change:** Find the body of `increment` and change `checked_add(1)` to `checked_add(2)`:

```rust
counter.count = counter.count
    .checked_add(2)   // was 1
    .ok_or(ProgramError::ArithmeticOverflow)?;
```

**Run:**
```bash
anchor build && cargo test -p counter
```

**Expected result:** `initialize_then_increment` **fails** at the assertion that compares the post-call count to its expected value. The failure prints the expected (`1`) and actual (`2`) numbers side by side. A one-character change in production code produced a clear, specific failure with a clear, specific line number — exactly what an assertion is for.

**Revert:** Restore `checked_add(1)`, save, re-run, confirm green.

---

### Experiment 3: Break Initialization

**The change:** In your `initialize` handler, comment out the line that sets the authority field:

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    // counter.authority = ctx.accounts.authority.key();  // commented out
    counter.count = 0;
    Ok(())
}
```

**Run:**
```bash
anchor build && cargo test -p counter
```

**Expected result:** `initialize_then_increment` **fails** — but not where you might expect. The `initialize` transaction itself still succeeds (the account gets created, rent is paid, count is zero). The bug only surfaces when `increment` runs, because the on-chain `authority` field was left as the default `Pubkey` (all zeros) and your real wallet doesn't match it. The program logs will say:

```
Error Code: ConstraintHasOne. Error Number: 2001.
Left:  11111111111111111111111111111111
Right: <your authority pubkey>
```

This illustrates a key lesson: the **failure points downstream of the cause**. Your tests caught the bug, but the error appears at `increment`, not at `initialize` where the omission actually lives.

**Revert:** Uncomment the line, save, re-run, confirm green.

---

### The Full Experiment Cycle (per bug)
```bash
anchor build && cargo test -p counter   # baseline: green
# introduce one change in lib.rs
anchor build && cargo test -p counter   # should be red, specific failure
# revert the change
anchor build && cargo test -p counter   # back to green
```

## What Was Learnt
- **A negative test that passes proves the gate is real.** Without `increment_fails_when_wrong_authority_signs`, dropping `has_one = authority` would ship silently.
- **Assertion specificity matters.** `checked_add(2)` produced a clear "expected 1, got 2" message with a line number. Vague assertions produce vague failures.
- **Errors can point downstream of the cause.** The missing `counter.authority = ...` line only manifested as a `ConstraintHasOne` error inside `increment` — testing caught it, but reading the logs told the full story.
- **Mutation testing by hand builds intuition.** Knowing exactly which test breaks, and why, is the muscle memory that makes you a better programmer. Tools can automate this; doing it yourself once teaches you to write tests that are worth automating.
