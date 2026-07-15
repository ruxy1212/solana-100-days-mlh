# Understand transaction anatomy

## Steps:

### Step 1: Send a quick transfer on devnet so you have a transaction to inspect

 - Create a temporary wallet and send a small transfer on devnet:
   - `solana-keygen new --no-bip39-passphrase -o /tmp/temp-wallet.json`
   - `solana transfer --allow-unfunded-recipient $(solana address -k /tmp/temp-wallet.json) 0.001 --url devnet`
 - Copy the transaction signature printed in the terminal.
> That signature is both your receipt and the transaction's unique ID.

### Step 2: Pull the transaction apart with the CLI

- Inspect the transaction in verbose mode: `solana confirm -v YOUR_TRANSACTION_SIGNATURE`
- Look for the slot, the accounts involved, and the instruction that was executed.
> If the blockhash is too old, the transaction expires and cannot be replayed.

### Step 3: Open it in Solana Explorer

- Paste the signature into [Solana Explorer](https://explorer.solana.com/) and switch the cluster to `Devnet`.
- Compare the Explorer view with the CLI output:
  - `Signature(s)`: Ed25519 signatures that authorize the transaction.
  - `Account Keys`: the accounts touched by the message, ordered by the header.
  - `Recent Blockhash`: freshness plus replay protection.
  - `Instruction(s)`: the actual program call and its data.

### Step 4: Map the anatomy

| Part | What it means | Web2 analogy |
| :--- | :--- | :--- |
| **Signatures** | 64-byte Ed25519 signatures; count must match the header | Auth token |
| **Header** | Three bytes that describe signer and read-only counts | HTTP headers |
| **Account Keys** | Every account the transaction may touch | Paths / query params |
| **Recent Blockhash** | Recent hash with a short lifetime | CSRF token with expiry |
| **Instructions** | Compiled calls with program ID, accounts, and data | Request body |

### Step 5: Remember the constraint

- A serialized transaction must fit within 1,232 bytes.
- If any instruction fails, the whole transaction rolls back atomically, though fees are still charged.
> This is why transaction size and account ordering matter so much on Solana.
