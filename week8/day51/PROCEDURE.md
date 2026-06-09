# Harvest withheld fees from your token

**Arc theme:** Token-2022
**Web2 bridge:** Testing a payment processor. In Web2, you test by sending small amounts and checking the dashboard for fees. On Solana, you transfer tokens and inspect the withheld amount directly on the recipient's account.

## Step 1: Confirm devnet connection and variables

- Ensure your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Set your mint address from yesterday as a variable:
  - `export MINT=[PASTE_YOUR_MINT_ADDRESS_HERE]`
- Check your balance to ensure you have some SOL:
  - `solana balance`
> If you are low on SOL, run `solana airdrop 2` or use the web faucet.

## Step 2: Mint a starting supply

- Mint 1,000,000 tokens to your own wallet to have a balance to send:
  - `spl-token mint $MINT 1000000`

## Step 3: Setup a recipient wallet

- Generate a new, throwaway keypair for the recipient:
  - `solana-keygen new --no-bip39-passphrase --outfile recipient.json`
- Set the recipient address as a variable:
  - `export RECIPIENT=$(solana address -k recipient.json)`
  - `echo "Recipient wallet: $RECIPIENT"`

## Step 4: Create recipient account and transfer tokens

- Create the recipient's associated token account. Since the recipient has no SOL, you must pay the rent:
  - `spl-token create-account $MINT --owner $RECIPIENT --fee-payer ~/.config/solana/id.json`
- Transfer 1,000 tokens to the recipient. Use `--expected-fee` to verify the 1% (10 tokens) fee calculation:
  - `spl-token transfer --expected-fee 10 $MINT 1000 $RECIPIENT --allow-unfunded-recipient`

## Step 5: Inspect withheld fees

- Find the recipient's token account address:
  - `spl-token accounts --owner $RECIPIENT --verbose`
- Save the token account address:
  - `export RECIPIENT_TA=[PASTE_RECIPIENT_TOKEN_ACCOUNT_HERE]`
- Read the recipient's account data to see the `withheld_amount`:
  - `spl-token display $RECIPIENT_TA`

## Step 6: Harvest the withheld fees

- Find your own token account address to receive the fees:
  - `spl-token accounts $MINT --verbose`
- Save your token account address:
  - `export MY_TA=[PASTE_YOUR_TOKEN_ACCOUNT_HERE]`
- Withdraw the withheld fees from the recipient's account back into your own:
  - `spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA`

## Step 7: Verify the lifecycle

- Confirm the recipient's withheld amount is now zero and your balance has increased by the 10 tokens:
  - `spl-token display $RECIPIENT_TA`
  - `spl-token balance $MINT`
