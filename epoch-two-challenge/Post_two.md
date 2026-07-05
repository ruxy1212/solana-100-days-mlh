# Can You Own Something You're Not Allowed to Sell?

**Tags:** solana, web3, blockchain, 100daysofsolana

> Solana's Soulbound Credentials, Explained for Web2 Devs

Ownership on a blockchain is supposed to be the whole pitch: whoever holds the private key holds the asset, full stop, no admin panel required. So what happens when I build a token that you can hold... but can never sell, trade, or give away — _and that I can delete from your wallet without asking you?_

That's exactly what I built in Arc 6 of the `#100DaysOfSolana` using two Token Extensions stacked on the same mint (three, actually), and it forced me to rethink what "ownership" even means once code, not policy, is the one enforcing it.

## The Extensions That Make This Possible

**Non-Transferable** locks a token to the account it was minted into. Forever. Not "until the marketplace updates its terms" — the transfer instruction itself is rejected by the protocol.

**Permanent Delegate** grants one authority (in this case, me, the issuer) the power to burn or move the token out of any holder's account without their signature. No multisig, no support ticket, no "please confirm this action."

Combined with a **Metadata** extension, this is enough to build a revocable credential entirely from CLI flags; think about a certification, a compliance badge, or even a membership pass:

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --decimals 0 \
  --enable-non-transferable \
  --enable-permanent-delegate \
  --enable-metadata
```

`--decimals 0` because a credential is a whole thing. You either hold it, or you don't.

## Testing the Rules, Not Just Trusting Them

I minted one credential to a second wallet, then tried to move it to a third wallet using the second wallet's own keypair:

```bash
spl-token transfer $MINT 1 $THIRD_PARTY --owner ~/recipient-wallet.json --fund-recipient --allow-unfunded-recipient
```

Rejected. Not "denied by my backend" — rejected by the Token-2022 program itself, because the non-transferable rule is written into the mint's on-chain data.

Then I did the uncomfortable part. Using my permanent delegate authority, I burned that same credential straight out of the recipient's account, without requesting a signature from them:

```bash
spl-token burn $RECIPIENT_TOKEN_ACCOUNT_ADDRESS 1 --owner ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

It worked. Instantly. No dispute process.

## Outside the Theory

This pattern already exists in production. A good example is Paxos, which uses the Permanent Delegate extension on its USDP stablecoin specifically to claw back funds tied to illegal activity, satisfying a regulatory requirement it operates under. That's a real, audited, non-hypothetical use of _"I can take this back from you"_ living directly inside a currency that moves real money.

## The Best Part Yet

I expected "soulbound" logic to require deploying a custom contract or program that intercepts every transfer instruction and checks a condition. It doesn't. The protocol understands non-transferability and delegated revocation natively — no custom smart contract, no audit surface beyond the extensions I opted into.

## The Way Forward

Here's the uncomfortable question I can't fully answer myself: 
- if I can revoke your credential without your signature, is it actually *yours*, or is it just a permission slip with extra ceremony? - Is this meaningfully different from a company revoking your enterprise SSO seat the day you're offboarded, or is it even worse, since it's permanent and public?

I want the Web2 argument here. Tell me where I'm wrong in the comments.

https://dev.to/russell_oje/solana-can-you-own-something-youre-not-allowed-to-sell-1p39