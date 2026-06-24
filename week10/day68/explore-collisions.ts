import * as anchor from "@anchor-lang/core";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Counter } from "./counter";

// type Counter = {
//   "address": "9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7",
//   "metadata": {
//     "name": "counter",
//     "version": "0.1.0",
//     "spec": "0.1.0",
//     "description": "Created with Anchor"
//   },
//   "instructions": [
//     {
//       "name": "closeCounter",
//       "discriminator": [
//         4,
//         236,
//         52,
//         248,
//         107,
//         146,
//         187,
//         49
//       ],
//       "accounts": [
//         {
//           "name": "counter",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   117,
//                   110,
//                   116,
//                   101,
//                   114
//                 ]
//               },
//               {
//                 "kind": "account",
//                 "path": "user"
//               }
//             ]
//           }
//         },
//         {
//           "name": "user",
//           "writable": true,
//           "signer": true,
//           "relations": [
//             "counter"
//           ]
//         }
//       ],
//       "args": []
//     },
//     {
//       "name": "increment",
//       "discriminator": [
//         11,
//         18,
//         104,
//         9,
//         104,
//         174,
//         59,
//         33
//       ],
//       "accounts": [
//         {
//           "name": "config",
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   110,
//                   102,
//                   105,
//                   103
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           "name": "counter",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   117,
//                   110,
//                   116,
//                   101,
//                   114
//                 ]
//               },
//               {
//                 "kind": "account",
//                 "path": "user"
//               }
//             ]
//           }
//         },
//         {
//           "name": "user",
//           "signer": true,
//           "relations": [
//             "counter"
//           ]
//         }
//       ],
//       "args": []
//     },
//     {
//       "name": "initConfig",
//       "discriminator": [
//         23,
//         235,
//         115,
//         232,
//         168,
//         96,
//         1,
//         231
//       ],
//       "accounts": [
//         {
//           "name": "config",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   110,
//                   102,
//                   105,
//                   103
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           "name": "admin",
//           "writable": true,
//           "signer": true
//         },
//         {
//           "name": "systemProgram",
//           "address": "11111111111111111111111111111111"
//         }
//       ],
//       "args": []
//     },
//     {
//       "name": "initCounter",
//       "discriminator": [
//         247,
//         168,
//         146,
//         45,
//         125,
//         26,
//         142,
//         80
//       ],
//       "accounts": [
//         {
//           "name": "config",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   110,
//                   102,
//                   105,
//                   103
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           "name": "counter",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   117,
//                   110,
//                   116,
//                   101,
//                   114
//                 ]
//               },
//               {
//                 "kind": "account",
//                 "path": "user"
//               }
//             ]
//           }
//         },
//         {
//           "name": "user",
//           "writable": true,
//           "signer": true
//         },
//         {
//           "name": "systemProgram",
//           "address": "11111111111111111111111111111111"
//         }
//       ],
//       "args": []
//     },
//     {
//       "name": "setPaused",
//       "discriminator": [
//         91,
//         60,
//         125,
//         192,
//         176,
//         225,
//         166,
//         218
//       ],
//       "accounts": [
//         {
//           "name": "config",
//           "writable": true,
//           "pda": {
//             "seeds": [
//               {
//                 "kind": "const",
//                 "value": [
//                   99,
//                   111,
//                   110,
//                   102,
//                   105,
//                   103
//                 ]
//               }
//             ]
//           }
//         },
//         {
//           "name": "admin",
//           "signer": true,
//           "relations": [
//             "config"
//           ]
//         }
//       ],
//       "args": [
//         {
//           "name": "paused",
//           "type": "bool"
//         }
//       ]
//     }
//   ],
//   "accounts": [
//     {
//       "name": "config",
//       "discriminator": [
//         155,
//         12,
//         170,
//         224,
//         30,
//         250,
//         204,
//         130
//       ]
//     },
//     {
//       "name": "counter",
//       "discriminator": [
//         255,
//         176,
//         4,
//         245,
//         188,
//         253,
//         124,
//         25
//       ]
//     }
//   ],
//   "errors": [
//     {
//       "code": 6000,
//       "name": "overflow",
//       "msg": "counter overflow"
//     },
//     {
//       "code": 6001,
//       "name": "paused",
//       "msg": "Increments are currently paused"
//     }
//   ],
//   "types": [
//     {
//       "name": "config",
//       "type": {
//         "kind": "struct",
//         "fields": [
//           {
//             "name": "admin",
//             "type": "pubkey"
//           },
//           {
//             "name": "paused",
//             "type": "bool"
//           },
//           {
//             "name": "totalCounters",
//             "type": "u64"
//           },
//           {
//             "name": "bump",
//             "type": "u8"
//           }
//         ]
//       }
//     },
//     {
//       "name": "counter",
//       "type": {
//         "kind": "struct",
//         "fields": [
//           {
//             "name": "user",
//             "type": "pubkey"
//           },
//           {
//             "name": "count",
//             "type": "u64"
//           },
//           {
//             "name": "bump",
//             "type": "u8"
//           }
//         ]
//       }
//     }
//   ]
// };

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as anchor.Program<Counter>;
  const walletA = provider.wallet.publicKey;
  const walletB = Keypair.generate();

  console.log("Program ID:", program.programId.toBase58());
  console.log("Wallet A:  ", walletA.toBase58());
  console.log("Wallet B:  ", walletB.publicKey.toBase58());

  // Fund walletB and init its counter so its PDA actually holds data on chain.
  const sig = await provider.connection.requestAirdrop(
    walletB.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  const latest = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction(
    { signature: sig, ...latest },
    "confirmed"
  );
  await program.methods
    .initCounter()
    .accounts({ user: walletB.publicKey })
    .signers([walletB])
    .rpc();

  // Derive the per-user counter PDA for each wallet
  const [pdaA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), walletA.toBuffer()],
    program.programId
  );
  const [pdaB] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), walletB.publicKey.toBuffer()],
    program.programId
  );

  console.log("\nPer-user counter PDAs");
  console.log("  Wallet A PDA:", pdaA.toBase58());
  console.log("  Wallet B PDA:", pdaB.toBase58());
  console.log("  Same address?", pdaA.equals(pdaB));

  // Derive a hypothetical “global counter” PDA using only the static seed
  const [pdaGlobalFromA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );
  const [pdaGlobalFromB] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );

  console.log("\nGlobal counter PDA (no wallet in seeds)");
  console.log("  Derived from A's perspective:", pdaGlobalFromA.toBase58());
  console.log("  Derived from B's perspective:", pdaGlobalFromB.toBase58());
  console.log("  Same address?", pdaGlobalFromA.equals(pdaGlobalFromB));

  // Test a few near-misses
  const variants: [string, Buffer[]][] = [
    ['["counter", walletA]',     [Buffer.from("counter"),   walletA.toBuffer()]],
    ['["counters", walletA]',    [Buffer.from("counters"),  walletA.toBuffer()]],
    ['["counter\\0", walletA]',  [Buffer.from("counter\0"), walletA.toBuffer()]],
    ['["Counter", walletA]',     [Buffer.from("Counter"),   walletA.toBuffer()]],
  ];

  console.log("\nNear-miss seed variants");
  for (const [label, seeds] of variants) {
    const [pda] = PublicKey.findProgramAddressSync(seeds, program.programId);
    console.log(`  ${label.padEnd(28)} -> ${pda.toBase58()}`);
  }

  // Runtime check: Try to spoof a PDA
  console.log("\nAttempting to spoof a PDA...");
  try {
    await program.methods
      .increment()
      .accounts({
        counter: pdaB,
        user: walletA,
      })
      .rpc();
    console.log("  Spoof succeeded (this should NOT happen)");
  } catch (err) {
    console.log("  Spoof rejected:", (err as Error).message.split("\n")[0]);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});