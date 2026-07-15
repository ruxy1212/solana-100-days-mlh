# Inspect account data

## Steps:

### Step 1: Point your CLI at devnet and confirm your wallet address

- Set the CLI cluster to devnet:
  - `solana config set --url https://api.devnet.solana.com`
- Print your wallet public key:
  - `solana address`
- Copy the address that appears in the terminal.
> That public key is your wallet account on Solana.

### Step 2: Fund the wallet if you need test SOL

- Request a small devnet airdrop:
  - `solana airdrop 2`
- If the cluster is busy, run the command again after a short pause.
> You need a balance so the account output is easier to inspect.

### Step 3: Inspect your own wallet account

- Look at the account details for your wallet:
  - `solana account $(solana address)`
- Pay attention to these fields in the output:
  - `Balance`: how many SOL the account controls
  - `Owner`: the program that can modify the account
  - `Executable`: whether the account is a program
  - `Length`: how many bytes of account data it stores
  - `Rent Epoch`: a legacy rent-related field
> Your wallet should be owned by the System Program, should not be executable, and should have 0 bytes of custom data.

### Step 4: Compare it to a program account

- Inspect the SPL Token Program account:
  - `solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Compare the output to your wallet account:
  - `Executable` should be `true`
  - `Owner` should be the loader that deployed the program
  - `Length` should be greater than 0 because the account stores program bytecode
> This shows the difference between a plain wallet account and a program account.

### Step 5: Inspect the System Program itself

- Look at the native System Program:
  - `solana account 11111111111111111111111111111111`
- Compare its fields with the wallet and token program accounts.
> The System Program is the core program that creates accounts and handles SOL transfers.

### Step 6: View the same data in JSON

- Ask the CLI for machine-readable output:
  - `solana account $(solana address) --output json`
- Use the JSON fields to match the text output:
  - `lamports`
  - `data`
  - `owner`
  - `executable`
  - `rentEpoch`
> JSON output is useful when you want to script around account inspection later.
