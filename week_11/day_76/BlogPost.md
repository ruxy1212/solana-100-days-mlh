# A CPI Is a Function Call with a Guest List

**Tags:** 100daysofsolana, rust, anchor, web3

---

> Five days ago, CPI was three letters I had started to recognize in the docs. Now I have watched programs call the System Program, Token-2022, and even my own code.

## The Background Picture

A cross-program invocation is exactly what it sounds like: your program pauses, calls an instruction in a different program, waits for it to return, and then picks up where it left off. That description sounds simple, but the first time you stare at a `CpiContext` you do not feel simplicity; you feel three unfamiliar arguments and a missing mental model.

Every CPI is a function call with a guest list. Your program is the host. The program you are calling is the venue. The guest list is the set of accounts that venue needs to do its job. Before it lets anyone in, the runtime checks three things:

- **The program being called — identified by its program ID.** When you write `CpiContext::new(ctx.accounts.system_program.key(), ...)`, that first argument is the ID of the program you are delegating to. The runtime verifies it is a real deployed program.

- **The accounts that program needs — which your program has to pass through.** The program you are calling cannot see your entire account list. It only sees what you hand it inside the struct you attach to the context. If you forget an account, the inner program gets a lamport discrepancy or an unexpected signer error, not a helpful message.

- **The signer authority — either a real keypair or a PDA your program signs for.** This is the one that took me the longest to understand, so it gets its own section below.

## The Code: Smallest Working CPI

Here is the deposit handler from the vault program on Day 73. It is the smallest CPI I have that is doing something real:

```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.key(),
        Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
    );
    transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}
```

Three things to notice. First, `system_program.key()` is the target program ID — the first argument to `CpiContext::new`. Second, `Transfer { from, to }` is the guest list, the exact accounts the System Program needs to move lamports. Third, the user is a `Signer`, so the runtime already has their signature from the outer transaction; it is automatically forwarded into the inner one. No extra work needed.

## Signer Seeds: How a Program Proves It Is the PDA

The deposit CPI above is an easy case. The user signed the outer transaction, so the System Program happily accepts their authority over the `from` account.

The withdraw case is different. The `from` account is the vault PDA, i.e. an address with no private key. Nobody could have signed the transaction on its behalf. This is where `invoke_signed` (and Anchor's `.with_signer(...)`) comes in.

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let user_key = ctx.accounts.user.key();
    let bump = ctx.bumps.vault;

    let signer_seeds: &[&[&[u8]]] = &[&[b"vault", user_key.as_ref(), &[bump]]];

    let cpi_ctx = CpiContext::new(
        ctx.accounts.system_program.key(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        },
    )
    .with_signer(signer_seeds);

    transfer(cpi_ctx, amount)?;
    Ok(())
}
```

The seeds array in `.with_signer(...)` is the program saying: _"I can reproduce the derivation that created this address. Here are the ingredients."_ The runtime re-derives the PDA from those seeds plus the calling program's ID and checks that it matches the account you are claiming authority over. If it does, the CPI proceeds as if the vault signed it. If it does not, the transaction fails before any lamports move.

This is the moment `invoke_signed` clicked for me: the seeds inside your handler have to match the seeds inside your `#[account(seeds = ..., bump)]` constraint exactly. Those two places are talking about the same address. When they match, you get a vault your program can spend from. When they differ, you get an error.

## The Little Observations

On Day 75, I broke the signer seeds on purpose. I changed `b"vault"` to `b"vault!"` in the `.with_signer(...)` call while the constraint on the accounts struct still said `b"vault"`. The runtime error was:

```plaintext
Error: Cross Program Invocation with Unauthorized Signer
```

It is a short sentence but it is a precise diagnosis. The System Program looked at the vault account in the Transfer struct, expected a valid signature on its behalf; either a real keypair in the transaction or a valid `invoke_signed` derivation, and found neither. The seeds mismatch meant the re-derived address did not match the vault, so the program's implicit signature was rejected. The fix was to put `b"vault"` back in both places.

## Where to Go Next

The same `CpiContext` pattern scales without modification. On Day 72, the same three-piece structure called `token_interface::mint_to` against the Token-2022 program. On Day 74, it called an `increment` instruction in a second program I wrote, with `declare_program!(counter)` generating the CPI client from the counter's IDL automatically.

One pattern, three targets, identical shape each time. That is the thing worth internalizing. Once the pattern is solid, picking a new CPI target is mostly reading the target program's accounts struct and mapping it to the guest list.

---

*This post draws from Days 71–75 of #100DaysOfSolana. Day 71 was my very first first CPI. Day 73 was the PDA-signed vault. Day 74 was program-to-program. Day 75 was deliberately breaking all three.*

*[See the complete Arc11 flow on Github](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/week_11)*
