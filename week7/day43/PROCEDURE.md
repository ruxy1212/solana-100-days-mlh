# Mint a 1-of-1 SPL Token and Meet Your First NFT

**Arc theme:** NFTs and Digital Assets
**Web2 bridge:** NFTs are like unique database records with ownership history and provenance.

## Step 1: Confirm devnet connection and balance

- Confirm your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have some SOL to pay rent and fees:
  - `solana balance`
> If anything looks off, airdrop yourself a little more SOL before continuing.

## Step 2: Create a token mint with zero decimals

- Create a new token mint with zero decimals. Zero decimals means the token has no fractional units, which is the first half of "non-fungible":
  - `spl-token create-token --decimals 0`
- Copy the mint address that the command prints. Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export MINT_ADDRESS=your_mint_address_here`
  - PowerShell/Windows: `$env:MINT_ADDRESS="your_mint_address_here"`

## Step 3: Create an associated token account

- Create an associated token account for that mint under your wallet. This is the box that will hold your single token:
  - `spl-token create-account $MINT_ADDRESS`

## Step 4: Mint exactly one token

- Mint exactly one token into that account:
  - `spl-token mint $MINT_ADDRESS 1`
> After this command runs, the total supply of this mint on the entire Solana network will be one.

## Step 5: Disable the mint authority

- Remove the mint authority to permanently prevent further minting. This is the second half of "non-fungible":
  - `spl-token authorize $MINT_ADDRESS mint --disable`
> With no mint authority, nobody, not even you, can ever create a second copy. The supply is locked at one for all time.

## Step 6: Verify the supply

- Verify that the total supply is exactly one:
  - `spl-token supply $MINT_ADDRESS`

## Step 7: View it on Solana Explorer

- Open [Solana Explorer](https://explorer.solana.com/?cluster=devnet).
- Paste in your mint address into the search bar.
- Look at how the page describes it. You should see the network describe this mint as a "Non-Fungible Token", and you will notice an **"NFT" tag/indicator** next to the token name/address at the top of the page. The supply line will read exactly `1` with no decimal point in sight.
- Take a screenshot of the explorer page showing your new NFT tag and supply.
