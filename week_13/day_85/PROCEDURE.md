# Deploying an Anchor Program to Mainnet-Beta

This procedure describes how to take an Anchor program from staging (devnet) to production (mainnet-beta) with the necessary checks and precautions.

## Steps:

### Step 1: Initialize the Program and Sync Code
- Create a new program in the Anchor workspace:
  - `anchor new vault`
- Copy the implementation files from week 12:
  - Copy [lib.rs](../../week_12/day_81/lib.rs) and [math.rs](../../week_12/day_81/math.rs) into your program's `src/` directory.
  > Remember to keep the original program id generated for the new vault program.

### Step 2: Build the Program and Sync Keys
- Build the program to generate the build artifacts and keypair:
  - `anchor build`
- Synchronize your program keys:
  - `anchor keys sync`
- Rebuild to ensure the embedded program ID in the binary matches the synced keypair:
  - `anchor build`

### Step 3: Measure the Rent Cost
- Calculate the rent cost of deploying the program to mainnet-beta (proportional to its byte size):
  - `solana rent $(wc -c < target/deploy/vault.so)`
- Ensure your wallet holds enough SOL to cover this rent-exempt minimum plus network fees (~1.1 SOL).

### Step 4: Configure CLI and Wallet
- Set the Solana CLI cluster to devnet to test first (staging):
  - `solana config set --url devnet`
- Verify your devnet balance:
  - `solana balance`
- Top up if needed:
  - `solana airdrop 2`

### Step 5: Test Deploy to Devnet (Staging)
- Deploy using a dedicated RPC endpoint with a priority fee (using a custom RPC from Helius or QuickNode to avoid public RPC rate-limiting):
  - `anchor program deploy --provider.cluster "https://devnet.helius-rpc.com/?api-key=YOUR_KEY" -- --with-compute-unit-price 50000 --use-rpc`
- Inspect the deployed program to confirm details:
  - `solana program show [YOUR_PROGRAM_ID] --url devnet`

### Step 6: Deploy to Mainnet-Beta (Production)
- Configure `Anchor.toml` provider block to target mainnet and specify your funded keypair:
  ```toml
  [provider]
  cluster = "Mainnet"
  wallet = "~/.config/solana/id.json"
  ```
- Set your local Solana CLI configuration to mainnet-beta:
  - `solana config set --url mainnet-beta`
- Deploy to mainnet with a priority fee:
  - `anchor program deploy --provider.cluster "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" -- --with-compute-unit-price 10000 --use-rpc`
- Confirm what landed on-chain and verify the address on the Solana Explorer (set to Mainnet-Beta):
  - `solana program show [YOUR_PROGRAM_ID]`
