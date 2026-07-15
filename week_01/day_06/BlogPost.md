# Week1 of #100DaysOfSolana

**Tags:** 100daysofsolana, solana, web3, blockchain

By Day 1 of this challenge, I thought I was doing something small: generate a wallet, print an address, move on.

I ran a script, got a fresh keypair, and saw a long string appear in my terminal. It looked random and slightly intimidating, but also familiar in the same way SSH keys feel familiar. In Web2, I have dozens of identities: GitHub username, work email, banking login, social accounts. Every system has its own account model, its own password reset flow, and its own lockout rules.

Solana felt different immediately. That one keypair was not just an account for one app. It was the beginning of identity across an entire network.

## The Week 1 Journey That Made It Click

### Day 1: "Here is your wallet"

The first script generated a keypair and printed the public key. The idea seemed simple:

- Public key = safe to share
- Private key = proof of ownership

At this stage, it still felt like setup boilerplate.

### Day 2: "Make it persistent"

Then I built a script that loads an existing wallet from `wallet.json` or creates one if missing. That changed the feeling.

In Web2, identity is often a row in a database controlled by a platform. In this script, identity became something I could hold, persist, and re-use without asking anyone for permission. I also started to understand responsibility: if I lose this private key, there is no "Forgot Password" link.

### Day 3: SOL vs lamports

I set up the CLI wallet and looked at balances both in SOL and in lamports. One SOL equals one billion lamports. Seeing balances in the smallest unit made Solana feel less abstract. It reminded me of cents in payments systems, except enforced by protocol rules instead of application code conventions.

### Day 4: Browser wallet connection

This was the turning point. I built a Vite page, discovered installed wallets with Wallet Standard, connected one, and fetched balance from RPC.

In Web2 terms, this is what stood out: the app did not "create" my identity. The wallet presented an account, and the app read state from the network. The identity lived outside the app. If I switch apps, I keep the same on-chain identity because it is tied to my keypair, not that product's user table.

### Day 5: Compare wallet types

After trying CLI, browser, and mobile wallets, I saw a practical tradeoff:

- CLI: fastest for scripts and learning
- Browser: best UX for dApps
- Mobile: strongest day-to-day hot-wallet security

Different interfaces, same underlying identity model.
