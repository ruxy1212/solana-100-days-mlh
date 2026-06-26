# What I Learned About PDAs in a Week of Building on Solana

**Tags:** 100daysofsolana, rust, anchor, web3

---

On Solana, programs are stateless. If your program needs to remember something per user, per config, per anything — it needs a deterministic address it can find again later without storing it anywhere. PDAs are that address. This week I spent five days with nothing but a counter program and that one idea, and by the end I had a mental model I can actually defend.

## The Mental Model

The Web2 analogy that clicked for me: a PDA is like a database primary key you compute from the row's logical identity. Instead of `INSERT INTO counters (user_id) RETURNING id`, you run a hash over `["counter", user_pubkey, program_id]` and that hash *is* the address. No lookup table. No coordination. The client and the program independently arrive at the same address every time.

Where the analogy breaks: PDAs are not rows in a table. The address may exist — meaning there is a live account with data at that location — or it may not. Deriving an address does not create an account. That is a separate step, and it costs rent (a small SOL deposit, held as collateral for the bytes you occupy on every validator). The derivation is just arithmetic.

The other thing the analogy misses: the program ID is baked into the hash. The same seeds in a different program produce a completely different address. A PDA belongs to exactly one program, and only that program can authorize writes to it.

## Anatomy of a Derivation

On Day 64, before touching any program logic, I ran a standalone script to make the determinism tangible. The core of it was this:

```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
```

Running the same call twice gave the identical address. Running it with `"alice"` as a second seed gave something completely different. That is the whole game.

When the same seeds moved into the program itself (Day 65), they looked like this:

```rust
#[account(
    init,
    payer = user,
    space = 8 + Counter::INIT_SPACE,
    seeds = [b"counter", user.key().as_ref()],
    bump
)]
pub counter: Account<'info, Counter>,
```

Every piece matters:

- **`b"counter"`** — a static byte string that namespaces this address. Without it, different account types with the same user key would collide.
- **`user.key().as_ref()`** — the signer's public key as a byte slice. This is what gives every wallet its own address.
- **`bump`** — more on this below.
- **`space = 8 + Counter::INIT_SPACE`** — the `8` is Anchor's discriminator, a prefix that identifies which account type this is. Forget it and the account layout is corrupt.

## Why the Seeds Matter

Day 68 was deliberately breaking things, and it was the most instructive day of the week.

Compare these two seed arrays:

```
seeds = [b"counter", user.key().as_ref()]  // per-user PDA
seeds = [b"counter"]                        // global PDA
```

The first gives every wallet its own isolated counter. The second gives every wallet the *same* address — a first-write-wins collision where whoever calls `init_counter` first owns the account for everyone. This is not a bug in either case; it is a design choice. The config singleton I added on Day 66 is intentionally global:

```rust
seeds = [b"config"],
bump
```

One config per program, derived from a fixed seed, initialized once. Calling `init` on an existing account is a hard runtime error, so the singleton guarantee is enforced for free.

The near-miss variants from the collision experiment drove the point home. `"counter"`, `"counters"`, `"counter\0"`, and `"Counter"` each produce a completely unrelated address. There is no fuzzy matching in PDA-land. One byte difference, entirely different account namespace.

## What the Bump Buys You

The bump is the byte that makes the whole thing work, and it is easy to hand-wave past it.

`findProgramAddressSync` hashes the seeds together with the program ID and a trailing byte — the bump — starting at 255 and counting down. Most public keys happen to fall on the ed25519 elliptic curve, which means they could theoretically have a private key. The runtime needs your PDA to be off that curve, so no one can generate a private key for it. The first bump value that produces an off-curve address is the **canonical bump**, and it is always the same for a given seed + program ID combination.

The canonical bump is the only safe one to use. Anchor finds it for you during `init` and Anchor also stores it for you — that is what `bump` in the constraint and `counter.bump` in the struct are doing. On subsequent instructions, you pass the stored bump back:

```rust
#[account(
    mut,
    seeds = [b"counter", user.key().as_ref()],
    bump = counter.bump,
)]
pub counter: Account<'info, Counter>,
```

Storing and re-passing is important: re-deriving the canonical bump every time costs compute. Storing it once at init and re-using it is free.

## The Full Lifecycle

Across the five days, the counter account went through a complete lifecycle:

**Derive** — `findProgramAddressSync` on the client, same arithmetic in the program. Both sides agree on the address before any transaction is sent.

**Initialize** — `init` allocates the account, sets aside the rent-exempt deposit (lamports — Solana's smallest unit of currency), and populates the fields. This is the moment the address goes from "a possible location" to "a live account."

**Mutate** — subsequent `increment` calls re-derive the address from the signer's key and reject the transaction at the constraint layer if anything does not match. No defensive code needed inside the handler.

**Close** — Day 67 added this, and it took one attribute:

```rust
#[account(
    mut,
    close = user,
    seeds = [b"counter", user.key().as_ref()],
    bump = counter.bump,
    has_one = user,
)]
pub counter: Account<'info, Counter>,
```

`close = user` drains the lamports to the user's wallet and zeros the account data. When a Solana account's balance hits zero, the runtime removes it at the end of the transaction — no separate delete syscall. A subsequent `getAccountInfo` returns `null`. The rent deposit comes back in full, minus the transaction fee.

This is not "delete from a table." The account disappears from the account model entirely. There is no tombstone, no soft-delete flag.

## What I Would Tell Past Me

- **The program ID is part of the derivation.** Same seeds, different program — different address. A PDA is not portable across programs.
- **PDAs cannot sign transactions on their own.** Only the program can authorize writes to a PDA, by presenting the same seeds internally. This is called signing with "signer seeds" and it happens inside the program, not in the client transaction.
- **Seed design is access control.** Including the user's pubkey in the seeds gives each wallet its own isolated namespace. Omitting it and every wallet shares one account. Both are valid choices, but you have to be deliberate. I saw this clearly when the spoof attempt on Day 68 — Wallet A trying to increment Wallet B's counter — was rejected before the handler even ran, purely because the re-derived address did not match the supplied account.
- **`init_if_needed` is a footgun.** It initializes the account if it does not exist, silently does nothing if it does. That silent-do-nothing behavior is exactly the kind of thing that hides bugs in test suites. Reach for it deliberately and always test the already-initialized path explicitly.

---

The code from this week lives in the [week10 folder of my 100 Days of Solana repo](https://github.com/ruxy1212/solana-100-days-mlh). For the official documentation I kept open while writing this: the [Solana PDA docs](https://solana.com/docs/core/pda), the [Anchor PDA guide](https://www.anchor-lang.com/docs/pdas), and the [Anchor crate docs](https://docs.rs/anchor-lang/latest/anchor_lang/) for the constraint syntax.

`#100DaysOfSolana`
