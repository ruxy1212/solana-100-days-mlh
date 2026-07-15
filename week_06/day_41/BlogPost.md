# Soulbound Credentials on Solana: Combining Non-Transferable and Permanent Delegate

**Tags:** solana, web3, beginner, 100daysofsolana

Imagine you're issuing a digital certificate or a compliance-gated membership. In traditional web2 systems, you have absolute control over a database record and can decide who holds it and when it should be revoked or expired. In web3, assets are typically owned by the wallet holding them—once they are transferred, the issuer loses control.

But what if you need an on-chain credential that the holder can't sell or transfer, and the issuer can revoke if necessary?

This week I explored Solana's Token Extensions (Token-2022) to build exactly this: **A Soulbound Token with a Permanent Delegate**.

## The Token Extensions Involved

To achieve a revocable credential, we combine three Token Extensions at the protocol level:
1. **Non-transferable**: Enforces that the token cannot be moved from the recipient's wallet.
2. **Permanent Delegate**: Allows an authority (us, the issuer) to burn or transfer the token regardless of who holds it.
3. **Metadata**: Binds the credential's details directly to the mint.

## Creating and Revoking the Credential

Here is the exact code snippet I used to generate the token mint with these extensions enabled:

```bash
# Create the mint with non-transferable and permanent-delegate extensions
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --decimals 0 --enable-non-transferable --enable-permanent-delegate --enable-metadata
```

Using `--decimals 0` makes sense here because credentials are whole units—you either hold the certification or you don't.

If the credential owner attempts to transfer the token, the non-transferable extension outright blocks it. The transaction fails on-chain.

If a credential expires or the user violates compliance, the issuer can revoke it using their permanent delegate authority. We do this by burning the token directly from the recipient’s token account—no signature from the recipient required:

```bash
# Burning the credential from the recipient's account
spl-token burn $RECIPIENT_TOKEN_ACCOUNT_ADDRESS 1 --owner ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

## What Surprised Me

What surprised me the most was how deeply these extensions remove the need for custom smart contracts. Previously, I imagined that the "Soulbound" logic would require deploying a custom Anchor program to intercept transfers, but, the protocol inherently understands these rules natively, making the execution safer and cheaper. 

It was incredibly satisfying to watch a transfer attempt legally fail on-chain because the token was minted with the non-transferable flag!

If you want to dive deeper and experiment with these configurations, check out the official Token-2022 extensions guide in the Solana documentation. 