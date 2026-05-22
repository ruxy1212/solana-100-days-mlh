# Test Token Distribution Strategies

## Steps:

### Step 1: Confirm your setup

- Point the CLI at devnet:
  - `solana config set --url devnet`
- Check your balance:
  - `solana balance`
> If you are low on SOL, run `solana airdrop 2`.

### Step 2: Create a non-transferable Token-2022 mint

- Create the mint with the non-transferable extension:
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-non-transferable`
- Copy the mint address from the output.
> This extension permanently blocks transfers for this mint.

### Step 3: Create a token account and mint supply

- Create your token account:
  - `spl-token create-account YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Mint 10 tokens:
  - `spl-token mint YOUR_MINT_ADDRESS 10 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Check your balance:
  - `spl-token balance YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> You should see 10.

### Step 4: Try to transfer and watch it fail

- Create a second wallet and its token account:
  - `solana-keygen new --outfile ~/experiment-wallet.json --no-bip39-passphrase --force`
  - `spl-token create-account YOUR_MINT_ADDRESS --owner ~/experiment-wallet.json --fee-payer ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Attempt a transfer:
  - `spl-token transfer YOUR_MINT_ADDRESS 5 EXPERIMENT_WALLET_PUBLIC_KEY --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --allow-unfunded-recipient`
> The transfer should fail because the mint is non-transferable.

### Step 5: Burn tokens

- Burn 3 tokens from your token account:
  - `spl-token burn YOUR_TOKEN_ACCOUNT_ADDRESS 3 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Check your balance:
  - `spl-token balance YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> You should see 7.

### Step 6: Save your mint address

- Add your token’s mint address to `Addresses.txt` in this directory.
> You will use this address again later.
