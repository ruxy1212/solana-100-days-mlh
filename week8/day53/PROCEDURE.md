# Audit your Token-2022 mints

**Arc theme:** Token-2022
**Web2 bridge:** Database audits. Just like running `DESCRIBE` on a SQL table to verify the schema, you use `spl-token display` to verify the extensions baked into your mints.

## Step 1: Confirm devnet connection

- Ensure your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you can still interact with the network:
  - `solana balance`

## Step 2: Retrieve your mint addresses

- Locate the mint addresses you created on Day 50 and Day 52. 
- You can find them in your terminal history or by checking your wallet's token accounts:
  - `spl-token accounts`
- Set them as variables for easier access:
  - `export MINT_DAY_50=[PASTE_DAY_50_MINT_HERE]`
  - `export MINT_DAY_52=[PASTE_DAY_52_MINT_HERE]`

## Step 3: Audit the Day 50 mint

- Run the display command on your first mint to see its configuration:
  - `spl-token display $MINT_DAY_50`
- Look for the **Extensions** block. You should see `TransferFeeConfig` populated with the basis points and maximum fee you configured earlier this week.

## Step 4: Audit the Day 52 stacked mint

- Run the display command on your second mint:
  - `spl-token display $MINT_DAY_52`
- Verify that this mint shows both `TransferFeeConfig` and `InterestBearingConfig`. 
- Confirm the interest rate (in basis points) and the last updated timestamp are visible.

## Step 5: Reflect and Document

- For each extension, write a single sentence in plain English describing what it does.
- This helps bridge the gap between "running a command" and "understanding the protocol behavior."
- Take a screenshot of both outputs to confirm you have successfully audited your on-chain work.
