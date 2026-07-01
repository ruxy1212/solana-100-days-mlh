import * as anchor from "@anchor-lang/core";
import { Program, web3 } from "@anchor-lang/core";
import { assert } from "chai";
// import { Counter } from "../target/types/counter";
// import { ComposeLab } from "../target/types/compose_lab";

type ComposeLab = {
  "address": "EcFqW9ZeahZg4Hy5F4MM1KGuJKz2STirBRBNbjAKcm3j",
  "metadata": {
    "name": "composeLab",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "bump",
      "discriminator": [
        102,
        163,
        91,
        221,
        146,
        88,
        184,
        142
      ],
      "accounts": [
        {
          "name": "tally",
          "writable": true
        },
        {
          "name": "counterProgram",
          "address": "9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7"
        }
      ],
      "args": []
    }
  ],
  "types": [
    {
      "name": "tally",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

type Counter = {
  "address": "9zEKwVUB5iWrzw8St3cd6tyz4FS64JaaJt3cShXaT1W7",
  "metadata": {
    "name": "counter",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "increment",
      "discriminator": [
        11,
        18,
        104,
        9,
        104,
        174,
        59,
        33
      ],
      "accounts": [
        {
          "name": "tally",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "tally",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "tally",
      "discriminator": [
        126,
        11,
        29,
        33,
        32,
        101,
        239,
        25
      ]
    }
  ],
  "types": [
    {
      "name": "tally",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

const { Keypair, SystemProgram } = web3;

describe("compose-lab", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const counter = anchor.workspace.Counter as Program<Counter>;
  const caller = anchor.workspace.ComposeLab as Program<ComposeLab>;
  const tally = Keypair.generate();

  it("the caller bumps the counter through a CPI", async () => {
    await counter.methods
      .initialize()
      .accounts({
        tally: tally.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([tally])
      .rpc();

    await caller.methods
      .bump()
      .accounts({
        tally: tally.publicKey,
        counterProgram: counter.programId,
      })
      .rpc();

    const state = await counter.account.tally.fetch(tally.publicKey);
    assert.equal(state.count.toNumber(), 1);
    console.log("counter value set by the caller:", state.count.toNumber());
  });

  it("bumps it a second time (increase counter to 2)", async () => {
    // We don't initialize again; we just call bump on the SAME tally account
    await caller.methods
      .bump()
      .accounts({
        tally: tally.publicKey,
        counterProgram: counter.programId
      })
      .rpc();

    const state = await counter.account.tally.fetch(tally.publicKey);
    
    // This will now be 2. If you left this as assert.equal(..., 1), it would fail!
    assert.equal(state.count.toNumber(), 2);
    console.log("counter value set by the caller:", state.count.toNumber());
  });
});