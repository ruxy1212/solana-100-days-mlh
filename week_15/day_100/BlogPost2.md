# What 100 Days of Solana Actually Taught Me

**Tags:** 100daysofsolana, rust, anchor, nextjs

---

> The final challenge did not ask for code. It asked for perspective. After 100 days, the real assignment was to look back at the mistakes, the repeated concepts, and the moments that finally made sense, then turn that into something another developer could use.

## Where I Started

At the beginning, Solana felt like a stack of unfamiliar nouns. Accounts. PDAs. Anchors. Constraints. Devnet. Every day added a new term, and early on it was easy to treat them like disconnected vocabulary.

That changed slowly.

The more I built, the more I realized the important question was not “what does this word mean?” but “what problem does this piece of the system solve?” Once that clicked, the program days stopped feeling random.

## What Changed My Understanding

The biggest shift for me was learning that the chain is not just storage with a fancy name. On Solana, the account layout, the PDA seeds, the constraints, and the tests are the actual design.

That showed up in the capstone work very clearly:

- the escrow state had to be structured so the app could read it later
- milestone logic had to be explicit enough that the UI could trust it
- reputation had to live in a place the wallet owner actually controlled
- the agent tool had to stay read-only so the model could inspect state without becoming a security boundary

In other words: the architecture was not separate from the program. It was the program.

## What I Understand Now

After 100 days, the most important thing I understand now is that Solana development is about making rules executable.

That means:

- if a wallet should own something, enforce it in the account structure
- if invalid input should fail, encode that failure in the program
- if a test should prove something, write both the success path and the refusal path
- if a UI should show truth, read from chain instead of reconstructing it by hand

That mindset helped more than any single command. It made debugging better, because a failed transaction stopped being mysterious and started being evidence.

## How It Appeared In My Capstone

Day 99 brought the whole workflow together in one app.

Trust Ledger combines the things I had been practicing all along:

- Anchor for the on-chain contract logic
- PDA-based state for deterministic records
- a Next.js frontend for actual human interaction
- wallet connection for user ownership
- an agent tool that reads the same on-chain truth in a different context

That is what made the capstone feel like a capstone instead of one more exercise. It was not just a program. It was a system.

If I had to describe the app in one line, it would be this:

> Trust Ledger lets people hire, work, and verify progress without asking a centralized platform to keep score for them.

## What I Would Tell Another Developer

Do not try to memorize Solana all at once.

Build enough to make the next mistake visible. Then fix that mistake in the smallest possible loop. The learning compounds fast when the feedback is specific.

I would also say this: devnet is not a toy. It is the rehearsal space where the shape of your product starts to matter. The faster you treat it like a real environment, the faster your code starts to behave like production code.

## The Way Forward

I am leaving the 100 days with a better instinct for state, ownership, and verification. Next I want to keep extending the capstone and keep using the same habit that got me here: build a small loop, make it real, and let the chain tell the truth.

*Check out my [100 Days of Solana Repository](https://github.com/ruxy1212/solana-100-days-mlh).*

The live link to Trust Ledger [is here](https://solana-100-days-mlh.vercel.app)
