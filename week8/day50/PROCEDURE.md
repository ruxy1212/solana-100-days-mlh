# Create a fee-bearing token with Token-2022

**Arc theme:** Token-2022
**Web2 bridge:** Token extensions are like middleware for your currency, adding features without changing the core protocol.

## Step 1: Confirm devnet connection and balance

- Confirm your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have some SOL to pay rent and fees:
  - `solana balance`
> If you have less than 0.1 SOL, run `solana airdrop 1` first.

## Step 2: Create the fee-bearing mint

- Create a new fungible mint using the Token-2022 program and attach the Transfer Fee extension. 
- Set a fee of 100 basis points (1%) and a maximum fee cap of 1_000_000:
  - `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 1000000 --decimals 6`
- Copy the mint address that the CLI prints. Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export MINT_ADDRESS=your_mint_address_here`
  - PowerShell/Windows: `$env:MINT_ADDRESS="your_mint_address_here"`

## Step 3: Create a token account

- Create an associated token account for your wallet to hold the new tokens:
  - `spl-token create-account $MINT_ADDRESS`

## Step 4: Mint a starting supply

- Mint a starting supply of 1_000 tokens to your account:
  - `spl-token mint $MINT_ADDRESS 1000`

## Step 5: Verify the extension on-chain

- Ask the chain to describe your mint and look for the **TransferFeeConfig** section:
  - `spl-token display $MINT_ADDRESS`
> In the output, you should see the Extensions block containing your 100 basis points and maximum fee. This confirms the "middleware" rule is baked directly into the token's on-chain data.
