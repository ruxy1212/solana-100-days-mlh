# Review Token Incentive Mechanics

## Steps:

### Step 1: Confirm your environment

- Point the CLI at devnet:
  - `solana config set --url devnet`
- Check your balance:
  - `solana balance`
> If you are low on SOL, run `solana airdrop 2`.

### Step 2: Create a Token-2022 mint with fees and metadata enabled

- Create the mint with a 2% fee and max fee cap:
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 200 --transfer-fee-maximum-fee 5000 --enable-metadata --decimals 9`
- Copy the mint address from the output.
> You will use this mint address for every step.

### Step 3: Initialize metadata

- Set the name, symbol, and URI:
  - `spl-token initialize-metadata YOUR_MINT_ADDRESS "ReinforceCoin" "RFC" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"`
- Confirm it worked:
  - `spl-token display YOUR_MINT_ADDRESS`
> You should see the metadata and transfer fee settings together.

### Step 4: Create a token account and mint supply

- Create your token account:
  - `spl-token create-account YOUR_MINT_ADDRESS`
- Mint 1000 tokens:
  - `spl-token mint YOUR_MINT_ADDRESS 1000`
- Check your balance:
  - `spl-token balance YOUR_MINT_ADDRESS`
> You should see 1000.

### Step 5: Create a token account for the second wallet

- Create the recipient token account:
  - `spl-token create-account YOUR_MINT_ADDRESS --owner RECIPIENT_WALLET_ADDRESS --fee-payer ~/.config/solana/id.json`
> Save the token account address printed by the command.

### Step 6: Transfer tokens and observe the fee

- Transfer 100 tokens with the expected fee:
  - `spl-token transfer --fund-recipient YOUR_MINT_ADDRESS 100 RECIPIENT_WALLET_ADDRESS --expected-fee 2 --allow-unfunded-recipient`
- Check the recipient’s balance:
  - `spl-token balance --owner RECIPIENT_WALLET_ADDRESS YOUR_MINT_ADDRESS`
> You should see 98 (2 tokens are withheld).

### Step 7: Collect withheld fees

- Withdraw the withheld tokens into your account:
  - `spl-token withdraw-withheld-tokens YOUR_TOKEN_ACCOUNT_ADDRESS RECIPIENT_TOKEN_ACCOUNT_ADDRESS`
- Confirm your balance:
  - `spl-token balance YOUR_MINT_ADDRESS`
> You should see 902.

### Step 8: Save your mint address

- Add your token’s mint address to `Addresses.txt` in this directory.
> You will use this address again later.
