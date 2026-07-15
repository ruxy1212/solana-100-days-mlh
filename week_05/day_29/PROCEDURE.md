# Create Your First Token

## Steps:

### Step 1: Point your CLI at devnet and confirm your balance

- Set the CLI cluster to devnet:
  - `solana config set --url devnet`
- Check your wallet address:
  - `solana address`
- Check your balance:
  - `solana balance`
> If your balance is zero, airdrop some devnet SOL: `solana airdrop 2`

### Step 2: Create a token

- Run the command to create a new token:
  - `spl-token create-token`
- Copy the Mint address from the output and save it somewhere.
> This Mint account is the source of truth for your token. It tracks total supply, decimals, and mint authority.

### Step 3: Create a token account

- Create a token account for your new token:
  - `spl-token create-account YOUR_TOKEN_MINT_ADDRESS`
- Replace `YOUR_TOKEN_MINT_ADDRESS` with the mint address from Step 2.
> On Solana, you cannot receive tokens directly into your wallet. You need a separate token account for each type of token.

### Step 4: Mint tokens

- Mint 100 tokens into your account:
  - `spl-token mint YOUR_TOKEN_MINT_ADDRESS 100`
> Only the mint authority (your wallet) can create new supply.

### Step 5: Inspect what you created

- Check the total token supply:
  - `spl-token supply YOUR_TOKEN_MINT_ADDRESS`
- List all tokens your wallet holds:
  - `spl-token accounts`
- View detailed mint account information:
  - `spl-token display YOUR_TOKEN_MINT_ADDRESS`
> You should see your token with a balance of 100 and a total supply of 100.

### Step 6: Save your mint address

- Add your token's mint address to `Addresses.txt` in this directory.
> You will use this address in future challenges.