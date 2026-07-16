# Stack interest and fees on a single mint

**Arc theme:** Token-2022
**Web2 bridge:** High-yield savings accounts. Your bank pays you interest to hold money, but also charges a fee for wiring it. Two behaviors, one account.

## Step 1: Confirm devnet connection and balance

- Confirm your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have enough SOL for multiple accounts:
  - `solana balance`
> If you are low on SOL, run `solana airdrop 2` first.

## Step 2: Create a multi-extension mint

- Create a new mint that combines the Transfer Fee and Interest-Bearing extensions in a single command.
- Set a 1% fee (100 basis points), a 1,000,000 fee cap, and a 50% APR (5000 basis points):
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --decimals 6 --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 1000000 --interest-rate 5000`
- Export your mint address as a variable:
  - `export MINT=[PASTE_YOUR_MINT_ADDRESS_HERE]`

## Step 3: Inspect both extensions on the mint

- Verify that both `TransferFeeConfig` and `InterestBearingConfig` are present on the same mint:
  - `spl-token display $MINT`
> Token-2022 allows extensions to compose. Both behaviors are stored in the same Type-Length-Value (TLV) buffer within the mint account.

## Step 4: Create token account and mint supply

- Create your associated token account and mint a large supply so the interest math is clearly visible:
  - `spl-token create-account $MINT`
- Save your token account address:
  - `export MY_TA=[PASTE_YOUR_TOKEN_ACCOUNT_HERE]`
- Mint 1,000,000 tokens:
  - `spl-token mint $MINT 1000000`

## Step 5: Observe interest accrual

- Snapshot the UI amount of your account, wait 30 seconds, and check again:
  - `spl-token accounts $MINT --verbose | awk 'NR==3'`
  - `sleep 30`
  - `spl-token accounts $MINT --verbose | awk 'NR==3'`
> The UI amount should increase automatically even though no transactions occurred. Interest is a "view" calculated on the fly, not a physical balance update.

## Step 6: Send tokens and pay the fee

- Generate a recipient wallet and fund it with a tiny amount of SOL:
  - `solana-keygen new --no-bip39-passphrase --outfile recipient.json`
  - `export RECIPIENT=$(solana-keygen pubkey recipient.json)`
  - `solana transfer $RECIPIENT 0.01 --allow-unfunded-recipient`
- Create the recipient's token account:
  - `spl-token create-account $MINT --owner $RECIPIENT`
- Save the recipient's token account:
  - `export RECIPIENT_TA=[PASTE_RECIPIENT_TOKEN_ACCOUNT_HERE]`
- Transfer 1,000 tokens, acknowledging the 10 token fee:
  - `spl-token transfer $MINT 1000 $RECIPIENT --expected-fee 10`

## Step 7: Verify fee withholding and recipient interest

- Inspect the recipient's account to see both the withheld fee and the drifting UI balance:
  - `spl-token display $RECIPIENT_TA`

## Step 8: Withdraw the withheld fees

- Sweep the withheld fees back to your wallet to confirm the mint authority still works:
  - `spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA`
