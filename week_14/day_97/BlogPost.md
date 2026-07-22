# The Architecture of Guarded Blockchain Agents: Moving From Prompt Constraints to Code-Enforced Policies

**Tags:** 100daysofsolana, ai, web3, openai

---

> Large Language Models can reason, write code, and make decisions, but they also hallucinate, get confused, and can be persuaded to break rules. Prompt engineering helps guide an AI's behavior, but it is not a security mechanism. When connecting an LLM to a live blockchain wallet, the real protection must come from code-enforced policies that explicitly define what actions are allowed and reject everything else by default. Here is how we design a robust, code-enforced, deny-by-default policy layer to protect on-chain assets.

## The Illusion of Prompt Security

When developers first build AI agents, they often try to secure them through the system prompt:

```text
"You are a helpful assistant. You have a wallet, but you must never transfer more than 0.1 SOL at a time, and you must never send funds to any address not listed below..."
```

This is a dangerous anti-pattern. Prompts are instructions, not bounds. Through jailbreaking, role-play attacks, or simple adversarial persuasion, an LLM can be manipulated into ignoring its system prompt. If the agent's tools have direct, unrestricted access to sign and send transactions, a successful prompt injection means your wallet can be drained instantly.

To build secure on-chain agents, we must separate the **Reasoning Engine** (the LLM) from the **Execution and Policy Engine** (our code). The model decides what it *wants* to do; our code decides what is *allowed* to be signed.

---

## The Guarded Agent Architecture

A secure agentic transaction flow operates like a restricted banking API:

```text
       User Request (Goal)
              |
              v
     +-----------------+
     |   Agent Loop    | <--- LLM reasons and outputs a tool call (e.g., transfer_sol)
     +-----------------+
              |
              v
     +-----------------+
     |   MCP Server /  |
     |   Tool Handler  | <--- Resolves the tool request
     +-----------------+
              |
              v
     +-----------------+
     |  Policy Engine  | <--- Deny-by-default checks (Allowlist, per-tx caps, session budgets)
     +-----------------+
              |
        Approved?
         /      \
      Yes        No
      /            \
     v              v
+----------+   +----------+
| Sign &   |   | Block Tx |
| Send Tx  |   | & Return |
|          |   | Error    |
+----------+   +----------+
```

In this architecture, the LLM never sees or touches the wallet's private key. The private key resides strictly within the backend execution process. When the agent requests a transfer, the parameters are passed to a hard-coded validator. If the parameters violate any policy, the transaction is rejected immediately before it is even compiled.

---

## Three Pillars of Agentic Wallet Policy

A production-grade agent wallet policy should enforce three layers of protection:

### 1. Deny-by-Default Allowlisting
Never let an agent send funds to an arbitrary address. The policy should contain a hard-coded set or read-only database of approved recipient addresses. If the target address is not in the set, the execution halts.

### 2. Per-Transfer Cap
Limit the maximum amount of lamports that can be moved in a single transaction. This prevents a single compromised or runaway model turn from transferring the entire wallet balance.

### 3. Session / Cumulative budget
A per-transfer cap alone is insufficient; an LLM could run in a loop and execute twenty 0.1 SOL transactions to drain 2 SOL. A cumulative session cap tracks the sum of all successful transfers in the current run and blocks further action once the threshold is crossed.

---

## Lessons from the Field

As we ran experiments with this architecture, several critical insights emerged:
- **Non-Determinism as a Feature:** When a single transaction is blocked by the policy engine, a smart agent doesn't crash. It reads the error returned by the tool, adapts its planning, and splits the task into smaller chunks that fit within the policy limits.
- **Failures are Normal Tool Results:** A transaction failure (due to policy rejection or network congestion) should not throw an exception that crashes the Node.js process. It should be returned as a standard stringified JSON result so the LLM can explain it or adjust its strategy.

