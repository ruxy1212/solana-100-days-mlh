# The Trust Ledger I Built After 100 Days of Solana

**Tags:** 100daysofsolana, rust, anchor, nextjs

---

> Day 99. I built Trust Ledger, an app that lets clients lock funds into milestone-based contracts, and lets freelancers grow a reputation that sticks to their wallet, and it also lets an AI agent read reputation without ever touching funds.

## The Background Picture

The easiest way to describe this app is to ask a simple question: what should happen when work moves from “we should probably trust each other” to “the money is already on chain”? Trust Ledger is my answer.

The app has four moving parts that stay tied together:

- a client flow for creating a contract
- freelancer profiles that live on chain
- milestone tracking that makes progress visible
- a dashboard that turns all of that into something you can actually use

That last part is the _kpim_. A contract on Solana is not interesting because it exists. It is interesting because a real person can open the app, connect a wallet, and immediately see what is happening.

## What The App Feels Like

Open the homepage and the app does not greet you with a wall of documentation. It says what it is trying to do:

> Escrow that releases funds by milestones. Reputation that stays with your wallet.

That is the whole point, really. The wallet is the identity layer. The chain is the source of truth, and the UI just makes the truth easier to read.

From there, the app splits into two natural paths:

- If you are hiring, you create a contract and track milestones.
- If you are freelancing, you create a profile and build your reputation.

Then there is the public side. You can view profiles, inspect contracts, and check the state of a wallet without needing to guess what the backend thinks happened.

## The Pieces That Made It Click

The most useful part of this build was not a single feature. It was how the pieces stopped pretending to be separate.

- The wallet adapter makes the user real.
- Anchor makes the program rules real.
- The PDA derivations make the addresses predictable.
- The dashboard makes the data readable.
- The agent tool makes the same on-chain state usable in a second context.

That is the kind of integration that only shows up after a lot of small reps. On earlier days, each piece felt like its own exercise. Here, they started to behave like a product.

## Why I Like This One

I like this capstone because it does not try to be flashy for the sake of it. It tries to be useful.

It answers a practical problem:

- how do you pay people without losing control of the payment flow?
- how do you build reputation that is not trapped in one platform?
- how do you make chain data accessible to a person, and even to an agent, without changing who owns the data?

The wallet stays sovereign. The state stays public. The application stays honest about what it can and cannot do.

## The Way Forward

I want to keep expanding Trust Ledger with better contract views, verification badges (revocable), clearer milestone flows, and a tighter agent experience. The bigger lesson from the build is still the same one I keep running into on Solana: if you can make the state public, the rules explicit, and the UI honest, the rest gets easier to reason about.

*Check out my [100 Days of Solana Repository](https://github.com/ruxy1212/solana-100-days-mlh).*

The live link to Trust Ledger [is here](https://solana-100-days-mlh.vercel.app)
