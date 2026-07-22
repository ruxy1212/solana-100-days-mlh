import OpenAI from "openai";
import { web3 } from "@anchor-lang/core";
import fs from "fs";

const {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} = web3;

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.OPEN_AI_BASE_URL,
});

function loadWallet(path) {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8")))
  );
}

const operating = loadWallet("agent-wallet.json");
const savings = loadWallet("savings-wallet.json");

// ---- The policy layer: deny by default, hard numeric caps ----
const TARGET = 5;
const POLICY = {
  allowedRecipients: [savings.publicKey.toBase58()],
  maxLamportsPerTransfer: 0.25 * LAMPORTS_PER_SOL,
  maxLamportsPerRun: 0.5 * LAMPORTS_PER_SOL,
};

// ---- The goal: the only instruction the agent gets ----
const GOAL = `Make sure the savings wallet (${savings.publicKey.toBase58()}) holds at least ${TARGET} SOL. Check balances before moving anything, move only what is needed from the operating wallet, and verify the final balances before you finish.`;

let spentThisRun = 0;

function checkPolicy(to, lamports) {
  if (!POLICY.allowedRecipients.includes(to)) {
    return { allowed: false, reason: `recipient ${to} is not on the allowlist` };
  }
  if (lamports > POLICY.maxLamportsPerTransfer) {
    return {
      allowed: false,
      reason: `${lamports} lamports exceeds the per-transfer cap of ${POLICY.maxLamportsPerTransfer}`,
    };
  }
  if (spentThisRun + lamports > POLICY.maxLamportsPerRun) {
    return {
      allowed: false,
      reason: `this transfer would push total spend past the per-run cap of ${POLICY.maxLamportsPerRun} lamports`,
    };
  }
  return { allowed: true, reason: "within policy" };
}

// ---- The run log: every decision, on disk ----
let currentTurn = 0;
const runLog = [];

function logEvent(event, detail) {
  runLog.push({ turn: currentTurn, event, detail });
  console.log(`[turn ${currentTurn}] ${event}: ${JSON.stringify(detail)}`);
}

// ---- The tools the model can call ----
const tools = [
  {
    type: "function",
    function: {
      name: "get_balance",
      description:
        "Get the current balance of a Solana devnet account in lamports.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Base58 account address" },
        },
        required: ["address"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "transfer_sol",
      description: "Transfer lamports from the operating wallet to a recipient. Every transfer is checked against a policy before signing. A denial is not an error: adjust your plan or stop.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Base58 recipient address" },
          lamports: { type: "number", description: "Amount in lamports" },
        },
        required: ["to", "lamports"],
        additionalProperties: false,
      },
    },
  },
];

async function runTool(name, input) {
  if (name === "get_balance") {
    const lamports = await connection.getBalance(new PublicKey(input.address));
    return JSON.stringify({ address: input.address, lamports });
  }
  if (name === "transfer_sol") {
    const verdict = checkPolicy(input.to, input.lamports);
    logEvent("policy_check", { ...input, ...verdict });
    if (!verdict.allowed) {
      return JSON.stringify({ status: "denied", reason: verdict.reason });
    }
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: operating.publicKey,
        toPubkey: new PublicKey(input.to),
        lamports: input.lamports,
      })
    );
    let signature;
    try {
      signature = await sendAndConfirmTransaction(connection, tx, [operating]);
    } catch (err) {
      // A failed send is a normal outcome the agent should reason about, not a crash.
      // The usual cause is an operating wallet with too little SOL left.
      const reason = err?.message ?? String(err);
      logEvent("transfer_failed", { reason });
      return JSON.stringify({ status: "failed", reason });
    }
    spentThisRun += input.lamports;
    return JSON.stringify({ status: "confirmed", signature });
  }
  return JSON.stringify({ error: `unknown tool: ${name}` });
}

// ---- The agent loop: run until the model stops or we hit the turn limit ----
const MAX_TURNS = 12;

const SYSTEM = `You are a workflow agent managing Solana devnet wallets.
Operating wallet: ${operating.publicKey.toBase58()}
Savings wallet: ${savings.publicKey.toBase58()}
Amounts are in lamports; 1 SOL = ${LAMPORTS_PER_SOL} lamports.
Use your tools to accomplish the goal. A policy denial means the action is not allowed; adjust your plan or stop. When the goal is met, or you conclude it cannot be met, stop and give a short honest report of what you did.`;

async function main() {
  const messages = [
    { role: "system",
      content: SYSTEM,
    },
    { role: "user", content: GOAL }
  ];

  for (currentTurn = 1; currentTurn <= MAX_TURNS; currentTurn++) {
    const response = await client.chat.completions.create({
      model: process.env.OPEN_AI_MODEL || 'chatgpt-4o-latest',
      messages,
      tools,
      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    messages.push(assistantMessage);

    // If there are no tool calls, we're done.
    if (!assistantMessage.tool_calls?.length) {
      logEvent("final_report", assistantMessage.content);
      break;
    }

    // Execute every requested tool.
    for (const toolCall of assistantMessage.tool_calls) {
      const name = toolCall.function.name;
      const input = JSON.parse(toolCall.function.arguments);

      logEvent("tool_call", { tool: name, input:JSON.stringify(input) });
      const result = await runTool(name, input);
      logEvent("tool_result", result);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  fs.writeFileSync("run-log.json", JSON.stringify(runLog, null, 2));
  console.log(`Run complete. ${runLog.length} events written to run-log.json`);
}

main();
