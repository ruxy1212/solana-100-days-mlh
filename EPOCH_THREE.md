# Epoch 3: Programs and Smart Contracts

![Epoch 3 Hero](https://mlhusercontent.com/backgrounds/challenges/019ecbff-efdb-8cee-beac-ee5b63da7d40.jpg?t=1781608270)

Welcome to Epoch 3. This stage is all about building on Solana. We transition from being users and clients of existing programs to becoming developers, creating our own on-chain logic using the Anchor framework and Rust.

---

<details open>
<summary><b>Arc 9: Your First Anchor Program — 7/7 Completed</b></summary>

| Day | Challenge | Rhythm | Links |
| :--- | :--- | :--- | :--- |
| 57 | [Install Anchor and scaffold your first program](week9/day57/) <br> <small>Set up the Anchor toolchain and initialize your first Solana program workspace.</small> | ▶️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ecbff-efdb-8cee-beac-ee5b63da7d40) |
| 58 | [Add state and write your first LiteSVM test](week9/day58/) <br> <small>Adding the  Counter  account +  initialize  instruction, building the program, and writing the first LiteSVM test (initialize_sets_count_to_zero).</small> | 🛠️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ecfb9-01f7-d84a-d1cf-371f82e38bff) |
| 59 | [Add an increment instruction and test](week9/day59/) <br> <small>Adding the  increment  instruction with  has_one = authority  and an end-to-end test covering both instructions in sequence.</small> | 📈 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ed017-1cee-5914-4ebb-6b11bee30f51) |
| 60 | [Add failure tests](week9/day60/) <br> <small>Refactoring boilerplate into helper functions and adding two failure tests (wrong authority, double-initialization), including the  expire_blockhash()  subtlety.</small> | 📌 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ed035-9f27-0707-4e7a-f9b7b0fde822) |
| 61 | [Break your program on purpose](week9/day61/) <br> <small>Mutation testing — three deliberate bugs introduced one at a time, each caught by a specific test, then reverted</small> | 🧪 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ed03c-f8bd-8c41-6a87-4cccbfe5312b) |
| 62 | [Prove you understand your first Anchor program](week9/day62/) <br> <small>Deep-dive blog that covers  has_one,  init, LiteSVM testing, failure tests, and the mutation experiments.</small> | 📝 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ed046-5f60-0285-0ccc-f4417061a2a3) |
| 63 | [Turn your counter program into a post that lands](week9/day63/) <br> <small>Short social post teasing the blog with a code snippet and link</small> | 🚀 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ed04c-b375-c55d-55cd-ae40182ad292) |

</details>

<details>
<summary><b>Arc 10: PDAs and State — 7/7 Completed</b></summary>

| Day | Challenge | Rhythm | Links |
| :--- | :--- | :--- | :--- |
| 64 | [Derive your first PDA from seeds](week10/day64/) <br> <small>Write a script that calls `findProgramAddressSync` with different seed combinations and confirms that the same seeds always produce the same address.</small> | ▶️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019eefab-9ea1-8eb3-2534-15e1ae96435d) |
| 65 | [Build a per-user counter with PDA state](week10/day65/) <br> <small>Rewrite the counter program so each wallet owns its own PDA-backed state account, derived from `["counter", user_pubkey]` — no keypair tracking required.</small> | 🛠️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019eefe7-365e-7146-2928-4ce4f6270721) |
| 66 | [Add a config PDA and constraints that hold two accounts together](week10/day66/) <br> <small>Introduce a `Config` singleton PDA with an admin and a pause flag, wire it into `increment` with a `constraint` guard, and gate `set_paused` with `has_one = admin`.</small> | 📌 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ef011-f8d2-14bc-753f-f67456e0039c) |
| 67 | [Close a PDA account and reclaim rent](week10/day67/) <br> <small>Add a `close_counter` instruction that uses Anchor's `close = user` attribute to drain lamports back to the owner and zero the account — handler body is empty.</small> | 💸 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ef02b-7b80-7dc2-e9b7-8a0875c844b1) |
| 68 | [Try to make two PDAs share an address](week10/day68/) <br> <small>Explore PDA collision mechanics: near-miss seed variants, global vs. per-user address collisions, and a deliberate spoof attempt.</small> | 🧪 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019ef03d-6aed-7a5e-bc15-fb93f3992732) |
| 69 | [Write a PDA explainer](week10/day69/) <br> <small>Post covering the PDA mental model, seed anatomy, bump mechanics, the account lifecycle, and four lessons for past-me.</small> | 📝 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f0424-79a6-431c-f492-9aa6ced5f3ac) |
| 70 | [Share your PDA mental model on social media](week10/day70/) <br> <small>Short social post teasing the blog with a code snippet and link</small> | 🚀 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f04a8-8ebc-44f2-ec7d-d3e642ec1d97) |

</details>

<details>
<summary><b>Arc 11: Cross-Program Invocations — 7/7 Completed</b></summary>

| Day | Challenge | Rhythm | Links |
| :--- | :--- | :--- | :--- |
| 71 | [Move SOL from inside your program with a CPI](week11/day71/) <br> <small>Write an instruction in your own Anchor program that calls the System Program's transfer instruction to send SOL from a signer to a recipient.</small> | ▶️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f137c-fad9-d4c3-1645-e60101686d4b) |
| 72 | [Mint Token-2022 tokens from inside your program](week11/day72/) <br> <small>Perform a CPI from your Anchor program to the Token-2022 program to mint tokens directly into a destination token account.</small> | 🛠️ | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f1411-f45c-f3ea-c369-7d3fccce3e9e) |
| 73 | [Withdraw SOL from a vault your program signs for](week11/day73/) <br> <small>Add deposit and withdraw instructions around a vault PDA, with the withdraw CPI signed by the program through PDA seeds.</small> | 💸 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f1439-7cef-b445-1226-94ae3bfd1656) |
| 74 | [Make one of your programs call the other](week11/day74/) <br> <small>Deploy a counter program and a caller program, then use a CPI to increment the counter through the caller.</small> | 🧩 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f17eb-4a8d-1431-746a-0b2e037b6c31) |
| 75 | [Read a CPI failure like a sentence](week11/day75/) <br> <small>Break the Day 73 and Day 74 CPI flows on purpose and map each runtime log to the real cause.</small> | 🧪 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f1806-4c0d-27a9-66f4-599a3c4c4f79) |
| 76 | [Write the CPI explainer you wish you had on day 71](week11/day76/) <br> <small>A short, opinionated dev.to post about the CPI pattern.</small> | 📝 | [🔗](https://www.mlh.com/events/100-days-of-solana/challenges/019f1826-6ce3-acfb-f786-2f34571083f4) |
| 77 | [Share your CPI mental model on social media](week11/day77/) <br> <small>Short social post teasing the CPI blog with a code snippet and link.</small> | 🚀 | — |

</details>

<details>
<summary><b>Arc 12: Advanced Testing and Security — 0/7 Completed</b></summary>

| Day | Challenge | Rhythm | Links |
| :--- | :--- | :--- | :--- |
| 78 | _(coming soon)_ | — | — |
| 79 | _(coming soon)_ | — | — |
| 80 | _(coming soon)_ | — | — |
| 81 | _(coming soon)_ | — | — |
| 82 | _(coming soon)_ | — | — |
| 83 | _(coming soon)_ | — | — |
| 84 | _(coming soon)_ | — | — |

</details>

---

[← Back to Roadmap](README.md)