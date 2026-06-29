# Epoch 3: Programs and Smart Contracts

![Epoch 3 Hero](https://mlhusercontent.com/backgrounds/challenges/019ecbff-efdb-8cee-beac-ee5b63da7d40.jpg?t=1781608270)

Welcome to Epoch 3. This stage is all about building on Solana. We transition from being users and clients of existing programs to becoming developers, creating our own on-chain logic using the Anchor framework and Rust.

---

<details open>
<summary><b>Arc 9: Getting Started with Anchor — 7/7 Completed</b></summary>

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
<summary><b>Arc 10: PDAs in Depth — 5/7 Completed</b></summary>

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
<summary><b>Arc 11: Cross-Program Invocations — 0/7 Completed</b></summary>

| Day | Challenge | Rhythm | Links |
| :--- | :--- | :--- | :--- |
| 71 | _(coming soon)_ | — | — |
| 72 | _(coming soon)_ | — | — |
| 73 | _(coming soon)_ | — | — |
| 74 | _(coming soon)_ | — | — |
| 75 | _(coming soon)_ | — | — |
| 76 | _(coming soon)_ | — | — |
| 77 | _(coming soon)_ | — | — |

</details>

---

[← Back to Roadmap](README.md)