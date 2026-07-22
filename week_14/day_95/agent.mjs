import OpenAI from "openai";
import { readFileSync } from "node:fs";
import { web3 } from "@anchor-lang/core";
import { checkTransferPolicy, recordSpend, MAX_LAMPORTS_PER_TRANSFER, MAX_LAMPORTS_PER_SESSION } from "./policy.mjs";

const {
  Connection, Keypair, PublicKey, SystemProgram,
  Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL,
} = web3;

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.OPEN_AI_BASE_URL,
});

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync("agent-wallet.json", "utf8")))
);

//"Send 0.05 SOL to GeyrRJRhgFEcaucgR4wfZHuBseyTS21b71EfARfoWzxq."

const tools = [
  {
    type: "function",
    function: {
      name: "get_balance",
      description:
        "Get the current balance of the agent's own devnet wallet, in SOL.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_sol",
      description:
        `Send SOL from the agent's wallet to a recipient on devnet. ` +
        `Transfers are limited to allowlisted recipients, and above ${MAX_LAMPORTS_PER_TRANSFER / LAMPORTS_PER_SOL} SOL per transfer or ${MAX_LAMPORTS_PER_SESSION / LAMPORTS_PER_SOL} SOL per session are rejected by policy.`,
      parameters: {
        type: "object",
        properties: {
          recipient: { type: "string", description: "Base58 Solana address to send to" },
          amount_sol: { type: "number", description: "Amount to send, in SOL" },
        },
        required: ["recipient", "amount_sol"],
        additionalProperties: false,
      },
    },
  },
];

async function runTool(name, input) {
  if (name === "get_balance") {
    const lamports = await connection.getBalance(wallet.publicKey);
    return JSON.stringify({
        balance_sol: lamports / LAMPORTS_PER_SOL,
      });
  }

  if (name === "send_sol") {
    const lamports = Math.round(input.amount_sol * LAMPORTS_PER_SOL);
    const decision = checkTransferPolicy(input.recipient, lamports);

    if (!decision.allowed) {
      // Nothing is signed. The model only gets an explanation.
      return JSON.stringify({ error: `Transfer blocked by policy: ${decision.reason}` });
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(input.recipient),
        lamports,
      })
    );
    let signature;
    try {
      signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    } catch (err) {
      // Never crash the agent: hand the failure back as a tool result it can relay.
      const message = err?.message ?? String(err);
      if (/no record of a prior credit|insufficient/i.test(message)) {
        return JSON.stringify({
          error: `Send failed: the agent wallet ${wallet.publicKey.toBase58()} has no devnet SOL. ` +
                `Fund it at https://faucet.solana.com/ and run this again.`,
        });
      }
      return JSON.stringify({ error: `Send failed: ${message}` });
    }

    recordSpend(lamports);
    return JSON.stringify({
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  }

  return JSON.stringify({
    error: `Unknown tool: ${name}`,
  });
}

const messages = [
  { role: "system",
    content: "You are an agent that manages a small Solana devnet wallet. " +
      "You can check its balance and send SOL. Always report transaction " +
      "signatures and policy rejections back to the user honestly."
  },
  { role: "user", content: process.argv[2] }
];

// -----------------------------------------------------------------------------
// Agent loop
// -----------------------------------------------------------------------------

while (true) {
  try {
    const response = await client.chat.completions.create({
      model: process.env.OPEN_AI_MODEL || 'chatgpt-4o-latest', // e.g. gpt-5, gpt-4.1, qwen3, etc.
      messages,
      tools,
      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    messages.push(assistantMessage);

    // If there are no tool calls, we're done.
    if (!assistantMessage.tool_calls?.length) {
      console.log("\n" + assistantMessage.content);
      break;
    }

    // Execute every requested tool.
    for (const toolCall of assistantMessage.tool_calls) {
      const name = toolCall.function.name;
      const input = JSON.parse(toolCall.function.arguments);

      console.log(
        `[tool] ${name}(${JSON.stringify(input)})`
      );

      const result = await runTool(name, input);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(`[OpenAI API Error] Status ${error.status}: ${error.message}`);
      switch (error.status) {
        case 401:
          console.error("-> Authentication failed: Check your OPENAI_API_KEY.");
          break;
        case 429:
          console.error("-> Rate limit or quota exceeded: Check your plan/billing.");
          break;
        case 400:
          console.error("-> Bad Request: Check your tools array or messages payload schema.");
          break;
        case 500:
        case 503:
          console.error("-> OpenAI server error: Retrying shortly might work.");
          break;
      }
    }
    if (error.code === "ENOTFOUND" || error.code === "ECONNRESET") {
      console.error("[Network Error] Could not connect to OpenAI services.");
    }
    // console.error("[Unexpected Error]", error);
    break;
  }
}