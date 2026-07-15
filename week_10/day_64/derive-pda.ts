import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7");

// First run: seed = ["counter"]
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
console.log("Seeds:        [\"counter\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda.toBase58());
console.log("Canonical bump:", bump);

// Second run: seed = ["counter", "alice"]
const [pda2, bump2] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), Buffer.from("alice")],
  programId
);
console.log("\nSecond run with seed as [\"counter\", \"alice\"]");
console.log("Seeds:         [\"counter\", \"alice\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda2.toBase58());
console.log("Canonical bump:", bump2);

// Third run: seed = ["counter", "bob"]
const [pda3, bump3] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), Buffer.from("bob")],
  programId
);
console.log("\nThird run with seed as [\"counter\", \"bob\"]");
console.log("Seeds:         [\"counter\", \"bob\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda3.toBase58());
console.log("Canonical bump:", bump3);

// Last run: seed = ["counter"] again
const [pda4, bump4] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  programId
);
console.log("\nLast run with seed as [\"counter\"] again");
console.log("Seeds:         [\"counter\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda4.toBase58());
console.log("Canonical bump:", bump4);

// Determinism check: Run 1 and Run 4 should produce the same PDA
console.log(
  "\nRun 1 === Run 4 (determinism check):",
  pda.toBase58() === pda4.toBase58() ? "✅ MATCH" : "❌ MISMATCH"
);
