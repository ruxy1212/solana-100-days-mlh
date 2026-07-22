# The Missing Operations Manual for Our On-Chain Autonomous Agent

**Tags:** 100daysofsolana, ai, web3, beginner

---

> Over the past week, we built an autonomous Solana devnet agent that checks wallet balances, executes transfers, and works within strict, code-level safety boundaries. Below is the comprehensive runbook and architectural breakdown of the system.

## System Components

Our agentic stack consists of five modular parts working in unison:
1. **Agent Loop ([agent-workflow.mjs](https://github.com/ruxy1212/solana-100-days-mlh/blob/b21d11d378dd9fc93d3ccbe5f3126edef59b039d/week_14/day_96/agent-workflow.mjs)):** The core reasoning engine powered by OpenAI that takes a natural language goal, decides on tool calls, and runs them up to a turn limit (`MAX_TURNS = 12`).
2. **Read/Write Tools:** Thin Javascript wrappers around Solana Web3 RPC calls that expose `get_balance` and `transfer_sol` to the model.
3. **MCP Server ([server.ts](file:///C:/laragon/www/react/ideas/solana-100/week_14/day_94/server.ts)):** Connects our tools to external clients (like VS Code Copilot via `.vscode/mcp.json`) using standard stdin/stdout protocols.
4. **Policy Engine ([policy.mjs](file:///C:/laragon/www/react/ideas/solana-100/week_14/day_95/policy.mjs)):** Enforces deny-by-default rules, checking every proposed spend against a recipient allowlist and budget caps.
5. **On-Chain Solana Devnet:** The settlement layer where transaction signatures are verified and recorded.

---

## Tool Reference

### Tool: `get_balance`
- **Inputs:** `address` (string, base58 Solana address)
- **Returns:** Stringified JSON containing the account address and balance in lamports.
- **Side Effects:** None (read-only).

### Tool: `transfer_sol`
- **Inputs:** `to` (string, base58 recipient address), `lamports` (number, amount to transfer)
- **Returns:** JSON object containing transaction status (`confirmed`, `denied`, or `failed`), transaction signature, or failure reason.
- **Side Effects:** Debits the agent's wallet and credits the recipient wallet on-chain if approved.

---

## Log Analysis of a Real Run

Here is the log analysis from our Day 96 trial runs, showcasing how the agent behaves under normal, restricted, and impossible scenarios.

### Scenario A: Normal Goal-Seeking Run (0.2 SOL Target)
*Initial savings wallet holds 896,000 lamports. Target is 200,000,000 lamports (0.2 SOL).*
- **Turn 1:** Model calls `get_balance` for both operating and savings wallets.
- **Turn 2:** Calculates the difference (`199,104,000` lamports) and calls `transfer_sol`.
- **Policy Check:** Approved (under single-transfer cap of 0.25 SOL).
- **Turn 3:** Model calls `get_balance` again, verifies the savings wallet holds exactly `200,000,000` lamports, and outputs the final report.

### Scenario B: Multi-Step Transfer Under Cap (0.4 SOL Target)
*Initial savings wallet holds 0.2 SOL. Per-transfer cap is set to 50,000,000 lamports.*
- **Turn 1:** Model checks balances, determines a deficiency of `200,000,000` lamports.
- **Turn 2:** Proposes transferring `200,000,000` lamports. The policy engine blocks it for exceeding the per-transfer limit.
- **Turns 3-6:** The agent adjusts and executes four sequential transfers of `50,000,000` lamports. All four are approved and confirm.
- **Turn 7:** Verifies the new balance of `400,000,000` lamports and exits successfully.

### Scenario C: Impossible Goal (5 SOL Target)
- **Turn 1:** Agent checks balances: operating wallet has 1.55 SOL, savings has 0.4 SOL.
- **Turn 2:** Agent recognizes it needs 4.6 SOL but only has 1.55 SOL in its operating wallet. It aborts immediately and reports that the goal is impossible to meet, preventing unnecessary transaction attempts.

---

## Architectural Lessons

1. **Model Adaptation:** The model responds dynamically to tool outputs. When a transaction is blocked by a policy rejection, the LLM adapts by splitting the amount into smaller, valid chunks.
2. **Turn Limits are Essential:** A runaway loop could result in high API usage costs. Enforcing a turn limit ensures the agent exits if it gets stuck.
3. **OpenAI SDK Portability:** Building the loops with `openai` allows us to run these agents against multiple LLM providers seamlessly.
