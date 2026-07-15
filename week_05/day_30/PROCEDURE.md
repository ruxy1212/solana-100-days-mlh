# Design Sustainable Token Incentive Systems

## Steps:

### Step 1: Create a Token-2022 mint with metadata enabled

- Create a new mint using the Token Extensions Program:
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata --decimals 6`
- Copy the mint address from the output.
> The metadata extension stores your token name and symbol directly on-chain.

### Step 2: Initialize metadata on the mint

- Set the name, symbol, and metadata URI:
  - `spl-token initialize-metadata YOUR_TOKEN_MINT_ADDRESS "100DaysCoin" "HUNDO" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json"`
- Replace `YOUR_TOKEN_MINT_ADDRESS` with the mint from Step 1.
> Feel free to use your own name and symbol.

### Step 3: Create a token account

- Create the associated token account for your wallet:
  - `spl-token create-account YOUR_TOKEN_MINT_ADDRESS`
> This is the wallet-specific bucket for your new token.

### Step 4: Mint and verify supply

- Mint 1000 tokens:
  - `spl-token mint YOUR_TOKEN_MINT_ADDRESS 1000`
- Check the balance:
  - `spl-token balance YOUR_TOKEN_MINT_ADDRESS`
> You should see 1000.

### Step 5: Transfer to a second wallet

- Generate a second wallet:
  - `solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase`
- Transfer 250 tokens:
  - `spl-token transfer YOUR_TOKEN_MINT_ADDRESS 250 $(solana-keygen pubkey ~/second-wallet.json) --fund-recipient --allow-unfunded-recipient`
- Verify both balances:
  - `spl-token balance YOUR_TOKEN_MINT_ADDRESS`
  - `spl-token balance --owner $(solana-keygen pubkey ~/second-wallet.json) YOUR_TOKEN_MINT_ADDRESS`
> You should see 750 and 250.

### Step 6: Save your mint address

- Add your token's mint address to `Addresses.txt` in this directory.
> You will use this address again later.
