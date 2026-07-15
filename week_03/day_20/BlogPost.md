# Week3 of #100DaysOfSolana: Understanding Solana Transactions

**Tags:** 100daysofsolana, solana, web3, blockchain

By the end of Week 2, I understood how data lives on accounts, public keys, and the absence of a backend. This week was about understanding *change*: how transactions work, how to build them, and what happens when they fail.

The turning point: transactions aren't requests to a server. They're cryptographically signed messages that prove you own the keypair and authorize a specific state change. And if they fail, the whole thing rolls back (even though you still pay the fee :)).

## The Week 3 Journey

### Day 15: Understand transaction anatomy

I started by taking apart an actual transaction on devnet. I sent a small transfer and then inspected it:

- Pulled the transaction signature from the terminal
- Ran `solana confirm -v SIGNATURE` to see the raw structure
- Opened the same transaction in Solana Explorer and compared the two views

What I discovered: a transaction has exactly five parts:

| Part | What it means | Web2 analogy |
| :--- | :--- | :--- |
| **Signatures** | 64-byte Ed25519 signatures proving you own the keypair | Auth token |
| **Header** | Three bytes describing how many signers and read-only accounts | HTTP headers |
| **Account Keys** | Every account the transaction may touch, in order | Paths / query params |
| **Recent Blockhash** | A recent block hash that expires in ~60-90 seconds | CSRF token with expiry |
| **Instructions** | The actual program calls with program ID, accounts, and data | Request body |

The constraint clicked immediately: a serialized transaction must fit within **1,232 bytes**. That's the maximum. And if any instruction fails, the whole transaction rolls back atomically (and like I stated before, you will still pay the fee).

In Web2, I'm used to stateless request/response. This is different. A transaction is atomic, expiring, and size-limited. Those aren't bugs; they're features that make on-chain state changes safe and deterministic.

### Day 16: Send your first SOL transfer

Next, I built the practical skill: actually sending SOL on devnet.

The steps felt straightforward:
- Set the CLI to devnet: `solana config set -ud`
- Airdrop 2 SOL (devnet only)
- Create a recipient keypair
- Send 0.5 SOL: `solana transfer RECIPIENT_PUBKEY 0.5 --allow-unfunded-recipient`
- Verify both balances changed on-chain

### Day 17: Build a transfer tool

Then I wrote a reusable CLI tool that accepts a recipient and amount. This wasn't just wrapping the CLI command. The tool worked. I could send SOL with three lines of code. But the real insight was seeing the transaction signature in the output. That signature is both the receipt and the transaction's unique ID. I can search it on Solana Explorer forever.

### Day 18: Add transaction confirmation UI

On this day, I added a confirmation layer to transaction implementation:

This added complexity, but it taught me something crucial: transactions are asynchronous. You send it, you get a signature immediately, but the transaction isn't confirmed until validators include it in a block. That can take seconds or fail entirely if the blockhash is too old.

### Day 19: Explore failed transactions

Finally, I broke transactions on purpose to understand failure modes.

I forced invalid scenarios:
- Sending more SOL than I had
- Sending to invalid addresses

Each failure gave me a different error message on-chain:

- `InsufficientFunds` — clear and expected
- Invalid address formats — caught during construction before sending

## What Clicked for Me

**Transactions as cryptographic proof**. In Web2, a request is just data sent to a trusted server. On Solana, a transaction is a cryptographically signed message that proves I authorized it and that it hasn't been tampered with. That's a fundamentally more trustless model.

Also: **confirmation is different from sending**. The signature appears immediately, but confirmation requires validators to include the transaction in a block. Polling for confirmation taught me that devnet sometimes takes a few seconds, and mainnet is even less predictable. I can't assume a transaction is final just because I have the signature.

**What about you?** Have you built with Solana transactions yet? What surprised you most about how they work? Drop a comment below.
