import OpenAI from "openai";
import { readFileSync } from "node:fs";
import { web3 } from "@anchor-lang/core";

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

// Enforced in code. The model cannot override this, no matter what it is asked.
const MAX_SOL_PER_SEND = 0.1;

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
        `Transfers above ${MAX_SOL_PER_SEND} SOL are rejected by policy.`,
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
    if (input.amount_sol > MAX_SOL_PER_SEND) {
      return JSON.stringify({
        error: `Rejected by policy: ${input.amount_sol} SOL exceeds the ` +
               `${MAX_SOL_PER_SEND} SOL per-transfer cap.`,
      });
    }

    let recipient;
    try {
      recipient = new PublicKey(input.recipient);
    } catch {
      return JSON.stringify({ error: `"${input.recipient}" is not a valid Solana address.` });
    }
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: Math.round(input.amount_sol * LAMPORTS_PER_SOL),
      })
    );

    let signature;
    try {
      signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    } catch (error) {
      // A failed send is a normal result for the agent to report, not a crash.
      const message = error?.message ?? String(error);
      if (/no record of a prior credit|insufficient/i.test(message)) {
        return JSON.stringify({
          error: `Send failed: the agent wallet ${wallet.publicKey.toBase58()} has no ` +
                 `devnet SOL. Fund it at https://faucet.solana.com/ and try again.`,
        });
      }
      return JSON.stringify({ error: `Send failed: ${message}` });
    }

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
}