# Goal-Driven Agent Workflow and Execution Log Analysis

This procedure describes how to set up an autonomous, goal-driven agent workflow that pursues a balance target for a savings wallet and evaluates its execution details across three test scenarios.

## Steps:

### Step 1: Initialize the Workspaces
- Ensure your keypairs are initialized:
  - Operating Wallet: `agent-wallet.json`
  - Savings Wallet: `savings-wallet.json`
- Install dependencies:
  ```bash
  npm install openai @anchor-lang/core
  ```

### Step 2: Implement the Autonomous Agent Loop
- Create [agent-workflow.mjs](./agent-workflow.mjs) using the `openai` SDK.
- The agent is given a single goal prompt: "Make sure the savings wallet holds at least X SOL."
- The agent loop has a turn limit (`MAX_TURNS = 12`) to prevent runaway API requests, and writes a detailed execution history to disk as `run-log.json`.

---

## Log Analysis of Trials

We analyzed the execution logs of three distinct trials carried out under different goals, wallet balances, and policy caps.

### Trial 1: Normal Goal Run (0.2 SOL Goal)
- **Log Files:** [Trial Log 1a](./trial1loga.json) & [Trial Log 1b](./trial1logb.json)
- **Initial State:** Savings wallet balance was `896,000` lamports (~0.000896 SOL); operating wallet balance was `1,952,814,040` lamports (~1.95 SOL).
- **Execution Workflow (Trial 1A):**
  - **Turn 1:** Agent checks both balances using `get_balance`.
  - **Turn 2:** Calculates a deficiency of `199,104,000` lamports to reach the 0.2 SOL target. It proposes a transfer for this exact amount. The policy engine approves it as it is below the single-transfer cap of `0.25 SOL` (`250,000,000` lamports). The transfer completes on-chain (`signature` returned). Agent checks balances again to verify.
  - **Turn 3:** Verifies savings wallet balance is exactly `200,000,000` lamports (0.2 SOL) and stops, reporting success.
- **Subsequent Run (Trial 1B):**
  - **Turn 1:** Agent checks balances; savings wallet already has `200,000,000` lamports.
  - **Turn 2:** Agent reports that the target is already met and exits immediately without triggering any transaction.

### Trial 2: Multi-Step Transfer Under Cap (0.4 SOL Goal)
- **Log File:** [Trial Log 2](./trial2log.json)
- **Initial State:** Savings wallet has `200,000,000` lamports (0.2 SOL); operating wallet has `1,753,705,040` lamports (~1.75 SOL).
- **Execution Workflow:**
  - **Turn 1:** Agent checks balances and realizes it needs `200,000,000` lamports to reach the `0.4 SOL` goal.
  - **Turn 2:** Proposes a single transfer of `200,000,000` lamports. However, for this trial, the single transfer cap is set to `50,000,000` lamports. The policy engine rejects it with: `"200000000 lamports exceeds the per-transfer cap of 50000000"`.
  - **Turns 3-6:** The agent intelligently adapts. In each successive turn, it calls `transfer_sol` for the maximum allowed `50,000,000` lamports, verifies balances, and repeats the process. It executes 4 successful transfers of `50,000,000` lamports each (totaling `200,000,000` lamports).
  - **Turn 7:** Confirms the savings wallet holds `400,000,000` lamports (0.4 SOL) and terminates with a final report of success.

### Trial 3: Impossible Goal (5 SOL Goal)
- **Log File:** [Trial Log 3](./trial3log.json)
- **Initial State:** Savings wallet holds `400,000,000` lamports (0.4 SOL); operating wallet holds `1,553,685,040` lamports (~1.55 SOL).
- **Execution Workflow:**
  - **Turn 1:** Agent checks balances and calculates that it needs `4,600,000,000` lamports to reach the 5 SOL target.
  - **Turn 2:** Recognizes that the operating wallet only has `1,553,685,040` lamports, which is insufficient to cover the deficiency. Instead of sending doomed transaction proposals, it immediately aborts and reports: `"The savings wallet has 400,000,000 lamports... to reach 5 SOL, we need to transfer 4,600,000,000 lamports. However, the operating wallet only has 1,553,685,040 lamports... I cannot fulfill the request."`

> **Final Takeaway:** This trial demonstrates high safety. The agent acts logically to prevent transaction failures, and the turn limits and code-level checks protect funds even if the goal is unachievable.
