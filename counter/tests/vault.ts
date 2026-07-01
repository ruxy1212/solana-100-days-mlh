import * as anchor from "@anchor-lang/core";
import { Program, web3 } from "@anchor-lang/core";
// import { Vault } from "../target/types/vault";
import { assert } from "chai";

type Vault = {
  "address": "9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7",
  "metadata": {
    "name": "vault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ]
};

const { PublicKey, SystemProgram, LAMPORTS_PER_SOL } = web3;
const { BN } = anchor.default;

describe("vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vault as Program<Vault>;
  const user = provider.wallet.publicKey;

  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), user.toBuffer()],
    program.programId
  );

  it("deposits, then the program signs to withdraw", async () => {
    const amount = new BN(0.5 * LAMPORTS_PER_SOL);

    await program.methods
      .deposit(amount)
      .accountsPartial({ user, vault, systemProgram: SystemProgram.programId })
      .rpc();

    console.log("vault after deposit:", await provider.connection.getBalance(vault));

    await program.methods
      .withdraw(amount)
      .accountsPartial({ user, vault, systemProgram: SystemProgram.programId })
      .rpc();

    const finalBalance = await provider.connection.getBalance(vault);
    console.log("vault after withdraw:", finalBalance);
    assert.equal(finalBalance, 0);
  });
});
