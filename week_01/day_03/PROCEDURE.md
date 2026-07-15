# Understand SOL and Lamports

## Steps:

### Step 1: Installation

- Install solana-cli: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
- Check version, use `solana --version` to verify if installation worked.
> If the command is not found, add it to your PATH: `export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"`

### Step 2: Then set up a CLI wallet
- Create new wallet `solana-keygen new`
- Configure the new wallet for devnet `solana config set --url devnet`
- Get the wallet address: `solana address`

### Step 3: The main challenge

- Get the wallet's balance: `solana balance --url devnet`
> If your balance is zero, request an airdrop first using this command `solana airdrop 2 --url devnet`, or if it fails use the web faucet `https://faucet.solana.com/` and enter the address from step 2.
- Get the wallet's balance in lamports: `solana balance --url devnet --lamports`
- Get your wallet's latest transactions: `solana transaction-history $(solana address) --url devnet --limit 1`
- Copy the transaction signature above to inspect that transaction `solana confirm SIGNATURE_HERE -v --url devnet`
- Convert the transaction fee from SOL to lamports and vice-versa.