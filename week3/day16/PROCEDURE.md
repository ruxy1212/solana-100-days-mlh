# Send your first SOL transfer

## Steps:

### Step 1: Point your CLI at devnet

- Set the cluster to devnet: `solana config set -ud`
- Verify the config: `solana config get`
- Confirm the RPC URL is `https://api.devnet.solana.com`.

### Step 2: Check your balance

- See how much SOL you have: `solana balance`
- If needed, request a devnet airdrop: `solana airdrop 2`
> Devnet airdrops can be rate-limited. If that happens, use the Solana Web Faucet.

### Step 3: Create a recipient keypair

- Generate a throwaway recipient: `solana-keygen new --outfile ~/recipient-keypair.json --no-bip39-passphrase`
- Copy the public key it prints. That is your recipient address.

### Step 4: Send the transfer

- Send 0.5 SOL to the recipient:
	- `solana transfer RECIPIENT_PUBKEY 0.5 --allow-unfunded-recipient` or `solana transfer $(solana address -k ~/recipient-keypair.json) 0.5 --allow-unfunded-recipient`
- Use `--allow-unfunded-recipient` because the recipient is brand new and does not yet have an account on-chain.

### Step 5: Verify the result

- Check your balance again: `solana balance`
- Check the recipient balance: `solana balance RECIPIENT_PUBKEY` or `solana balance -k ~/recipient-keypair.json`
- Copy the transaction signature from the transfer output and open it in Solana Explorer:
	- `https://explorer.solana.com/tx/YOUR_SIGNATURE?cluster=devnet`
> You should see the sender, recipient, amount, fee, and slot for the transfer.