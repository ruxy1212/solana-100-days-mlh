# Design a Revocable Credential Token with Non-Transferable and Permanent Delegate Extensions

## Steps:

### Step 1: Create a non-transferable token with a permanent delegate and metadata

- Combine three extensions in a single mint:
  - `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --decimals 0 --enable-non-transferable --enable-permanent-delegate --enable-metadata`
- Save the mint address from the output. You will need it throughout this experiment.
- Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export MINT_ADDRESS=address`
  - PowerShell/Windows: `$env:MINT_ADDRESS="address"`
> You use `--decimals 0` because credentials are whole units; you either have one or you do not.

### Step 2: Initialize the token metadata

- Give your credential a name, symbol, and URI:
  - `spl-token initialize-metadata $MINT_ADDRESS "Solana Dev Credential" "CRED" "https://example.com/credential.json"`
> The URI would typically point to a JSON file with additional details about the credential, but for this experiment a placeholder works fine.

### Step 3: Create a token account for the recipient and mint one credential

- Generate a second keypair to act as your recipient:
  - `solana-keygen new --outfile ~/recipient-wallet.json --no-bip39-passphrase --force`
- Set the recipient's address as a variable:
  - Bash/macOS/Linux: `export RECIPIENT=$(solana-keygen pubkey ~/recipient-wallet.json)`
  - PowerShell/Windows: `$env:RECIPIENT=(solana-keygen pubkey ~/recipient-wallet.json)`
- Create a token account for the recipient:
  - `spl-token create-account $MINT_ADDRESS --owner $RECIPIENT --fee-payer ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Mint one credential to the recipient:
  - `spl-token mint $MINT_ADDRESS 1 --recipient-owner $RECIPIENT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> In a real scenario, this would be the wallet of a developer who earned the credential.

### Step 4: Verify the token cannot be transferred

- Generate a third keypair to act as a third party:
  - `solana-keygen new --outfile ~/third-party.json --no-bip39-passphrase --force`
- Set the third party's address as a variable:
  - Bash/macOS/Linux: `export THIRD_PARTY=$(solana-keygen pubkey ~/third-party.json)`
  - PowerShell/Windows: `$env:THIRD_PARTY=(solana-keygen pubkey ~/third-party.json)`
- Try to transfer the credential from the recipient to the third party:
  - `spl-token transfer $MINT_ADDRESS 1 $THIRD_PARTY --owner ~/recipient-wallet.json --fee-payer ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --fund-recipient --allow-unfunded-recipient`
> You should see an error indicating the transfer is not allowed. Read it carefully. It confirms that the non-transferable extension blocks all transfers after minting.

### Step 5: Revoke the credential using the permanent delegate

- Simulate the issuing authority revoking the credential. Retrieve the recipient's token account address:
  - `spl-token accounts --owner $RECIPIENT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb -v`
- Set the recipient's token account address as a variable (replace `address` with the output from the previous command):
  - Bash/macOS/Linux: `export RECIPIENT_TOKEN_ACCOUNT_ADDRESS=address`
  - PowerShell/Windows: `$env:RECIPIENT_TOKEN_ACCOUNT_ADDRESS="address"`
- Burn the token from the recipient’s account without their signature:
  - `spl-token burn $RECIPIENT_TOKEN_ACCOUNT_ADDRESS 1 --owner ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Confirm by checking their balance:
  - `spl-token balance $MINT_ADDRESS --owner $RECIPIENT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> Because your default keypair is the permanent delegate, you can burn the token from the recipient’s account without their signature. If the burn succeeds, the credential has been revoked.

### Step 6: Inspect the mint to confirm all extensions are present

- Review the full extension configuration of your mint:
  - `spl-token display $MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> In the output, look for the non-transferable flag, the permanent delegate address, and the metadata fields you set earlier. All three extensions should be visible in the account data.

## Bonus Experiment: Variations to Deepen Understanding

### Variation 1: Multiple credentials

- Mint a second credential to the same recipient:
  - `spl-token mint $MINT_ADDRESS 1 --recipient-owner $RECIPIENT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Burn only one credential from the recipient's account:
  - `spl-token burn $RECIPIENT_TOKEN_ACCOUNT_ADDRESS 1 --owner ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Check the balance to confirm it updates correctly:
  - `spl-token balance $MINT_ADDRESS --owner $RECIPIENT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> Observe how burning a token properly reduces the balance.

### Variation 2: Attempt assigning a new permanent delegate

- Attempt to change the permanent delegate using `authorize`:
  - `spl-token authorize $MINT_ADDRESS permanent-delegate $THIRD_PARTY --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> Watch the output to see what happens. The system allows changing permanent delegate, but you have to supply the `--authority` key.

### Variation 3: Custom metadata fields

- Add a custom metadata field to store an `issued_date`:
  - `spl-token update-metadata $MINT_ADDRESS issued_date "2026-05-31"`
- Add another custom metadata field for `expiry_date`:
  - `spl-token update-metadata $MINT_ADDRESS expiry_date "2027-05-31"`
- Display the token to see the new fields attached to it:
  - `spl-token display $MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
> You can add custom key-value pairs using the metadata extension, which is useful for attaching dynamic parameters to your on-chain credentials.
