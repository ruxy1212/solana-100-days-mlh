# Week2 of #100DaysOfSolana: The Account Model Clicked

**Tags:** 100daysofsolana, solana, web3, blockchain, account-model, rpc

By the end of Week 1, I understood identity on Solana. This week was about understanding *state*.

In traditional Web2 development, I was trained to think in two separate layers: code lives on a server, data lives in a database. They talk to each other through queries and middleware. It felt natural because I built that way for years. But Solana doesn't work that way, and this week it finally made sense why.

## The Week 2 Journey: From RPC Queries to Account Architecture

### Day 8: "Read your first on-chain data"

I wrote a simple script that connected to devnet's RPC and queried a balance. It felt like calling a REST API—maybe because it *is* one, just pointing at a different kind of backend.

The key moment: I realized I wasn't querying a database. I was asking the Solana network for the state of an *account*. That account is not a row in a table somewhere. It's a first-class entity on the ledger itself.

### Day 9: "Fetch transactions"

Next, I pulled transaction history for an address. Seeing block times, signatures, and slot numbers make me realize: every state change is a transaction, and every transaction is immutable history on-chain.

For the first time, I understood audit logs at the protocol level. There's no way to delete a transaction. No way to "update" the past. If a balance changed, that change is forever visible to everyone.

### Day 10: "Build a dashboard"

I built a browser app that displays account data. Nothing fancy, just RPC calls in the frontend, rendered on the page.

What clicked: the dashboard talks directly to the network. No backend API needed. No session management. The wallet in the browser is the auth. The RPC endpoint is the database. This is genuinely different.

### Day 11: "Compare accounts vs databases"

This was the aha moment. I mapped Web2 database concepts to Solana accounts:

- Rows → Accounts
- Tables → A flat space of accounts identified by public key
- Auto-increment IDs → Base58 public keys
- Middleware auth → Program ownership rules
- Storage costs → Rent-exempt deposits

Seeing the comparison table made it real. The account model isn't just a different API. It's a fundamentally different way to think about data architecture. There's no "join" operation because you organize data differently from the start. You fetch accounts by address, not by filtering queries. And you pay explicitly for storage, which makes you think carefully about what you store.

### Day 12: "Compare networks"

Finally, I queried the same address on both devnet and mainnet. Different balances, different transaction histories, same address model.

The insight: the architecture is identical, but the state is independent. Devnet is a sandbox. Mainnet is production. Both follow the same rules. I could deploy the same program to both and it would work. Same address derivation, same account queries, different network validators securing different state.

## What Surprised Me

The biggest surprise was realizing I could build a complete on-chain app without writing a backend. In Web2, "no backend" means leaning on a third-party service (Firebase, Supabase, etc.). On Solana, "no backend" means the network *is* the backend. The RPC is the API. The ledger is the database. Wallets handle identity.

## What Clicked

The account model. Not as an abstract concept, but as a practical architecture. I spent years optimizing relational database queries. Now I see: Solana made a different trade-off. No joins, explicit costs, but perfect auditability and no central control. It's not better or worse—it's a different game.

## What's Still Confusing

PDAs (Program Derived Addresses) and how they relate to accounts. I saw them mentioned but haven't built with them yet. The concept of accounts owned by programs, and how programs use PDAs to derive deterministic addresses—that's the next layer I need to grok.

Also, the economics of rent. I understand the concept, but I haven't felt the weight of deploying a large program or managing multiple accounts yet. When do rent costs become a serious consideration? When do I need to optimize?

Next week, I'll write my first program and issue some transactions. That should make the rent and PDA pieces concrete.