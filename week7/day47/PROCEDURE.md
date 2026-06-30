# Mutate your NFT's metadata live on devnet

**Arc theme:** NFTs and Digital Assets
**Web2 bridge:** Staging database updates. You run UPDATE statements to rename users or flip feature flags to build intuition for how the system and UI react to live data changes.

## Step 1: Confirm devnet connection

- Ensure your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`

## Step 2: Open your NFT in Solana Explorer

- Paste your mint address into [Solana Explorer](https://explorer.solana.com/?cluster=devnet).
- Scroll down to the **Token Extensions** panel and find the **Token Metadata** extension.
- Note the current name, symbol, and URI. Keep this tab open to verify changes.

## Step 3: Rename your NFT

- Choose a new name (e.g., "Field Notes") and run the update command:
  - `spl-token update-metadata $MINT_ADDRESS name "Field Notes"`
- Refresh the Explorer tab to see the name update on-chain.

## Step 4: Add a custom metadata field

- The metadata extension allows you to store arbitrary key/value pairs. Add a "rarity" field:
  - `spl-token update-metadata $MINT_ADDRESS rarity "legendary"`
- Refresh Explorer and look for your new key under the **additional metadata** section.

## Step 5: Remove the custom field

- You can remove custom fields by passing the `--remove` flag:
  - `spl-token update-metadata $MINT_ADDRESS rarity --remove`
- Verify the field has been deleted by checking Explorer again.

## Step 6: Swap the image URI

- Point the NFT at a new metadata JSON by updating the `uri` field:
  - `spl-token update-metadata $MINT_ADDRESS uri https://path-to-your-new-metadata.json`
> You can host a new JSON file on a GitHub Gist and use the raw URL for this step.

## Step 7: Verify in a mobile wallet

- Import or send the NFT to a devnet wallet like Phantom or Backpack.
- See if the new image and metadata reflect in the wallet UI. 
> Note: Wallets often cache metadata aggressively, so URI updates may take some time to appear off-chain.
