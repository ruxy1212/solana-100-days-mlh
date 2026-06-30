# Create a non-transferable "soul-bound" token

**Arc theme:** Token-2022
**Web2 bridge:** Certificates of completion. In Web2, a digital badge or certificate is stapled to your profile and cannot be traded or sold. On Solana, we use the non-transferable extension to create "soul-bound" tokens.

## Step 1: Confirm devnet connection and balance

- Ensure your CLI is pointed at devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Check your balance to ensure you have some SOL:
  - `solana balance`

## Step 2: Create the non-transferable mint

- Create a new mint using the Token-2022 program with the non-transferable extension enabled:
  - `spl-token create-token --program-2022 --enable-non-transferable`
- Save the resulting mint address as a variable:
  - `export MINT=[PASTE_YOUR_MINT_ADDRESS_HERE]`

## Step 3: Create your token account and mint a badge

- Create an associated token account for your wallet:
  - `spl-token create-account $MINT`
- Mint exactly one token to yourself, treating it like a unique badge:
  - `spl-token mint $MINT 1`

## Step 4: Setup a recipient for the experiment

- Generate a throwaway keypair to act as the recipient:
  - `solana-keygen new --no-bip39-passphrase --outfile recipient.json --force`
- Set the recipient address as a variable:
  - `export RECIPIENT=$(solana-keygen pubkey recipient.json)`

## Step 5: Attempt a transfer and observe the failure

- Create the recipient's token account first (paying the rent yourself) to ensure the transfer instruction actually hits the program:
  - `spl-token create-account $MINT --owner $RECIPIENT --fee-payer ~/.config/solana/id.json`
- Now, attempt to transfer your token to the recipient:
  - `spl-token transfer $MINT 1 $RECIPIENT --allow-unfunded-recipient`
> This command should fail. The "non-transferable" extension is designed to reject any transfer attempt, ensuring the token stays in the original account forever.

## Step 6: Verify the extension on-chain

- Audit the mint to confirm the extension is active:
  - `spl-token display $MINT`
- Look for the `NonTransferable` entry in the Extensions block. This confirms that the rejection you saw in Step 5 was a feature, not a bug.
