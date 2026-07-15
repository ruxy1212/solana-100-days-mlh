# Audit your NFT collection on chain

**Arc theme:** NFTs and Digital Assets
**Web2 bridge:** Database migrations. After seeding a database, you don't just trust the logs; you open a client, query the tables, and verify that the foreign keys point to the correct parent rows.

## Step 1: Confirm devnet connection

- Ensure your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Verify the current configuration:
  - `solana config get`

## Step 2: Display your member NFT

- Use the display command on the mint address of the NFT you built on Day 44:
  - `spl-token display YOUR_NFT_MINT_ADDRESS`
- Look closely at the output to confirm:
  - **Supply:** 1
  - **Decimals:** 0
  - **Extensions:** MetadataPointer, TokenMetadata, and GroupMemberPointer.

## Step 3: Display your collection NFT

- Run the same command against your collection mint from Day 45:
  - `spl-token display YOUR_COLLECTION_MINT_ADDRESS`
- Confirm you see the **GroupPointer** and **TokenGroup** extensions, along with the Max size you set.

## Step 4: Verify the parent reference

- Inside the `TokenGroupMember` data on your member NFT, find the Group address.
- It should match your collection mint address exactly. This confirms the "foreign key" relationship between the member and its parent collection.

## Step 5: View on Solana Explorer

- Open [Solana Explorer](https://explorer.solana.com/?cluster=devnet) on devnet.
- Search for your member mint address and find:
  - The **Token Extensions** panel listing every extension on the mint.
  - The **Metadata** section rendering your token’s name and image.
  - A link or address pointing back to the collection mint.
- Repeat the process for the collection mint address.

## Step 6: Compare with a fungible mint

- Run `spl-token display` on any old fungible mint address from earlier weeks.
- Notice what is missing: no Extensions block with metadata, no group pointer, and decimals greater than zero. This contrast shows what technically makes an NFT unique on Solana.
