# Create a Compliance-Gated Token with Default Frozen Accounts

## Steps:

### Step 1: Create a mint with default frozen accounts

- Run this command to create a mint that forces all new token accounts to start in a frozen state:
  - `spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-freeze --default-account-state frozen`
- Copy the mint address from the output.
- Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export MINT_ADDRESS=address`
  - PowerShell/Windows: `$env:MINT_ADDRESS="address"`
> The `--enable-freeze` flag is required because the freeze authority (your wallet) needs the power to thaw the accounts later.

### Step 2: Create two token accounts

- Create a token account for your own wallet:
  - `spl-token create-account $MINT_ADDRESS`
- Set your token account address as a variable:
  - Bash/macOS/Linux: `export YOUR_TOKEN_ACCOUNT_ADDRESS=address`
  - PowerShell/Windows: `$env:YOUR_TOKEN_ACCOUNT_ADDRESS="address"`
- Generate a second keypair to simulate another user in a separate wallet:
  - `solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase --force`
- Set the second wallet's address as a variable:
  - Bash/macOS/Linux: `export SECOND_WALLET=$(solana-keygen pubkey ~/second-wallet.json)`
  - PowerShell/Windows: `$env:SECOND_WALLET=(solana-keygen pubkey ~/second-wallet.json)`
- Create a token account for the second wallet:
  - `spl-token create-account $MINT_ADDRESS --owner $SECOND_WALLET --fee-payer ~/.config/solana/id.json`
- Set the second wallet's token account address as a variable:
  - Bash/macOS/Linux: `export SECOND_TOKEN_ACCOUNT_ADDRESS=address`
  - PowerShell/Windows: `$env:SECOND_TOKEN_ACCOUNT_ADDRESS="address"`

### Step 3: Attempt to mint tokens to the frozen account

- Try to mint tokens to your primary account:
  - `spl-token mint $MINT_ADDRESS 100`
> This command will FAIL and throw an "Account is frozen" error. This confirms the default frozen state is actively enforced. No one can receive or send tokens until the freeze authority explicitly thaws them.

### Step 4: Thaw the account

- Approve (thaw) your token account so it can transact:
  - `spl-token thaw $YOUR_TOKEN_ACCOUNT_ADDRESS`

### Step 5: Mint tokens (Success)

- Try minting the 100 tokens to your primary account again:
  - `spl-token mint $MINT_ADDRESS 100`
> This time, it succeeds because the account state has been changed from frozen to initialized.

### Step 6: Attempt transfer to a frozen account

- Try to transfer 50 tokens from your approved account to the second wallet (still frozen):
  - `spl-token transfer $MINT_ADDRESS 50 $SECOND_WALLET --allow-unfunded-recipient`
> This command will FAIL. Even though the sender is approved, the recipient must also be thawed to interact with the token.

### Step 7: Thaw the recipient and complete the transfer

- Thaw the second wallet's token account:
  - `spl-token thaw $SECOND_TOKEN_ACCOUNT_ADDRESS`
- Re-run the transfer command:
  - `spl-token transfer $MINT_ADDRESS 50 $SECOND_WALLET --allow-unfunded-recipient`
- Verify the balance of the second wallet:
  - `spl-token accounts --owner $SECOND_WALLET`
> Both accounts are now approved, the transfer goes through, and the second wallet should reflect a balance of 50 tokens.
