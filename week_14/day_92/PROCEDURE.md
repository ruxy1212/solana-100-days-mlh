# Read-Only Devnet Agent Using OpenAI

This procedure describes how to set up a read-only AI agent that connects to the Solana devnet to fetch live account balance and metadata information.

## Rationale for OpenAI SDK Selection
Unlike the standard challenge which recommends the `@anthropic-ai/sdk`, I chose to use the `openai` package. This decision was made to:
- Enable flexibility to use various OpenAI-compatible inference providers (e.g., local models or alternative APIs).
- Support free tier users and multiple API keys easily via standard environment variables (`OPEN_AI_API_KEY` and `OPEN_AI_BASE_URL`).

## Steps:

### Step 1: Install Dependencies
- Initialize the project as an ES module and install the required libraries:
  ```bash
  pnpm init -y
  pnpm pkg set type=module
  pnpm add openai @anchor-lang/core
  ```

### Step 2: Implement the Agent
- Create [agent.js](./agent.js) containing:
  - An `OpenAI` client configuration loading `OPEN_AI_API_KEY` and `OPEN_AI_BASE_URL` from the environment.
  - A Solana `Connection` pointing to devnet.
  - Two tool functions defined with the OpenAI function calling schema: `get_balance` and `get_account_info`.
  - A `runTool` function that executes the Solana Web3 RPC methods (`getBalance` and `getAccountInfo`) and returns stringified JSON results.
  - An agent loop that keeps sending the message history to the model as long as `assistantMessage.tool_calls` is present.

### Step 3: Run the Agent
- Export your API key and run the script with a prompt to check account balances or ownership:
  ```bash
  $env:OPEN_AI_API_KEY="your-api-key"
  node agent.js "Look up 9XJDPKMvTyjtMD5wj3tmga7XPwLtiHUWPHVGXQt15EME. Who owns it, and is it executable?"
  ```
