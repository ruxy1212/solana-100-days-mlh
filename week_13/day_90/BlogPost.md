# The Ultimate Integration Checklist to Deploy A Solana Program To Mainnet

**Tags:** 100daysofsolana, rust, anchor, frontend

---

> Moving a program to Solana mainnet-beta is the ultimate staging-to-production moment. Mistakes here are not free: they cost real SOL, and a single wrong click can lock up your authority or freeze your bytecode forever. Here is the hands-on launch checklist I wrote after taking my vault program live.

## The Background Picture

In Web2 development, a bad deployment is resolved by a quick git rollback or a server restart. On Solana, the blockchain is your server. Your bytecode is deployed into accounts that stay live forever, funded by real-world rent. The wallet that executes the initial deploy silently inherits permanent upgrade authority over that address. 

Under launch pressure, relying on memory is a recipe for disaster. That is why astronauts, surgeons, and similarly, smart contract engineers, use checklists. This guide groups the exact steps we walked through across Days 85 to 89 to take our vault program from staging to production, ensuring nothing is missed.

---

## Phase 1: Pre-Flight (Staging on Devnet)

Before committing real value, you must run through staging checks on devnet where failures cost nothing.

- ☑ **All local and integration tests pass perfectly against the final binary.**
- ☑ **The build is compiled verifiably.**
  - Compiling with `anchor build --verifiable` ensures that the resulting bytecode on-chain can later be matched and verified against your open-source repository.
  > [!IMPORTANT]
  > Once you generate a verifiable build, do not run `cargo build-sbf` or a simple `anchor build`, as variations in local environment compilation can alter the binary hash and break verification.
- ☑ **Program keys are fully synchronized.**
  - Sync the program IDs in your workspace with `anchor keys sync`. Recompile if any changes are made so that `declare_id!` and the generated key files match.
- ☑ **The deploy wallet is funded.**
  - Run the rent estimator to see how much SOL the program account will require:
    ```bash
    solana rent $(wc -c < target/deploy/vault.so)
    ```
  - Ensure the deploy keypair holds enough devnet (and eventually mainnet) SOL to cover this rent plus transaction fees.

---

## Phase 2: The Deploy (Promoting to Mainnet-Beta)

This is the point of no return. Double-check your networks and fee parameters.

- ☑ **The Solana CLI is pointing to the correct environment.**
  - Confirm with `solana config get` that the endpoint is set to `https://api.mainnet-beta.solana.com` (or your private RPC endpoint).
- ☑ **A dedicated RPC endpoint is configured.**
  - The public mainnet RPC nodes are heavily rate-limited. Deploys consist of dozens of sequential transactions; always deploy via a dedicated RPC (e.g., Helius, QuickNode) wrapped in quotes:
    ```bash
    anchor program deploy \
      --provider.cluster "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" \
      -- --with-compute-unit-price 10000 --use-rpc
    ```
- ☑ **Priority fees and TPU routing are enabled.**
  - Passing `--with-compute-unit-price 10000` (in micro-lamports per CU) and `--use-rpc` ensures your transactions land safely even during periods of heavy mainnet congestion.
- ☑ **Buffer recovery strategy is prepared.**
  - If a deploy stalls halfway due to expired blockhashes, your SOL is not lost. It is resting in a temporary buffer. Do not start over! Identify and resume it:
    ```bash
    # List stranded buffers
    solana program show --buffers
    # Reclaim buffer rent if abandoning
    solana program close [BUFFER_ADDRESS]
    ```

---

## Phase 3: Authority & Verification (Securing the Contract)

Once the code is on-chain, secure the keys that control it.

- ☑ **Verify upgrade authority immediately.**
  - Run `solana program show [YOUR_PROGRAM_ID]` and inspect the `Authority` field.
- ☑ **Determine the long-term upgrade authority.**
  - **Single Keypair:** Keep it only for developer testing. 
  - **Multisig (Squads):** The recommended production path. Transfer authority to a multi-signature safe so upgrades require approval from multiple team members (_Coming soon..._).
  - **Immutable (`--final`):** Freeze the program permanently. Note that this is a one-way door; you can never fix a bug or add a feature once you freeze it (_Coming soon..._).
- ☑ **Publish the IDL on-chain.**
  - Make your program self-documenting by publishing the Interface Definition Language schema:
    ```bash
    anchor idl init -f target/idl/vault.json [YOUR_PROGRAM_ID] --provider.cluster "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
    ```
- ☑ **Generate and export the typed client.**
  - Run Codama to output autocomplete-ready TypeScript helpers for your team or frontend:
    ```bash
    npx codama run js
    ```

---

## Phase 4: Frontend Integration & Going Live

Your program is secure and documented; now connect it to the user interface.

- ☑ **Point the frontend to the new mainnet program ID.**
  - Update the configuration in [src/providers.tsx](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/my-frontend/src/providers.tsx) to target Mainnet-Beta.
- ☑ **Test wallet discovery with the Wallet Standard.**
  - Verify that browser-extension wallets (Phantom, Solflare, Backpack) discover the app smoothly.
- ☑ **Verify error classification is active.**
  - Ensure that [walletErrors.ts](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/my-frontend/src/walletErrors.ts) is wired to handle user cancellations, insufficient funds, and network failures gracefully instead of throwing raw stack traces.

---

## Lessons Learnt and Surprises

The biggest surprise during this process was how easily a deploy can stall. Without adding priority fees (`--with-compute-unit-price`) and using a custom RPC, the public endpoint rate-limiting would fail after 10–20 transaction writes, leaving half-finished bytecode stranded in buffers. Understanding buffer management commands and knowing that the rent SOL could be reclaimed via `solana program close` was a massive relief.

*This post summarizes the production launch workflow completed during Week 13 (Days 85–91) of #100DaysOfSolana.*

*Check out the [Week 13 Workspace](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/week_13) and the React frontend implementation at [my-frontend](https://ruxy1212.github.io/solana-100-days-mlh/my-frontend/).*
