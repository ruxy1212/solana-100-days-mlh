# Explore system program accounts

## Steps:

### Step 1: Point your CLI at devnet and confirm your wallet

- Set the CLI cluster to devnet:
  - `solana config set --url devnet`
- Print your wallet address:
  - `solana address`
- Check your wallet balance:
  - `solana balance`
- If your balance is zero, request some devnet SOL:
  - `solana airdrop 2`
> The devnet airdrop can sometimes fail because of rate limits, so the web faucet is a good fallback.

### Step 2: Inspect your own wallet account

- Look at the raw account data for your wallet:
  - `solana account $(solana address)`
- Pay attention to these fields in the output:
  - `Lamports`: your balance in the smallest unit of SOL
  - `Data Length`: 0 bytes for a basic wallet account
  - `Owner`: `11111111111111111111111111111111`, the System Program
  - `Executable`: `false`, because your wallet is not a program
  - `Rent Epoch`: a legacy rent-related field
> Any account owned by the System Program is a system account, and basic wallets are the simplest example.

### Step 3: Inspect the System Program itself

- Look at the System Program account:
  - `solana account 11111111111111111111111111111111`
- Compare it with your wallet account:
  - `Executable` should be `true`
  - `Owner` should be `NativeLoader1111111111111111111111111111111`
> The System Program is still just an account, but it contains executable code and is owned by the Native Loader.

### Step 4: Compare it to other native programs

- Inspect the Stake Program:
  - `solana account Stake11111111111111111111111111111111111111`
- Inspect the Vote Program:
  - `solana account Vote111111111111111111111111111111111111111`
- Compare both to the System Program account.
> Native programs all follow the same pattern: they are executable and owned by the Native Loader.

### Step 5: Explore a sysvar account

- Inspect the Clock sysvar:
  - `solana account SysvarC1ock11111111111111111111111111111111`
- Inspect the Rent sysvar:
  - `solana account SysvarRent111111111111111111111111111111111`
- Look at what they expose:
  - The Clock sysvar shows slot, epoch, and Unix timestamp information
  - The Rent sysvar shows rent-related cluster settings
> Sysvars are read-only accounts that expose cluster-wide state, not program code.

### Step 6: Open the same accounts in Solana Explorer

- Paste these addresses into [Solana Explorer](https://explorer.solana.com/) and switch to `Devnet`:
  - Your wallet address
  - `11111111111111111111111111111111`
  - `SysvarC1ock11111111111111111111111111111111`
- Compare the Explorer labels with the CLI output.
> Explorer makes it easier to spot whether an account is a wallet, a program, or a sysvar.

### Step 7: Pull the same data in JSON

- Ask the CLI for structured output:
  - `solana account $(solana address) --output json`
  - `solana account 11111111111111111111111111111111 --output json`
- Compare the fields side by side.
> JSON output is useful when you want to script comparisons across account types.

### Step 8: Map the account model

- Every Solana account shares the same five fields:
  - `lamports`
  - `data`
  - `owner`
  - `executable`
  - `rent_epoch`
- What changes is how those fields are set.
> Wallets, programs, and sysvars all use the same structure, but they play very different roles on chain.