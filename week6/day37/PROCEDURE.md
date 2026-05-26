# Build a Multi-Extension Token

## Steps:

### Step 1: Create the multi-extension mint

- Run this command to create a mint with transfer fees, an interest-bearing rate, and metadata enabled at once:
  - `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --decimals 2 --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 500 --interest-rate 5 --enable-metadata`
- Copy the mint address from the output.
- Set it as a variable in your terminal so you can easily use it in the next steps:
  - Bash/macOS/Linux: `export MINT_ADDRESS=address`
  - PowerShell/Windows: `$env:MINT_ADDRESS="address"`
> This single command configures decimals, a 1% transfer fee, a 5% interest rate, and reserves space for metadata.

### Step 2: Add metadata to the mint

- Initialize the token’s name, symbol, and metadata URI:
  - `spl-token initialize-metadata $MINT_ADDRESS "ArcCoin" "ARC" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"`
> This URI points to a sample metadata JSON file hosted on GitHub. In a production token, you would host your own JSON file.

### Step 3: Inspect the mint

- Verify that all three extensions are active on the mint account:
  - `spl-token display $MINT_ADDRESS`
> Look through the output carefully. You should see sections for the Transfer fee, Interest-bearing rate, and Metadata.

### Step 4: Create a token account and mint tokens

- Create a token account for your wallet:
  - `spl-token create-account $MINT_ADDRESS`
- Mint 1,000 tokens to it:
  - `spl-token mint $MINT_ADDRESS 1000`

### Step 5: Create a second wallet and transfer tokens

- Generate a new keypair for a second wallet:
  - `solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase --force`
- Create a token account for the new wallet:
  - `spl-token create-account $MINT_ADDRESS --owner ~/second-wallet.json --fee-payer ~/.config/solana/id.json`
- Transfer 100 tokens to the second wallet:
  - `spl-token transfer $MINT_ADDRESS 100 ~/second-wallet.json --expected-fee 1 --allow-unfunded-recipient`
> The `--expected-fee 1` flag tells the CLI you expect a 1% fee on the transfer. Out of the 100 tokens sent, 1 token is withheld as a fee and deposited into the recipient’s token account in a special withheld balance.

### Step 6: Check the balances

- Verify your original wallet balance:
  - `spl-token balance $MINT_ADDRESS`
- Verify the second wallet balance:
  - `spl-token balance $MINT_ADDRESS --owner ~/second-wallet.json`
> Your original wallet should show 900 tokens. The second wallet should show 99 tokens (100 minus the 1-token fee).

### Step 7: Observe the interest-adjusted display amount

- Check the UI amount for your token account:
  - `spl-token display $MINT_ADDRESS`
> The interest calculation and the transfer fee operate independently: the interest rate adjusts how balances are displayed over time without changing the raw balance on-chain, while the transfer fee deducts tokens during transfers.

### Step 8: Harvest the withheld fees

- Find the second wallet’s token account address:
  - `spl-token accounts --owner ~/second-wallet.json -v`
- Withdraw the withheld fees:
  - `spl-token withdraw-withheld-tokens YOUR_TOKEN_ACCOUNT SECOND_WALLET_TOKEN_ACCOUNT`
- Replace `YOUR_TOKEN_ACCOUNT` with your own token account address and `SECOND_WALLET_TOKEN_ACCOUNT` with the address from the previous command's output.
> Transfer fees accumulate in a withheld balance on recipient token accounts. As the mint authority, you can harvest those fees directly to your token account.
