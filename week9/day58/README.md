# Day 58: Add State and Write Your First LiteSVM Test

## The Goal
Add a `Counter` account and an `initialize` instruction to your Anchor program, then write a LiteSVM integration test that proves the account is created with the correct initial state.

## Prerequisites
- Anchor project scaffolded on Day 57
- Rust & Cargo on your path
- Anchor CLI 1.0 or newer

## Steps Taken

### 1. Update `programs/counter/src/lib.rs`
Replace the scaffolded body with a program that owns a `Counter` account and an `initialize` instruction:

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_DECLARED_ID_HERE");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
}
```

Key concepts:
- `#[account]` on `Counter` tells Anchor this struct represents an on-chain account, adding an 8-byte discriminator.
- `#[derive(InitSpace)]` auto-computes the byte size of the struct fields.
- The `init` constraint makes a CPI to the System Program, allocates bytes, funds rent from `authority`, and assigns the account to your program.

### 2. Build the Program
```bash
anchor build
```
This produces `target/deploy/counter.so` — the SBF binary that LiteSVM will execute.

> **Note:** Delete the default `test_initialize.rs` file Anchor generated during scaffolding before building, as it references the old setup and may cause conflicts.

### 3. Add the LiteSVM Test
Create `programs/counter/tests/counter.rs`:

```rust
use anchor_lang::{
    solana_program::system_program,
    AccountDeserialize, InstructionData, ToAccountMetas,
};
use counter::{accounts as counter_accounts, instruction as counter_instruction, Counter};
use litesvm::LiteSVM;
use solana_instruction::Instruction;
use solana_keypair::Keypair;
use solana_signer::Signer;
use solana_transaction::Transaction;

#[test]
fn initialize_sets_count_to_zero() {
    let mut svm = LiteSVM::new();

    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10 * 1_000_000_000).unwrap();

    let program_id = counter::ID;
    let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/counter.so");
    svm.add_program_from_file(program_id, so_path).unwrap();

    let counter_kp = Keypair::new();

    let ix = Instruction {
        program_id,
        accounts: counter_accounts::Initialize {
            counter: counter_kp.pubkey(),
            authority: payer.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
        data: counter_instruction::Initialize {}.data(),
    };

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[&payer, &counter_kp],
        svm.latest_blockhash(),
    );

    svm.send_transaction(tx).expect("initialize should succeed");

    let raw = svm.get_account(&counter_kp.pubkey()).expect("counter exists");
    let state = Counter::try_deserialize(&mut raw.data.as_slice()).unwrap();

    assert_eq!(state.count, 0);
    assert_eq!(state.authority, payer.pubkey());
}
```

### 4. Add Dev Dependencies
Open `programs/counter/Cargo.toml` and add under `[dev-dependencies]`:

```toml
litesvm = "0.10.0"
solana-message = "3.0.1"
solana-transaction = "3.0.2"
solana-signer = "3.0.0"
solana-keypair = "3.0.1"
solana-instruction = "3"
```

### 5. Run the Test
```bash
cargo test -p counter --test counter -- --nocapture
```

You should see one passing test in well under a second.

## What Was Learnt
- How Anchor's `#[account]` macro works and what the discriminator is for.
- How `#[derive(InitSpace)]` eliminates manual byte-size calculations.
- How the `init` constraint wires together account creation, rent funding, and program ownership in a single declarative line.
- How LiteSVM acts as an in-process Solana VM — no devnet, no flakiness, just your code and a controlled environment.
- Why `counter_kp` must also sign the transaction: the System Program requires the holder of a new address to prove they want it created there.
