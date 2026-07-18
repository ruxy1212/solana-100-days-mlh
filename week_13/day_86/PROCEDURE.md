# Managing Solana Program Upgrade Authority

This procedure describes how to inspect, transfer, and manage the upgrade authority of your deployed program on devnet, demonstrating the lifecycle before replicating on mainnet.

## Steps:

### Step 0: Get Program ID
- Go to the vault program at `counter/programs/vault/src/lib.rs` and copy the `declare_id`
- Save the program ID to terminal session: `echo VAULT=<program_id>`

### Step 1: Point CLI to Devnet and Inspect Program
- Configure the CLI to communicate with devnet:
  - `solana config set --url devnet`
- View your program's metadata, including the current upgrade authority (defaults to the deployer key):
  - `solana program show $VAULT`

### Step 2: (Optional) Upgrade Your Deployed Program
- Re-deploy your program binary while you still hold the authority:
  - `anchor program upgrade $VAULT --program-filepath target/deploy/vault.so --provider.cluster "https://devnet.helius-rpc.com/?api-key=YOUR_KEY"`

### Step 3: Create a New Authority Key
- Generate a new temporary keypair to act as the new authority:
  - `solana-keygen new --no-bip39-passphrase --outfile new-authority.json`

### Step 4: Transfer Upgrade Authority
- Transfer upgrade authority to the new keypair:
  - `solana program set-upgrade-authority $VAULT --new-upgrade-authority new-authority.json`
- Inspect the program to verify the Authority address matches the new key's public key:
  - `solana program show $VAULT`

### Step 5: Transfer Upgrade Authority Back
- Return upgrade authority back to your default keypair (requires signing with the current authority `new-authority.json`):
  - `solana program set-upgrade-authority $VAULT --upgrade-authority new-authority.json --new-upgrade-authority ~/.config/solana/id.json`
- Verify the change:
  - `solana program show $VAULT`

### Step 6: Immutable Option (Caution: We are yet to run this)
- To freeze the program permanently (preventing any future upgrades), use the `--final` flag (DO NOT run this unless you want the program to be permanently read-only and un-upgradable):
  - `solana program set-upgrade-authority $VAULT --final`
