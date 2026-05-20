# Explore Advanced Token Incentive Design

## Steps:

### Step 1: Create a Token-2022 mint with a transfer fee

- Create a mint that enforces a 1% fee with a max fee cap:
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 5000`
- Copy the mint address from the output.
> Extensions must be set at mint creation and cannot be added later.

### Step 2: Create your token account and mint supply

- Create your token account:
  - `spl-token create-account MINT_ADDRESS`
- Mint 1000 tokens:
  - `spl-token mint MINT_ADDRESS 1000`
> You now hold 1000 tokens in your wallet’s token account.

### Step 3: Create a token account for the second wallet

- Create the associated token account for your second wallet:
  - `spl-token create-account MINT_ADDRESS --owner SECOND_WALLET_OWNER_ADDRESS --fee-payer ~/.config/solana/id.json`
- Save the token account address printed by the command.
> This is the token account you will use to withdraw withheld fees later.

### Step 4: Transfer tokens with the expected fee

- Transfer 100 tokens and specify the expected fee:
  - `spl-token transfer MINT_ADDRESS 100 SECOND_WALLET_OWNER_ADDRESS --expected-fee 1`
> The transfer only succeeds if the expected fee matches the mint’s fee config.

### Step 5: Check balances

- Check your balance:
  - `spl-token balance MINT_ADDRESS`
- Check the second wallet’s balance:
  - `spl-token balance MINT_ADDRESS --owner SECOND_WALLET_OWNER_ADDRESS`
> You should see 900 and 99 (1 token is withheld).

### Step 6: Withdraw withheld fees

- Find your token account:
  - `spl-token accounts MINT_ADDRESS`
- Withdraw the withheld tokens:
  - `spl-token withdraw-withheld-tokens YOUR_TOKEN_ACCOUNT_ADDRESS SECOND_WALLET_TOKEN_ACCOUNT_ADDRESS`
- Confirm your balance:
  - `spl-token balance MINT_ADDRESS`
> You should see 901.

### Step 7: Save your mint address

- Add your token’s mint address to `Addresses.txt` in this directory.
> You will use this address again later.
