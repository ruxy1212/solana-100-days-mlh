# Building a Bulletproof Program in Solana: A Hands-On Security Checklist

**Tags:** 100daysofsolana, rust, anchor, web3

---

> On public blockchains, there are no friendly QA teams to catch your slip-ups before mainnet. The first entity to find a vulnerability in your code should be you. Here is the hands-on security checklist I built after auditing, testing, and intentionally breaking my own Anchor programs.

## The Background Picture

Transitioning from a traditional web2 backend to writing Solana programs requires a complete shift in security mindset. On Solana, the execution model is completely different: programs are stateless, so the runtime allows any arbitrary account to be passed into any instruction, and arithmetic overflows wrap silently in release builds.

Under pressure, it is easy to forget routine checks. That is why safety-critical industries use checklists. This checklist translates theoretical security concepts into concrete, verifiable rules that you can run down line by line before any contract touches mainnet.

## 1. Account Validation (The "Owner Question")

- ☑ **Every account's owner is validated.**
- ☑ **Account types are guarded by distinct 8-byte discriminators.**

On Solana, if you read an account's data without checking who owns it, an attacker can pass a fake account containing whatever bytes they want. This exact class of vulnerability resulted in the $326 million Wormhole bridge hack.

To understand the mechanics, I rebuilt this vulnerability in a sandbox using LiteSVM. The vulnerable program accepted an `UncheckedAccount` and deserialized it:

```rust
// VULNERABLE: we read this account's bytes without checking who owns it.
let data = ctx.accounts.config.try_borrow_data()?;
let config = Config::try_deserialize(&mut &data[..])?;
```

Because there was no owner validation, an attacker could set up a custom account owned by the System Program, write a custom config layout with their own public key as the admin, and bypass the authorization checks.

The fix is declarative. By changing the account type to Anchor's typed wrapper, Anchor validates the owner and discriminator before execution:

```rust
// SECURE: Account<'info, T> automatically checks the discriminator and program ownership.
pub config: Account<'info, Config>,
```

## 2. Authority & Signer Checks (The "Signer Question")

- ☑ **Privileged actions require a verified signature, not just a matching key.**
- ☑ **Anchor constraints (`has_one` or custom `constraint`) enforce logical ownership.**

Just because a public key is passed into your instruction and matches a storage field does not mean that the wallet owner authorized the action. You must verify the signature flag:

```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump,
        has_one = authority, // Enforces vault.authority == authority.key()
    )]
    pub vault: Account<'info, Vault>,
    pub authority: Signer<'info>, // Verifies the authority signed the transaction
}
```

## 3. Arithmetic Safety

- ☑ **Every math operation uses checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`).**
- ☑ **All mathematical assumptions are proven using property-based testing.**

Rust compiles with overflow checks enabled in debug builds, but in release mode (by default on mainnet), overflows wrap around silently. To ensure safety, we must write pure math functions and stress-test them.

Instead of guessing inputs, we can use property-based testing (`proptest`) to throw thousands of random numbers at our math module:

```rust
pub fn apply_deposit(balance: u64, amount: u64) -> Option<u64> {
    balance.checked_add(amount)
}

#[cfg(test)]
mod tests {
    use super::apply_deposit;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn deposit_never_shrinks_a_balance(balance in any::<u64>(), amount in any::<u64>()) {
            match apply_deposit(balance, amount) {
                Some(new_balance) => prop_assert!(new_balance >= balance),
                None => prop_assert!(balance.checked_add(amount).is_none()),
            }
        }
    }
}
```

## 4. Invariant Fuzzing

- ☑ **State invariants are tested through multi-step instruction sequences.**

While unit tests prove isolated logic, vulnerabilities often arise from unexpected interaction sequences. Fuzzing frameworks like **Trident** allow you to set up guided, automated instruction flows (like running `deposit` continuously) to ensure your invariants hold:

```rust
#[flow]
fn deposit_never_shrinks(&mut self) {
    let before = self.trident.get_account_with_type::<Vault>(&vault_pda, 8).map(|v| v.balance).unwrap_or(0);
    let amount = self.trident.random_from_range(0..1_000_000u64);
    
    // Process random deposit instruction...
    
    if let Some(v) = self.trident.get_account_with_type::<Vault>(&vault_pda, 8) {
        assert!(v.balance >= before, "deposit shrank the balance");
    }
}
fn main() {
    FuzzTest::fuzz(1000, 100);
}
```

The fuzzing campaign was configured using FuzzTest::fuzz(1000, 100). So rather than executing 1,000 individual instructions, the framework generated approximately 1,000 randomized instruction sequences, each containing up to 100 operations. This resulted in roughly 100,000 instruction executions, allowing the program invariants to be validated across a wide variety of automatically generated transaction sequences.

## 5. Adversarial Testing with LiteSVM

- ☑ **The test suite includes tests designed explicitly to rob the vault.**
- ☑ **Assertions check for specific error codes, preventing false positive passes.**

A robust security verification flow doesn't just check the happy path; it acts as a pessimist. Write dedicated test cases that mimic penetration attacks—trying to withdraw without a signature, swapping PDA inputs, or attempting to trigger underflows.

```rust
#[test]
fn wrong_signer_is_rejected() {
    let mut svm = setup_svm();
    // Craft transaction with invalid signer, send, and verify error code
    let result = svm.send_transaction(tx);
    assert!(result.is_err());
    // Assert the exact Anchor error (e.g. 2006 for ConstraintHasOne)
}
```

By enforcing specific error code matches, you ensure the transaction failed for the exact security boundary you defined, rather than an unrelated execution error. 

---

One final, but very important check, was to ensure that while these bulletproof methods were in place, our program would not lock out **legitimate** actors.

![Legitimate Test](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/2dkq07mstzyh8iz2i5fi.png)

---

*This post summarizes what was learnt across Arc12 (Days 78–84) of #100DaysOfSolana. We moved from auditing state accounts, hardening instructions, writing adversarial tests in LiteSVM, to fuzzing code paths with Trident and reproducing real-world vulnerability patterns.*

*[See the complete Arc12 advanced testing repository on Github.](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/week12)*
