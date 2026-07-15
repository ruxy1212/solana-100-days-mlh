# How Anchor Constraints Replace an Entire Auth Layer

**Tags:** 100daysofsolana, anchor, rust, web3

> This week I made the jump from being a *consumer* of Solana programs to being a *builder* of them.

Let me walk you through what I built, what I tested, and the one experiment that made everything click.

---

## The Program: A Counter with an Owner

The running example for the week was a counter program. Simple on the surface — one `Pubkey` (the owner) and one `u64` (the count) — but surprisingly rich in what it teaches.

```rust
#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
}
```

`#[account]` stamps an 8-byte discriminator onto the front of every serialised `Counter`. That discriminator is how the program can later verify "yes, this account was created by me and nothing else." `#[derive(InitSpace)]` auto-calculates the byte size so you don't have to count fields by hand. One macro, zero arithmetic.

---

## Constraints Are Like Middleware

In a Web2 backend you might write a route guard like this:

```python
if request.user.id != resource.authority_id:
    return 403
```

In Anchor, you write this instead:

```rust
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
```

`has_one = authority` tells Anchor: before the `increment` handler runs, verify that the `authority` field stored inside the `counter` account on-chain matches the `authority` key passed in this transaction. If they don't match, the transaction fails before your Rust code ever executes. You didn't write an `if` statement. You declared a rule.

Similarly, the `init` constraint on `Initialize` does the heavy lifting of creating the account:

```rust
#[account(
    init,
    payer = authority,
    space = 8 + Counter::INIT_SPACE,
)]
pub counter: Account<'info, Counter>,
```

One attribute makes a CPI to the System Program, allocates the right number of bytes, funds the rent from `authority`'s wallet, assigns the account to your program, and refuses to run if the account already exists. You write one line. Anchor writes the boilerplate.

---

## Testing with LiteSVM

Once the program writes state, you need a way to prove it works. In the earlier epochs, I observed that waiting for devnet confirmations was slow and flaky, which brings **LiteSVM** into the picture, as it is an in-process Solana virtual machine that can run your compiled `.so` binary against a fresh ledger in the same Rust test process.

The happy-path test looks like a normal Rust unit test, but it executes a *real* Solana transaction:

```rust
svm.send_transaction(tx).unwrap();

let account = svm.get_account(&counter_kp.pubkey()).unwrap();
let parsed = counter::Counter::try_deserialize(&mut account.data.as_slice()).unwrap();
assert_eq!(parsed.count, 1);
assert_eq!(parsed.authority, authority.pubkey());
```

State even persists across transactions within one `LiteSVM` instance — just like a real cluster — so a test that calls `initialize` and then `increment` is a genuine end-to-end simulation.

---

## Including Failure Tests

A happy-path test proves the program *works*. A failure test proves the program *refuses*. Both are necessary.

I wrote two:

**1. Wrong authority is rejected**
```rust
let init_tx = build_initialize_tx(&svm, program_id, &authority_a, &counter);
svm.send_transaction(init_tx).expect("initialize should succeed");

let bad_tx = build_increment_tx(&svm, program_id, &authority_b, counter.pubkey());
let result = svm.send_transaction(bad_tx);
assert!(result.is_err(), "increment should fail for a different signer");
```

**2. Double-initialization is rejected**
```rust
svm.send_transaction(first_tx).expect("first initialize should succeed");
svm.expire_blockhash(); // make the second tx genuinely new
let result = svm.send_transaction(second_tx);
assert!(result.is_err(), "initializing the same counter twice should fail");
```

The `expire_blockhash()` call is subtle but important. Without it, both transactions are byte-for-byte identical and LiteSVM rejects the second as a duplicate signature — the *wrong* error. Expiring the blockhash ensures the failure comes from the `init` constraint, not the duplicate check.

---

## The Mutation Testing Experiment

On friday I deliberately broke the program in three ways, one at a time, and watched the tests catch each regression:

| Bug introduced | Test that failed | Why |
|---|---|---|
| Removed `has_one = authority` | `increment_fails_when_wrong_authority_signs` | Constraint gone, unauthorized call now succeeds |
| Changed `checked_add(1)` to `checked_add(2)` | `initialize_then_increment` | Count was 2, expected 1 |
| Commented out `counter.authority = ...` | `initialize_then_increment` | On-chain authority was all-zeros; `has_one` failed at increment time |

The third bug was the most instructive. The `initialize` transaction itself succeeded, i.e. the account was created and rent was paid. The bug only surfaced at `increment`, when the runtime compared the stored (all-zero) authority to the real signer and found a mismatch. The error pointed *downstream* of the cause. The tests caught it; the logs explained it.

---

## Take Home

Anchor constraints are not just convenience sugar. They are a **declarative authorization layer** that runs before your handler, cannot be bypassed by a careless refactor, and produces clear error messages when violated. Combined with LiteSVM's in-process test runner and a suite that includes both happy-path and failure tests, you get a feedback loop that's fast enough to run on every save and trustworthy enough to catch real bugs.

The mutation experiments this week weren't busywork. They were the proof. Every assertion that lit up red when I broke something is an assertion I now trust when it stays green.
