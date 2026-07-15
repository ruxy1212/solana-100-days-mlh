import * as anchor from "@anchor-lang/core";
import { Program, web3 } from "@anchor-lang/core";
import { assert } from "chai";
import { Counter } from "../target/types/counter";
import { ComposeLab } from "../target/types/compose_lab";

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