import { createSolanaRpc, devnet, address } from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

// Check the balance of the address you already funded
const { value: balance } = await rpc.getBalance(address("E71ChrMBQ1JoiPnabuDZAmd5CXRRMvaSDt4oa3TXPjMr")).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`Balance: ${balanceInSol} SOL`);