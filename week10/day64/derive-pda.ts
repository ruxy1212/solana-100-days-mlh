import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7");

// --- Run 1: seed = ["counter"] ---
const [pda1, bump1] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
console.log("\n=== Run 1: seeds = [\"counter\"] ===");
console.log("Seeds:         [\"counter\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda1.toBase58());
console.log("Canonical bump:", bump1);

// --- Run 2: seed = ["counter", "alice"] ---
const [pda2, bump2] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), Buffer.from("alice")],
  programId
);
console.log("\n=== Run 2: seeds = [\"counter\", \"alice\"] ===");
console.log("Seeds:         [\"counter\", \"alice\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda2.toBase58());
console.log("Canonical bump:", bump2);

// --- Run 3: seed = ["counter", "bob"] ---
const [pda3, bump3] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), Buffer.from("bob")],
  programId
);
console.log("\n=== Run 3: seeds = [\"counter\", \"bob\"] ===");
console.log("Seeds:         [\"counter\", \"bob\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda3.toBase58());
console.log("Canonical bump:", bump3);

// --- Run 4: restore to ["counter"] — must match Run 1 exactly ---
const [pda4, bump4] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
console.log("\n=== Run 4: seeds = [\"counter\"] (restored) ===");
console.log("Seeds:         [\"counter\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda4.toBase58());
console.log("Canonical bump:", bump4);
console.log(
  "\nRun 1 === Run 4 (determinism check):",
  pda1.toBase58() === pda4.toBase58() ? "✅ MATCH" : "❌ MISMATCH"
);
