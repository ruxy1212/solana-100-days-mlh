import OpenAI from "openai";
import { web3 } from "@anchor-lang/core";

const { Connection, PublicKey, LAMPORTS_PER_SOL } = web3;

// -----------------------------------------------------------------------------
// OpenAI-compatible client
// -----------------------------------------------------------------------------
// "Look up 9XJDPKMvTyjtMD5wj3tmga7XPwLtiHUWPHVGXQt15EME. Who owns it, and is it executable?"
//"Look up So11111111111111111111111111111111111111112. Who owns it, and is it executable? Also compare the balance in these accounts 7YsAfvnjjtcgeZKBmwnkWCCadcASj9pUGTGqp8bFuBdh and GeyrRJRhgFEcaucgR4wfZHuBseyTS21b71EfARfoWzxq, which one should I use to deploy a new program that requires upto 1.1SOL in rent?"
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.OPEN_AI_BASE_URL,
});

// -----------------------------------------------------------------------------
// Solana connection
// -----------------------------------------------------------------------------

const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

// -----------------------------------------------------------------------------
// Tool definitions
// -----------------------------------------------------------------------------

const tools = [
  {
    type: "function",
    function: {
      name: "get_balance",
      description:
        "Get the current SOL balance of a Solana account on devnet. Returns the balance in both lamports and SOL.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The base58-encoded Solana address to check",
          },
        },
        required: ["address"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_account_info",
      description:
        "Fetch metadata for a Solana account on devnet: which program owns it, its lamport balance, whether it is executable, and how many bytes of data it stores.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The base58-encoded Solana address to inspect",
          },
        },
        required: ["address"],
        additionalProperties: false,
      },
    },
  },
];

// -----------------------------------------------------------------------------
// Tool executor
// -----------------------------------------------------------------------------

async function runTool(name, input) {
  try {
    const pubkey = new PublicKey(input.address);

    if (name === "get_balance") {
      const lamports = await connection.getBalance(pubkey);

      return JSON.stringify({
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      });
    }

    if (name === "get_account_info") {
      const info = await connection.getAccountInfo(pubkey);

      if (!info) {
        return JSON.stringify({
          exists: false,
        });
      }

      return JSON.stringify({
        exists: true,
        owner: info.owner.toBase58(),
        lamports: info.lamports,
        executable: info.executable,
        dataLength: info.data.length,
      });
    }

    return JSON.stringify({
      error: `Unknown tool: ${name}`,
    });
  } catch (err) {
    return JSON.stringify({
      error: err.message,
    });
  }
}

// -----------------------------------------------------------------------------
// User question
// -----------------------------------------------------------------------------

const question =
  process.argv.slice(2).join(" ") ||
  "What is the SOL balance of GeyrRJRhgFEcaucgR4wfZHuBseyTS21b71EfARfoWzxq?";

// -----------------------------------------------------------------------------
// Conversation
// -----------------------------------------------------------------------------

const messages = [
  {
    role: "system",
    content:
      "You are a Solana devnet assistant. Always use your available tools to inspect live on-chain state before answering. Report balances in both lamports and SOL.",
  },
  {
    role: "user",
    content: question,
  },
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