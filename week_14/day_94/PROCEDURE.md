# Solana Program in Model Context Protocol (MCP) Server

This procedure describes how to wrap your Solana program's read/write actions in a Model Context Protocol (MCP) server, allowing an MCP-compatible IDE assistant (like VS Code Copilot) to discover and interact with your on-chain programs.

## Steps:

### Step 1: Install Dependencies
- Set up a TypeScript project with the official MCP SDK, zod, and `@anchor-lang/core`:
  ```bash
  pnpm init -y
  pnpm add @modelcontextprotocol/sdk@^1.29 @anchor-lang/core zod
  pnpm add -D typescript tsx @types/node
  ```

### Step 2: Implement the MCP Server
- Create [server.ts](./server.ts) to:
  - Load the Anchor IDL and agent-wallet keypair.
  - Define three tools using `server.registerTool`:
    1. `get_wallet_balance`: Returns the agent's wallet balance.
    2. `get_vault`: Fetches the PDA state of the Anchor vault.
    3. `initialize_vault`: Sends a transaction to deposit funds, secured by a 0.1 SOL hardcoded limit.
  - Establish a `StdioServerTransport` connection to communicate with the client over standard input/output.

### Step 3: Configure VS Code Copilot Integration
- Create a configuration file at [mcp.json](../../.vscode/mcp.json) inside your `.vscode` directory to specify the stdio server endpoint for Copilot:
  ```json
  {
    "servers": {
      "my-solana": {
        "type": "stdio",
        "command": "absolute/path/to/project/week_14/run-mcp.cmd"
      }
    },
    "inputs": []
  }
  ```
- Make sure `run-mcp.cmd` or the corresponding bootloader handles executing `npx tsx server.ts` with correct environment variables and paths.
- Test the integration by asking the VS Code Copilot chat in plain English: "Read my vault. If it does not exist, initialize it with 0.05 SOL."
