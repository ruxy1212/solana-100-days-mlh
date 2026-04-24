## # Explore different wallet types

## Steps:

### Step 1: Initialization
* **CLI:** Run `solana-keygen new` and `solana config set --url devnet`.
* **Browser:** Install Phantom/Backpack, create a wallet, and switch to **Devnet**.
* **Mobile:** Install Solflare/Phantom and create a fresh wallet on **Devnet**.

### Step 2: Funding
* **Airdrop:** Run `solana airdrop 2` for CLI. Use the in-app faucet or `faucet.solana.com` for the browser and mobile wallets.
* **Check:** Run `solana balance` to verify the CLI; check the UI for the others.

### Step 3: The Main Challenge
* **Transfer:** From your **browser extension**, send devnet SOL to both your **CLI address** and your **mobile wallet**.

### Step 4: Reflection
* **CLI:** Fastest for scripts; least secure (plaintext file).
* **Browser:** Best for dApps; medium security (password/encryption).
* **Mobile:** Best for personal use; highest hot-wallet security (biometrics).