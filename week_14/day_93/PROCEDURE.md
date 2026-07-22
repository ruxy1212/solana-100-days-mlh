# Guarded Transaction Agent Using OpenAI

This procedure describes how to give your AI agent its own wallet and allow it to send SOL on the devnet under a hard-coded policy cap of 0.1 SOL.

## Steps:

### Step 1: Generate the Wallet
- Create a script [setup-wallet.mjs](./setup-wallet.mjs) to generate a fresh keypair and save the secret key to `agent-wallet.json`.
- Fund this wallet using the Solana CLI or faucet:
  ```bash
  node setup-wallet.mjs
  ```

### Step 2: Implement the Guarded Agent
- Create [agent.mjs](./agent.mjs) using `openai` (rather than the standard `anthropic` client).
- Inside [agent.mjs](./agent.mjs), define:
  - A balance check tool `get_balance`.
  - A transaction signing tool `send_sol` that constructs a `SystemProgram.transfer` transaction and signs it with the local `agent-wallet.json` keypair.
  - A hardcoded limit check `const MAX_SOL_PER_SEND = 0.1;` inside the tool code. Any transfer requests exceeding this threshold are rejected immediately by code before reaching the network.

### Step 3: Run and Validate
- Prompt the agent to check the balance and send a small transaction:
  ```bash
  $env:OPEN_AI_API_KEY="your-api-key"
  node agent.mjs "Check your balance, then send 0.05 SOL to [RECIPIENT_ADDRESS] and report the transaction signature."
  ```
- Test the policy guardrail:
  ```bash
  node agent.mjs "Send 1 SOL to [RECIPIENT_ADDRESS]."
  ```
  Verify that the code blocks the execution and returns a policy rejection message.
