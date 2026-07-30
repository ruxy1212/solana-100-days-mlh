# The Last Day of #100DaysOfSolana

**Tags:** 100daysofsolana, rust, anchor, nextjs

---

> After 100 days, today's agenda is to look back at the mistakes, the repeated concepts, and the moments that finally made sense, then turn that into something another developer could use, especially those coming from web2, just like I was, 14 weeks and 2 days ago.

## In The Beginning

In the first few weeks, Solana felt like a stack of unfamiliar nouns (and some parts still do, to be honest): Accounts. PDAs. Anchors. Constraints. Devnet. 

Actually, then, every day added a new term, but early on it was easy to treat them like disconnected vocabulary. That changed slowly, or quickly as we progressed.

Anyways, the more I built, the more I realized the important question was not “what does this word mean?” but “what problem does this piece of the system solve?” Once I clocked this, the concepts stopped feeling random.

## What Really Changed

The biggest shift for me was learning that the chain is not just storage with a fancy name. On Solana, the account layout, the PDA seeds, the constraints, and the tests are the actual design.

This showed up in my capstone project very clearly:

- the escrow state had to be structured so the app could read it later
- milestone logic had to be explicit enough that the UI could trust it
- reputation had to live in a place the wallet owner actually controlled
- the agent tool had to stay read-only so the model could inspect state without becoming a security boundary

In other words: the architecture was not separate from the program. It was in fact, the program.

## At This Point

After 100 days, the most important thing I understand now is that Solana development is about making rules reliable and executable.

That means:

- if a wallet should own something, enforce it in the account structure
- if invalid input should fail, encode that failure in the program
- if a test should prove something, write both the success path and the refusal path
- if a UI should show truth, read from chain instead of reconstructing it by hand

That mindset helps me relate more with Solana. It made debugging better, because a failed transaction stopped being mysterious and started being evidence.

## Last Kwekwe Project and First Real-World Product With Solana

the App, Trust Ledger, I built in Day 99 brought the whole workflow together in one place.

Trust Ledger combines the things I had been practicing all along:

- Anchor for the on-chain contract logic
- PDA-based state for deterministic records
- a frontend interface for actual human interaction
- wallet connection for user ownership
- an agent tool that reads the same on-chain truth in a different context.

If I had to describe the app in one line, it would be this:

> Trust Ledger lets people hire, work, and verify progress without asking a centralized platform to keep score for them.

## To The Upcoming

Do not try to memorize everything, all at once.

Build enough to make the next mistake visible. Then fix that mistake in the smallest possible loop. The learning compounds fast when the feedback is specific.

I would also say this: devnet is not a toy. It is the rehearsal space where the shape of your product starts to matter. The faster you treat it like a real environment, the faster your code will start to behave like production code.

## The Way Forward

I came, I anchor-built, and deployed. I am now leaving the 100 days with a better instinct for state, ownership, and verification. For now, I want to keep extending the capstone project and keep using the same habit that got me here: build a small loop, make it real, and let the chain tell the truth.

*Check out my [100 Days of Solana Repository](https://github.com/ruxy1212/solana-100-days-mlh).*

The live link to Trust Ledger [is here](https://solana-100-days-mlh.vercel.app)

*Au Revoir!*

