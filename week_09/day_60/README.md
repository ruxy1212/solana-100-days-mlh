# Day 60: Add Failure Tests So Green Checks Actually Mean Something

## The Goal
Add two failure tests to your LiteSVM suite — one that proves an unauthorized caller cannot increment, and one that proves the same counter cannot be initialized twice — while also refactoring the boilerplate into shared helper functions.

## Prerequisites
- Anchor counter project from Day 59 with `Counter`, `initialize`, and `increment` (protected by `has_one = authority`)
- The LiteSVM test harness already set up from Day 58

## Steps Taken

### 1. Merge the Imports
Your file already has a `use` block from Day 59. Add `Pubkey` to it — the helpers need it:

```rust
use anchor_lang::{
    prelude::Pubkey,
    solana_program::system_program,
    AccountDeserialize, InstructionData, ToAccountMetas,
};
use litesvm::LiteSVM;
use solana_instruction::Instruction;
use solana_keypair::Keypair;
use solana_signer::Signer;
use solana_transaction::Transaction;
```

### 2. Extract Helper Functions
Add three helpers below the imports to remove boilerplate that would otherwise be copy-pasted across every test:

```rust
fn setup_svm_with_program() -> (LiteSVM, Pubkey) {
    let mut svm = LiteSVM::new();
    let program_id = counter::ID;
    let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/counter.so");
    svm.add_program_from_file(program_id, so_path).unwrap();
    (svm, program_id)
}

fn build_initialize_tx(
    svm: &LiteSVM,
    program_id: Pubkey,
    authority: &Keypair,
    counter_kp: &Keypair,
) -> Transaction {
    let ix = Instruction {
        program_id,
        accounts: counter::accounts::Initialize {
            counter: counter_kp.pubkey(),
            authority: authority.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
        data: counter::instruction::Initialize {}.data(),
    };
    Transaction::new_signed_with_payer(
        &[ix],
        Some(&authority.pubkey()),
        &[authority, counter_kp],
        svm.latest_blockhash(),
    )
}

fn build_increment_tx(
    svm: &LiteSVM,
    program_id: Pubkey,
    authority: &Keypair,
    counter: Pubkey,
) -> Transaction {
    let ix = Instruction {
        program_id,
        accounts: counter::accounts::Increment {
            counter,
            authority: authority.pubkey(),
        }
        .to_account_metas(None),
        data: counter::instruction::Increment {}.data(),
    };
    Transaction::new_signed_with_payer(
        &[ix],
        Some(&authority.pubkey()),
        &[authority],
        svm.latest_blockhash(),
    )
}
```

### 3. First Failure Test — Wrong Authority
Add this below the happy-path test. It initializes a counter with `authority_a`, then tries to increment with `authority_b`. The `has_one = authority` constraint should reject it:

```rust
#[test]
fn increment_fails_when_wrong_authority_signs() {
    let (mut svm, program_id) = setup_svm_with_program();

    let authority_a = Keypair::new();
    let authority_b = Keypair::new();
    svm.airdrop(&authority_a.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&authority_b.pubkey(), 1_000_000_000).unwrap();

    let counter = Keypair::new();

    // authority_a creates the counter — must succeed
    let init_tx = build_initialize_tx(&svm, program_id, &authority_a, &counter);
    svm.send_transaction(init_tx).expect("initialize should succeed");

    // authority_b tries to increment — must fail
    let bad_tx = build_increment_tx(&svm, program_id, &authority_b, counter.pubkey());
    let result = svm.send_transaction(bad_tx);
    assert!(
        result.is_err(),
        "increment should fail when signed by the wrong authority"
    );
}
```

### 4. Second Failure Test — Double Initialization
Add this below the first failure test. It tries to initialize the same counter account twice. The `init` constraint must refuse to overwrite an account that already exists:

```rust
#[test]
fn initialize_fails_when_counter_already_exists() {
    let (mut svm, program_id) = setup_svm_with_program();

    let authority = Keypair::new();
    svm.airdrop(&authority.pubkey(), 1_000_000_000).unwrap();

    let counter = Keypair::new();

    let first_tx = build_initialize_tx(&svm, program_id, &authority, &counter);
    svm.send_transaction(first_tx).expect("first initialize should succeed");

    // Advance the blockhash so the second transaction is genuinely new,
    // ensuring the failure comes from the account check, not a duplicate signature.
    svm.expire_blockhash();

    let second_tx = build_initialize_tx(&svm, program_id, &authority, &counter);
    let result = svm.send_transaction(second_tx);
    assert!(
        result.is_err(),
        "initializing the same counter twice should fail"
    );
}
```

> **Why `expire_blockhash()`?** Without it, both transactions would be byte-for-byte identical and LiteSVM would reject the second as a duplicate signature — the wrong error for what you're testing. Expiring the blockhash makes the second transaction genuinely new so the failure comes from the `init` constraint.

### 5. Run the Full Suite
```bash
cargo test -p counter
```
You should see **three passing tests**: `initialize_then_increment`, `increment_fails_when_wrong_authority_signs`, and `initialize_fails_when_counter_already_exists`.

To inspect the error details, temporarily add `println!("{:?}", result);` above each `assert!` and run with `--nocapture`. The mismatch test should mention a `ConstraintHasOne` failure; the double-init test should mention the account is already in use.

## What Was Learnt
- **Failure tests are as important as happy-path tests.** A constraint that's never tested might as well not exist.
- Extracting shared setup into helper functions (`setup_svm_with_program`, `build_initialize_tx`, `build_increment_tx`) makes tests readable — the test body focuses on *intent*, not plumbing.
- `svm.expire_blockhash()` is necessary when you want to send two structurally identical transactions in the same test. Without it, the second is rejected as a duplicate before the program even runs.
- The Anchor error logs printed inside `FailedTransactionMetadata` tell you exactly which constraint was violated, making debugging fast.
