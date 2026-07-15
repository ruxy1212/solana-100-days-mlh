# Give your NFT a name, an image, and on-chain metadata

## Step 1: Confirm devnet connection and balance

- Confirm your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have some SOL to pay rent and fees:
  - `solana balance`
> If anything looks off, airdrop yourself a little more SOL before continuing.

## Step 2: Pick or upload an image.

> The simplest option is to find any PNG already hosted on the open web and copy its direct URL. You can swap it later, so keep the URL handy.

## Step 3: Create your off-chain metadata JSON

- Open a new [GitHub Gist](https://gist.github.com), name the file metadata.json, and paste in the following:
```json
{
  "name": "First Light",
  "symbol": "LIGHT",
  "description": "My first real NFT, minted on Solana devnet during 100 Days of Solana.",
  "image": "https://upload.wikimedia.org/wikipedia/commons/4/49/Dichroic_filters.jpg",
  "attributes": [
    { "trait_type": "Filters", "value": "44" },
    { "trait_type": "Network", "value": "Devnet" }
  ]
}
```
- Save the gist as public, then click the Raw button, and copy the raw url that starts with `https://gist.githubusercontent.com/` and ends in `metadata.json`
- Copy the gist url and set it as a variable in your terminal:
  - Bash/macOS/Linux: `export GIST_RAW_URL=gist_url_here`
  - PowerShell/Windows: `$env:GIST_RAW_URL="gist_url_here"`

## Step 4: Generate a vanity-friendly mint keypair

- Create an address that is easy to read and begins with 'nft' prefix:
  - `solana-keygen grind --starts-with nft:1`
  - This produces a JSON file in your current directory like nftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json
- Move the keypair to same location as the others created earlier:
  -  `mv nftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json ~/nft-keypair.json`

## Step 5: Create mint with metadata

- Create the mint with the metadata extension turned on:
  `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata --decimals 0 ~/nft-keypair.json`
- Copy the mint address that the command prints. Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export MINT_ADDRESS=your_mint_address_here`
  - PowerShell/Windows: `$env:MINT_ADDRESS="your_mint_address_here"`

## Step 6: Initialize the on-chain metadata fields
- `spl-token initialize-metadata $MINT_ADDRESS "First Light" "LIGHT" $GIST_RAW_URL`

## Step 7: Create token account and Mint

- Create an associated token account for that mint under your wallet. This is the box that will hold your single token:
  - `spl-token create-account $MINT_ADDRESS`
- Mint exactly one token into that account:
  - `spl-token mint $MINT_ADDRESS 1`
> After this command runs, the total supply of this mint on the entire Solana network will be one.

## Step 8: Disable the mint authority

- Remove the mint authority to permanently prevent further minting forever:
  - `spl-token authorize $MINT_ADDRESS mint --disable`
> With no mint authority, nobody, not even you, can ever create a second copy. The supply is locked at one forever.

## Step 9: View it on Solana Explorer

- Open [Solana Explorer](https://explorer.solana.com/?cluster=devnet).
- Paste in your mint address into the search bar.
- Look at how the page describes it. You should see the metadata details like logo, name symbol, and the supply line will read exactly `1` with no decimal point in sight.

## Step 10: Verify the token details

- You should see fields like Mint, Supply: 1, Decimals: 0, Mint authority: (not set), plus a metadata block listing your name, symbol, and URI:
  - `spl-token display $MINT_ADDRESS`



