# Day 59: Add an Increment Instruction and Test Both Calls End to End

## The Goal
Add an `increment` instruction protected by a `has_one = authority` constraint, then write a single end-to-end LiteSVM test that calls both instructions in sequence.

## Prerequisites
- Anchor counter project from Day 58 with `Counter` account and `initialize` instruction in place
- Rust, Cargo, and Anchor CLI installed
- `litesvm` crate already wired into `Cargo.toml`

## Steps Taken

### 1. Add the `increment` Handler
Open `programs/counter/src/lib.rs`. Add a second handler below `initialize`:

```rust
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = counter.count
        .checked_add(1)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    Ok(())
}
```

`checked_add` returns an `Option`, so an overflow returns an error instead of panicking.

### 2. Add the `Increment` Accounts Struct
Below your `Initialize` struct, add:

```rust
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
```

The `has_one = authority` attribute tells Anchor: before this handler runs, confirm the `authority` field stored inside the counter account matches the `authority` signer passed in this transaction. If they don't match, the transaction fails before your code executes.

### 3. Rebuild
```bash
anchor build
```
This regenerates the compiled binary and the typed account/instruction helpers your tests rely on.

### 4. Update the Test File
Replace `programs/counter/tests/counter.rs` with a single test that covers both instructions end to end:

```rust
use anchor_lang::{
    solana_program::system_program,
    AccountDeserialize, InstructionData, ToAccountMetas,
};
use litesvm::LiteSVM;
use solana_instruction::Instruction;
use solana_keypair::Keypair;
use solana_signer::Signer;
use solana_transaction::Transaction;

#[test]
fn initialize_then_increment() {
    let mut svm = LiteSVM::new();
    let program_id = counter::ID;
    let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/counter.so");
    svm.add_program_from_file(program_id, so_path).unwrap();

    let authority = Keypair::new();
    svm.airdrop(&authority.pubkey(), 1_000_000_000).unwrap();
    let counter_kp = Keypair::new();

    // 1) initialize
    let init_ix = Instruction {
        program_id,
        accounts: counter::accounts::Initialize {
            counter: counter_kp.pubkey(),
            authority: authority.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
        data: counter::instruction::Initialize {}.data(),
    };
    let bh = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&authority.pubkey()),
        &[&authority, &counter_kp],
        bh,
    );
    svm.send_transaction(tx).unwrap();

    // 2) increment
    let inc_ix = Instruction {
        program_id,
        accounts: counter::accounts::Increment {
            counter: counter_kp.pubkey(),
            authority: authority.pubkey(),
        }
        .to_account_metas(None),
        data: counter::instruction::Increment {}.data(),
    };
    let bh = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[inc_ix],
        Some(&authority.pubkey()),
        &[&authority],
        bh,
    );
    svm.send_transaction(tx).unwrap();

    // 3) read and assert
    let account = svm.get_account(&counter_kp.pubkey()).unwrap();
    let parsed = counter::Counter::try_deserialize(&mut account.data.as_slice()).unwrap();
    assert_eq!(parsed.count, 1);
    assert_eq!(parsed.authority, authority.pubkey());
}
```

### 5. Run the Test
```bash
anchor build && cargo test -p counter -- --nocapture
```

## What Was Learnt
- How `has_one = authority` works as **declarative authorization** — checked by the runtime before the handler even loads, equivalent to a backend `403` check but impossible to accidentally skip.
- The pattern of a Solana program: a named instruction handler in `#[program]`, an accounts struct that declares what gets passed in, and a transaction on the client side that names the instruction and supplies those accounts.
- A key LiteSVM behaviour: **state persists across transactions** within one `LiteSVM` instance, just as it would on a real cluster. The counter created in step one was still there when it was incremented in step two, making the test a genuine end-to-end simulation.
- `increment` only requires one signer (`authority`) — unlike `initialize`, there's no new account being created at a fresh keypair address.
