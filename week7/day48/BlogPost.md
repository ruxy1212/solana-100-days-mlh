# NFTs in Solana: Another Week with Token Extensions

**Tags:** solana, nft, webdev, 100daysofsolana

This week, I stepped away from the usual Extension system from last week, to creating NFTa, using only Solana's native Token Extensions (Token-2022). It turns out, you can build a fully functional, grouped, and mutable NFT collection entirely at the protocol level.

## The Mental Model: What is a Solana NFT?

Coming from a Web2 background, I used to think of an NFT as a complex smart contract. On Solana, using Token Extensions, an NFT is simpler and more elegant: it's a token mint with **supply 1**, **decimals 0**, and a few specific extensions that handle metadata and grouping.

## What I Built This Week

I spent the last few days moving from a single 1-of-1 token to a full-blown collection:

1.  **The 1-of-1 Mint**: I started by creating a mint with the `Metadata` extension, ensuring it had zero decimals and a supply of exactly one.
2.  **Metadata Extension**: Instead of an external metadata account, I stamped the name, symbol, and URI (pointing to a JSON on a GitHub Gist) directly onto the mint.
3.  **Group and Member Extensions**: I created a collection mint and then linked my individual NFTs to it using the `Group` and `Member` extensions. This creates a "foreign key" relationship natively on the blockchain.

## The Surprising Part: Live Mutation

The most eye-opening moment was realizing how "alive" this data is. As long as you hold the update authority, you can mutate the metadata in real-time with a single CLI command.

On Friday, I renamed my NFT, updated the metadata's JSON uri (to update the image icon) and added custom fields like `rarity: legendary` directly from my terminal:

```bash
# Adding a custom metadata field live on devnet
spl-token update-metadata $MINT_ADDRESS rarity "legendary"
```

Watching Solana Explorer update the "legendary" tag seconds after my transaction confirmed felt like running an `UPDATE` statement on a production database, but the "database" is a global public network.

## What's Next?

Using Token Extensions for NFTs feels like the "bare metal" way to build. It's fast, cost-effective, and removes the dependency on third-party programs for basic collection management. I’m excited to see how these primitives will be used to build more complex "programmable" NFTs that react to on-chain events.

Follow along on my `#100DaysOfSolana` journey!
