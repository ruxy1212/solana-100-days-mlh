# The Missing Operations Manual for Our On-Chain Autonomous Agent

**Tags:** 100daysofsolana, ai, web3, beginner

---

> Over the past week, we built an autonomous Solana devnet agent that checks wallet balances, executes transfers, and works within strict, code-level safety boundaries. Below is the comprehensive runbook and architectural breakdown of the system.

## System Components

Our agentic stack consists of five modular parts working in unison:
1. **Agent Loop ([agent-workflow.mjs](https://github.com/ruxy1212/solana-100-days-mlh/blob/main/week_14/day_96/agent-workflow.mjs)):** The core reasoning engine powered by OpenAI that takes a natural language goal, decides on tool calls, and runs them up to a turn limit (`MAX_TURNS = 12`).
2. **Read/Write Tools:** Thin Javascript wrappers around Solana Web3 RPC calls that expose `get_balance` and `transfer_sol` to the model.
3. **MCP Server ([server.ts](https://github.com/ruxy1212/solana-100-days-mlh/blob/main/week_14/day_94/server.ts)):** Connects our tools to external clients (like VS Code Copilot via `.vscode/mcp.json`) using standard stdin/stdout protocols.
4. **Policy Engine ([policy.mjs](https://github.com/ruxy1212/solana-100-days-mlh/blob/main/week_14/day_95/policy.mjs)):** Enforces deny-by-default rules, checking every proposed spend against a recipient allowlist and budget caps.
5. **On-Chain Solana Devnet:** The settlement layer where transaction signatures are verified and recorded.

## Tool Reference

### Tool: `get_balance`
- **Inputs:** `address` (string, base58 Solana address)
- **Returns:** Stringified JSON containing the account address and balance in lamports.
- **Side Effects:** None (read-only).

### Tool: `transfer_sol`
- **Inputs:** `to` (string, base58 recipient address), `lamports` (number, amount to transfer)
- **Returns:** JSON object containing transaction status (`confirmed`, `denied`, or `failed`), transaction signature, or failure reason.
- **Side Effects:** Debits the agent's wallet and credits the recipient wallet on-chain if approved.

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

## Architectural Lessons

1. **Model Adaptation:** The model responds dynamically to tool outputs. When a transaction is blocked by a policy rejection, the LLM adapts by splitting the amount into smaller, valid chunks.
2. **Turn Limits are Essential:** A runaway loop could result in high API usage costs. Enforcing a turn limit ensures the agent exits if it gets stuck.
3. **Safety Lives Outside the Prompt:** Prompt engineering alone cannot guarantee safe behavior. Every transaction must pass through the policy engine before reaching the blockchain, regardless of what the model decides.
4. **Observability Builds Trust:** Detailed logs made it easy to verify every reasoning step, every tool call, and every policy decision. Without them, debugging autonomous behavior would have been significantly harder.
5. **Autonomy is More Than Automation:** The agent doesn't execute a fixed script. Instead, it observes its environment, reasons over tool outputs, adjusts its plan when necessary, and stops when the goal becomes impossible or is successfully completed.

## End-to-End Request Flow

The following diagram shows how a plain-English request travels through the stack until it becomes a confirmed Solana devnet transaction.

```text
Natural Language Goal
        │
        ▼
+---------------------------+
|      OpenAI Agent Loop    |
|  Decides next tool call   |
+---------------------------+
        │
        ▼
+---------------------------+
|       MCP Server          |
| Exposes available tools   |
+---------------------------+
        │
        ▼
+---------------------------+
|      Read/Write Tools     |
| get_balance / transfer    |
+---------------------------+
        │
        ▼
+---------------------------+
|      Policy Engine        |
| Deny by default           |
+---------------------------+
      │              │
Allowed│              │Denied
      ▼              ▼
+---------------------------+
|     Solana Devnet         |
| Transaction confirmed     |
+---------------------------+
```

The agent itself never communicates directly with Solana. Every write request must pass through the policy layer first, making the policy engine the single gatekeeper for all fund movements.

## Usage of Policy as Guardrails

Although the language model is responsible for planning the next action, it has no authority to move funds on its own.

Every transfer request passes through the policy engine before reaching the blockchain.

Current policy rules include:

* **Default action:** Deny every transfer unless explicitly permitted.
* **Recipient Validation:** Only approved wallet addresses can receive funds.
* **Transfer Cap:** Reject any transfer that exceeds the configured maximum amount.
* **Budget Enforcement:** Reject transfers that would exceed the configured spending budget.
* **Input Validation:** Reject malformed addresses or invalid transfer amounts.

From the model's perspective, a denied transfer simply becomes another tool response.

Instead of forcing execution, the model must either adjust its plan or conclude that the goal cannot be completed.

This separation of responsibilities creates the core invariant of the entire system:

> **The prompt can change. The model can change. The reasoning path can change. No transaction moves funds without passing the policy engine.**

## Lessons Learnt and Surprises

The biggest surprise throughout this Arc 14 was how naturally the model adapted to changing circumstances.

When a transfer exceeded the configured policy limit, the model didn't repeatedly make the same invalid request. Instead, it interpreted the denial as new information and adjusted its strategy by splitting the transfer into smaller approved chunks.

Another interesting observation was that two runs with the same prompt did not always produce identical tool-call sequences. The reasoning process varied slightly, but the end result remained consistent because every action was constrained by the same policy layer.

Perhaps the most important lesson was realizing that the policy engine, and not the prompt, is the real source of safety. Prompt instructions can influence behavior, but executable rules are what ultimately determine whether funds can move.

## The Way Forward

Over this Arc, the challenges reinforced an architectural principle that extends well beyond Solana:

> **Reasoning should decide what to do. Policy should decide whether it is allowed. The blockchain should record what actually happened.**

Separating those responsibilities makes the system easier to audit, easier to extend, and significantly safer than relying on prompt instructions alone.

While this implementation is intentionally limited to devnet, the same layered architecture can serve as a foundation for more capable on-chain autonomous agents in the future.

*This article summarizes the agent workflow completed during Arc 14 (Days 92–98) of #100DaysOfSolana.*

*Check out the [Week 14 Workspace](https://github.com/ruxy1212/solana-100-days-mlh/tree/main/week_14).*