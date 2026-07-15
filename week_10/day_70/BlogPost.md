Working with Solana Program Derived Addresses (PDAs):

First, PDAs are not accounts a program owns, they are accounts a program can prove it derived. 
They do not have private keys, and no registration. Just deterministic math over seeds, a program ID, and a bump byte.

Last week, I built a per-user counter program, wired up constraints, closed accounts to reclaim rent, and even tried to break the seed model with deliberate collisions.

Read my full guide on how PDAs work, seed design, and the lessons I learnt:
https://dev.to/russell_oje/a-mental-dive-into-solana-pdas-5fi4

`#100DaysOfSolana`
