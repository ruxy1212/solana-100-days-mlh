# A Dive into PDAs on Solana

**Tags:** 100daysofsolana, rust, anchor, web3

---

> On Solana, programs are stateless. So if your program needs to remember something per user, per config, per anything, it needs a deterministic address it can find again later without storing it anywhere. PDAs are that address.

## The Mental Picture

From the web2 world, a PDA (or Program Derived Address) is like a database primary key you compute from the row's logical identity. But instead of `INSERT INTO counters (user_id) RETURNING id`, you run a hash over `["counter", user_pubkey, program_id]` and that hash *is* the address or PDA. It requires no lookup table and no coordination. The client and the program independently arrive at the same address every time.

But there's a twist here, that must be noted: PDAs are not necessarily similar rows in a table. Meaning that the address may exist, i.e. there is a live account with data at that location, or it may not. So deriving an address does not create an account. That is a separate step, and it costs rent (a small SOL deposit, held as collateral for the bytes you occupy on every validator). The derivation is just arithmetic.

Another observation to note is that the program ID is baked into the hash. The same seeds in a different program produce a completely different address. This implies that a PDA belongs to exactly one program, and only that program can authorize writes to it.

## The Derivation

On Day 64, I ran a standalone script to make the determinism tangible. The core of it was this:

```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
```

Running the same call twice gave the identical address. Running it with `"alice"` as a second seed gave something completely different, which is the whole point of PDAs.

When the same seeds moved into the counter program itself, they looked like this:

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

Key pieces to note:

- **`b"counter"`** — a static byte string that namespaces this address. Without it, different account types with the same user key would collide.
- **`user.key().as_ref()`** — the signer's public key as a byte slice. This is what gives every wallet its own address.
- **`bump`** — this is a range from 0 - 255, more on this below.
- **`space = 8 + Counter::INIT_SPACE`** — the `8` is Anchor's discriminator, a prefix that identifies which account type this is.

## Why the Seeds Matter

Day 68 especially, was deliberately breaking things, and it was my most instructive day this week.

Compare these two seed arrays:

```
seeds = [b"counter", user.key().as_ref()]  // per-user PDA
seeds = [b"counter"]                        // global PDA
```

The first gives every wallet its own isolated counter, while the second gives every wallet the *same* address, with a first-write-wins collision where whoever calls `init_counter` first owns the account for everyone. This is not a bug in either case; it is a design choice, just like the config singleton is intentionally global:

```rust
seeds = [b"config"],
bump
```

There's usually only one config per program, derived from a fixed seed, and initialized once. Calling `init` on an existing account will return a runtime error, so the singleton guarantee is enforced for free.

The near-miss variants from the collision experiment on Day 68 drove the point home. `"counter"`, `"counters"`, `"counter\0"`, and `"Counter"` each produce a completely unrelated address. There is no fuzzy matching, one byte difference, entirely different account namespace.

## The 'Bump' Key Piece

The bump, is the byte (0-255) that makes the whole thing work, even though it seems easy to hand-wave past it.

`findProgramAddressSync` hashes the seeds together with the program ID and a trailing byte, the bump, which starts at 255 and counting down to 0. Most public keys happen to fall on the ed25519 elliptic curve, which means they could theoretically have a private key. The runtime needs your PDA to be off that curve, so no one can generate a private key for it. The first bump value that produces an off-curve address is the **canonical bump**, and it is always the same for a given seed + program ID combination.

The canonical bump is the only safe one to use. Anchor finds it for you during `init` and Anchor also stores it for you (i.e. `bump` in the constraint and `counter.bump` in the struct). So that on subsequent instructions, you pass the stored bump back:

```rust
#[account(
    mut,
    seeds = [b"counter", user.key().as_ref()],
    bump = counter.bump,
)]
pub counter: Account<'info, Counter>,
```

Storing and re-passing is important here also, because re-deriving the canonical bump every time costs compute. Storing it once at init and re-using it is free.

## The Full Picture

Across the five days, this is how the counter account went through a complete lifecycle:

**Derive** — `findProgramAddressSync` on the client, same arithmetic in the program. Both sides agree on the address before any transaction is sent.

**Initialize** — `init` allocates the account, sets aside the rent-exempt deposit (lamports — Solana's smallest unit of currency), and populates the fields. This is the moment the address goes from "a possible location" to "a live account."

**Mutate** — subsequent `increment` calls re-derive the address from the signer's key and reject the transaction at the constraint layer if anything does not match. No defensive code needed inside the handler.

**Close** — Close the PDA account and reclaim rent. Day 67 added this, and it took one attribute:

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

Where `close = user` drains the lamports to the user's wallet and zeros the account data. When a Solana account's balance hits zero, the runtime removes it at the end of the transaction, without any separate delete syscall. A subsequent `getAccountInfo` returns `null`, which means that the rent deposit comes back in full, minus the transaction fee.

NB: This is not "delete from a table." The account disappears from the account model entirely. There is no tombstone, no soft-delete flag.

## The Little Observations

- **The program ID is part of the derivation.** Same seeds with different program —> different address. A PDA is not portable across programs.
- **PDAs cannot sign transactions on their own.** Only the program can authorize writes to a PDA, by presenting the same seeds internally. This is called signing with "signer seeds" and it happens inside the program, not in the client transaction.
- **Seed design is access control.** Including the user's pubkey in the seeds gives each wallet its own isolated namespace. Omitting it and every wallet shares one account. Both are valid choices, but you have to be deliberate. I saw this clearly when the spoof attempt where Wallet A trying to increment Wallet B's counter, and was rejected before the handler even ran, purely because the re-derived address did not match the supplied account.
- **`init_if_needed` is a footgun.** It initializes the account if it does not exist, silently does nothing if it does. That silent-do-nothing behavior is exactly the kind of thing that hides bugs in test suites. Reach for it deliberately and always test the already-initialized path explicitly.
