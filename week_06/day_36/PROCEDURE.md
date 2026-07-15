# Create an Interest-Bearing Token on Solana

## Steps:

### Step 1: Confirm network and balance

- Check your Solana CLI configuration:
  - `solana config get`
- Check your wallet balance:
  - `solana balance`
> You need at least 0.5 SOL for the rent costs of creating a mint and token account. If your balance is low, run `solana airdrop 2`.

### Step 2: Create an interest-bearing token mint

- Create a new token mint with a 5% annual interest rate (500 basis points):
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --interest-rate 500`
- Copy the mint address from the output and save it somewhere.
> The `--program-id` flag tells the CLI to use the Token-2022 program (Token Extensions) instead of the original SPL Token program.

### Step 3: Create a token account

- Create a token account for your new mint:
  - `spl-token create-account YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Replace `YOUR_MINT_ADDRESS` with the mint address from Step 2.

### Step 4: Mint tokens

- Mint 1000 tokens to your account:
  - `spl-token mint YOUR_MINT_ADDRESS 1000 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`

### Step 5: Check balances and UI amounts

- Check your raw token balance:
  - `spl-token balance YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Check the interest-adjusted UI amount:
  - `spl-token display YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> The raw balance will show 1000. Look for the interest-bearing configuration in the display output. You should see your rate (500 basis points) and the initialization timestamp.

### Step 6: Observe interest compounding

- Wait a few minutes, then check the UI amount through the Solana RPC:
  - `solana account YOUR_MINT_ADDRESS --output json`
> The interest-adjusted display amount will be slightly higher than 1000 because continuous compounding has been applied since the moment you minted. At 5% annual, you will not see a dramatic change in minutes, but the math is running.

### Step 7: Update the interest rate

- Set a more dramatic interest rate of 150% (15000 basis points):
  - `spl-token set-interest-rate YOUR_MINT_ADDRESS 15000`
- Wait another minute or two and check the display amount again (using `spl-token display` or `solana account`).
> The growth should be noticeably faster with this higher rate.

### Step 8: Save your mint address

- Add your token's mint address to `Addresses.txt` in this directory.
> You might use this address in future challenges.
