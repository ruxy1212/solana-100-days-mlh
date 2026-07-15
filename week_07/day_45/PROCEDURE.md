# Group your NFTs into an on-chain collection

## Step 1: Confirm devnet connection and balance

- Confirm your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have some SOL to pay rent and fees:
  - `solana balance`
> If you have less than 0.2 SOL, run `solana airdrop 1` first.

## Step 2: Create the collection mint with the group extension

- Token Extensions must be declared at mint creation. Create the collection mint with both metadata and group extensions:
  - `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --decimals 0 --enable-metadata --enable-group`
- Copy the address and set it as a variable:
  - Bash/macOS/Linux: `export COLLECTION_MINT=your_mint_address_here`
  - PowerShell/Windows: `$env:COLLECTION_MINT="your_mint_address_here"`

## Step 3: Stamp the collection with metadata

- Initialize the on-chain metadata fields for the collection:
  - `spl-token initialize-metadata $COLLECTION_MINT "Solana Sketchbook" "SKTCH" "https://gist.githubusercontent.com/janvinsha/b477ebe4dda46b0ef03895c4ea930a46/raw/f29222bcaff0d4979fe7ebb610a00bb97a8418ec/collection.json"`

## Step 4: Initialize the group

- Set the maximum collection size. We'll pick 3 to leave room for expansion:
  - `spl-token initialize-group $COLLECTION_MINT 3`

## Step 5: Create the first member mint

- Create a new mint with metadata and member extensions:
  - `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --decimals 0 --enable-metadata --enable-member`
- Copy the address and set it as a variable:
  - Bash/macOS/Linux: `export MEMBER_ONE_MINT=your_mint_address_here`
  - PowerShell/Windows: `$env:MEMBER_ONE_MINT="your_mint_address_here"`

## Step 6: Stamp the first member with its own metadata

- Initialize metadata for the first NFT member:
  - `spl-token initialize-metadata $MEMBER_ONE_MINT "Sketch #1" "SK1" "https://gist.githubusercontent.com/janvinsha/3412c5d4e92b6de9a2ed82337ecafc44/raw/99359fc62ffd0480b6a52ee1ad4048ecba4ae61c/nft.json"`

## Step 7: Link the member to the collection

- Wire the member and the collection together on-chain:
  - `spl-token initialize-member $MEMBER_ONE_MINT $COLLECTION_MINT`

## Step 8: Mint the NFT and lock supply

- Create a token account, mint exactly one, and disable future minting:
  - `spl-token create-account $MEMBER_ONE_MINT`
  - `spl-token mint $MEMBER_ONE_MINT 1`
  - `spl-token authorize $MEMBER_ONE_MINT mint --disable`

## Step 9: Repeat for a second member NFT

- Repeat steps 5 through 8 for a second NFT:
  - Use name "Sketch #2" and symbol "SK2".
  - Set the new address as `MEMBER_TWO_MINT`.
  - Ensure you link it to the same `$COLLECTION_MINT`.

## Step 10: View on Solana Explorer and verify extensions

- Open [Solana Explorer](https://explorer.solana.com/?cluster=devnet) and search for your `$COLLECTION_MINT`.
- Scroll to the **Extensions** panel. You should see "Group" with size: 2 and max_size: 3.
- Search for your member mints and confirm the "Group Member" extension points to the correct collection address.
- Alternatively, verify via CLI:
  - `spl-token display $COLLECTION_MINT`
  - `spl-token display $MEMBER_ONE_MINT`
  - `spl-token display $MEMBER_TWO_MINT`
