# Trilogy in Solana: Fee, Interest, and Nontransferable

**Tags:** 100daysofsolana, solana, web3, tutorial

Token-2022 is the upgraded SPL token program on Solana, bringing native extensions that allow a single mint to opt into advanced behaviors without custom programs. This week, I explored three powerful extensions: Transfer Fees, Interest-Bearing tokens, and Non-Transferable tokens. Think of these extensions as middleware for your tokens—enforced at the protocol level.

## The Transfer Fee Mint
**Mint Address:** `FeoMWHjNJgJM6iEQUnUjsJsdPtP3Cu9m99iiuz9RhALG`

I configured this token to skim a fee on every transfer. This is perfect for protocol treasuries or community currencies where a small percentage of every transaction supports the ecosystem.

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkThT93YfkdY59uL35t4Z5Xl --transfer-fee 100 5000
```

This command sets a 1% fee (100 basis points) with a maximum cap of 5000 lamports.

## 2The Interest-Bearing Mint
**Mint Address:** `6vZ9eXTTtGCpwRVLGg6uuyLXxk2yYEykroBTNybf6wT3`

This extension allows a token to accrue interest over time. Crucially, it doesn't mint new supply; instead, the UI-displayed amount updates based on the on-chain rate. 

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkThT93YfkdY59uL35t4Z5Xl --interest-rate 10
```

Future readers: remember that the rate is stored on-chain, but the principal balance remains the same until updated. It's a clever way to handle yield display natively.

## The Non-Transferable Mint
**Mint Address:** `3PWCwuiPauNhYxwArDGaRizKLpJHETLS7RNRqHL1AQvm`

Finally, I built a "Soul-bound" token. Once minted to an account, it cannot be transfered or moved. I tested this by attempting a transfer and received a satisfyingly firm error: `Program log: Transfer is disabled for this mint: custom program error: 0x25`.

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkThT93YfkdY59uL35t4Z5Xl --enable-non-transferable
```

## Take Home
What caught my attention this week is how simple it is to compose these behaviors. Native extensions remove the need for "wrapped" versions of tokens to get simple features like fees or interest. I’m excited to see how these primitives will be used in real products for loyalty programs.
