import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { TrustLedger } from "../target/types/trust_ledger";

describe("trust-ledger", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TrustLedger as Program<TrustLedger>;

  const client = (provider.wallet as anchor.Wallet).payer;
  const freelancer = anchor.web3.Keypair.generate();
  const stranger = anchor.web3.Keypair.generate();

  // Helper: airdrop SOL and confirm
  async function fundWallet(pubkey: anchor.web3.PublicKey, amountSol: number = 2) {
    const signature = await provider.connection.requestAirdrop(
      pubkey,
      amountSol * anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ signature, ...latestBlockhash });
  }

  // Helper: derive contract + vault PDAs
  function deriveContractPdas(clientPk: anchor.web3.PublicKey, freelancerPk: anchor.web3.PublicKey, contractId: anchor.BN) {
    const [contractPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("contract"),
        clientPk.toBuffer(),
        freelancerPk.toBuffer(),
        contractId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), contractPda.toBuffer()],
      program.programId
    );
    return { contractPda, vaultPda };
  }

  before(async () => {
    await fundWallet(freelancer.publicKey);
    await fundWallet(stranger.publicKey);
  });

  const contractId = new anchor.BN(Math.floor(Math.random() * 1_000_000));
  let contractPda: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;
  let reputationPda: anchor.web3.PublicKey;

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it("1. creates a profile for the freelancer", async () => {
    const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), freelancer.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createProfile("Alice Freelancer")
      .accounts({
        profile: profilePda,
        freelancer: freelancer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([freelancer])
      .rpc();

    const profile = await program.account.freelancerProfile.fetch(profilePda);
    assert.equal(profile.displayName, "Alice Freelancer");
    assert.equal(profile.freelancer.toBase58(), freelancer.publicKey.toBase58());
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it("2. creates a contract and locks funds in vault", async () => {
    ({ contractPda, vaultPda } = deriveContractPdas(client.publicKey, freelancer.publicKey, contractId));

    const amount = new anchor.BN(1.5 * anchor.web3.LAMPORTS_PER_SOL);
    const milestoneCount = 3; // 1.5 SOL / 3 = 0.5 SOL each, remainder = 0

    const vaultPreBalance = await provider.connection.getBalance(vaultPda);

    await program.methods
      .createContract(contractId, amount, milestoneCount)
      .accounts({
        contract: contractPda,
        vault: vaultPda,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const vaultPostBalance = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultPostBalance - vaultPreBalance, amount.toNumber(), "Vault should hold the full amount");

    const contractAcc = await program.account.contract.fetch(contractPda);
    assert.equal(contractAcc.client.toBase58(), client.publicKey.toBase58());
    assert.equal(contractAcc.freelancer.toBase58(), freelancer.publicKey.toBase58());
    assert.equal(contractAcc.amount.toString(), amount.toString());
    assert.equal(contractAcc.milestoneCount, milestoneCount);
    assert.deepEqual(contractAcc.milestones, [
      { notSubmitted: {} },
      { notSubmitted: {} },
      { notSubmitted: {} },
    ]);
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it("3. freelancer submits, client approves, funds release", async () => {
    [reputationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reputation"), freelancer.publicKey.toBuffer()],
      program.programId
    );

    const freelancerPreBalance = await provider.connection.getBalance(freelancer.publicKey);

    await program.methods
      .submitMilestone(0)
      .accounts({
        contract: contractPda,
        freelancer: freelancer.publicKey,
      } as any)
      .signers([freelancer])
      .rpc();

    let contractAcc = await program.account.contract.fetch(contractPda);
    assert.deepEqual(contractAcc.milestones[0], { submitted: {} });

    await program.methods
      .approveMilestone(0)
      .accounts({
        contract: contractPda,
        vault: vaultPda,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        reputation: reputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    contractAcc = await program.account.contract.fetch(contractPda);
    assert.deepEqual(contractAcc.milestones[0], { approved: {} });

    const freelancerPostBalance = await provider.connection.getBalance(freelancer.publicKey);
    // base_payout = 1.5 SOL / 3 = 0.5 SOL (lamports: 500_000_000)
    assert.approximately(
      freelancerPostBalance - freelancerPreBalance,
      0.5 * anchor.web3.LAMPORTS_PER_SOL,
      0.01 * anchor.web3.LAMPORTS_PER_SOL
    );

    const reputation = await program.account.reputationRecord.fetch(reputationPda);
    assert.equal(reputation.completedCount, 1, "completed_count should be 1 after first approval");
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it("4. wrong wallet cannot approve a milestone", async () => {
    // Submit milestone 1 first so it is in Submitted state
    await program.methods
      .submitMilestone(1)
      .accounts({
        contract: contractPda,
        freelancer: freelancer.publicKey,
      } as any)
      .signers([freelancer])
      .rpc();

    try {
      await program.methods
        .approveMilestone(1)
        .accounts({
          contract: contractPda,
          vault: vaultPda,
          client: stranger.publicKey,  // ← wrong signer
          freelancer: freelancer.publicKey,
          reputation: reputationPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([stranger])
        .rpc();
      assert.fail("Should have failed with Unauthorized");
    } catch (err: any) {
      assert.include(err.message, "Unauthorized");
    }
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it("5. client rejects a submission with a reason", async () => {
    // milestone 1 is still Submitted from test 4's setup
    await program.methods
      .rejectMilestone(1, "Incorrect file formatting")
      .accounts({
        contract: contractPda,
        client: client.publicKey,
      } as any)
      .rpc();

    const contractAcc = await program.account.contract.fetch(contractPda);
    assert.deepEqual(contractAcc.milestones[1], { rejected: {} });
    assert.equal(contractAcc.rejectionReasons[1], "Incorrect file formatting");
    // completed_count must still be 1 (only the first milestone was approved so far)
    const reputation = await program.account.reputationRecord.fetch(reputationPda);
    assert.equal(reputation.completedCount, 1);
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it("6. freelancer resubmits after rejection and client approves", async () => {
    await program.methods
      .submitMilestone(1)
      .accounts({
        contract: contractPda,
        freelancer: freelancer.publicKey,
      } as any)
      .signers([freelancer])
      .rpc();

    await program.methods
      .approveMilestone(1)
      .accounts({
        contract: contractPda,
        vault: vaultPda,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        reputation: reputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const contractAcc = await program.account.contract.fetch(contractPda);
    assert.deepEqual(contractAcc.milestones[1], { approved: {} });

    const reputation = await program.account.reputationRecord.fetch(reputationPda);
    assert.equal(reputation.completedCount, 2);
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it("7. cannot approve a milestone twice", async () => {
    try {
      await program.methods
        .approveMilestone(1)  // milestone 1 is already Approved
        .accounts({
          contract: contractPda,
          vault: vaultPda,
          client: client.publicKey,
          freelancer: freelancer.publicKey,
          reputation: reputationPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.include(err.message, "MilestoneNotSubmitted");
    }
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it("8. freelancer raises a dispute after rejection", async () => {
    // Submit and reject milestone 2
    await program.methods
      .submitMilestone(2)
      .accounts({
        contract: contractPda,
        freelancer: freelancer.publicKey,
      } as any)
      .signers([freelancer])
      .rpc();

    await program.methods
      .rejectMilestone(2, "Sub-par final code quality")
      .accounts({
        contract: contractPda,
        client: client.publicKey,
      } as any)
      .rpc();

    // Freelancer raises dispute
    await program.methods
      .raiseDispute(2)
      .accounts({
        contract: contractPda,
        freelancer: freelancer.publicKey,
        reputation: reputationPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([freelancer])
      .rpc();

    const contractAcc = await program.account.contract.fetch(contractPda);
    assert.deepEqual(contractAcc.milestones[2], { disputed: {} });

    const reputation = await program.account.reputationRecord.fetch(reputationPda);
    assert.equal(reputation.disputedCount, 1);
  });

  // ── Test 9 ──────────────────────────────────────────────────────────────────
  it("9. disputed milestone cannot be approved or rejected", async () => {
    // Try to approve the now-Disputed milestone 2 — should get MilestoneDisputed
    try {
      await program.methods
        .approveMilestone(2)
        .accounts({
          contract: contractPda,
          vault: vaultPda,
          client: client.publicKey,
          freelancer: freelancer.publicKey,
          reputation: reputationPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.include(err.message, "MilestoneDisputed");
    }

    // Try to reject the Disputed milestone — should also get MilestoneDisputed
    try {
      await program.methods
        .rejectMilestone(2, "Still bad")
        .accounts({
          contract: contractPda,
          client: client.publicKey,
        } as any)
        .rpc();
      assert.fail("Should have failed");
    } catch (err: any) {
      assert.include(err.message, "MilestoneDisputed");
    }
  });

  // ── Test 10 ─────────────────────────────────────────────────────────────────
  it("10. contract works without a profile (optionality test)", async () => {
    // stranger has no profile — client creates a contract with them directly
    const optId = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    const { contractPda: optContract, vaultPda: optVault } = deriveContractPdas(
      client.publicKey, stranger.publicKey, optId
    );

    await program.methods
      .createContract(optId, new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL), 1)
      .accounts({
        contract: optContract,
        vault: optVault,
        client: client.publicKey,
        freelancer: stranger.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const acc = await program.account.contract.fetch(optContract);
    assert.equal(acc.freelancer.toBase58(), stranger.publicKey.toBase58());
  });

  // ── Test 11 ─────────────────────────────────────────────────────────────────
  it("11. completed_count increments across separate contracts for the same freelancer", async () => {
    // Create a second contract for the same freelancer (contractId2 is different)
    const contractId2 = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    const { contractPda: contract2, vaultPda: vault2 } = deriveContractPdas(
      client.publicKey, freelancer.publicKey, contractId2
    );

    const amount2 = new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL);

    await program.methods
      .createContract(contractId2, amount2, 1)
      .accounts({
        contract: contract2,
        vault: vault2,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    await program.methods
      .submitMilestone(0)
      .accounts({
        contract: contract2,
        freelancer: freelancer.publicKey,
      } as any)
      .signers([freelancer])
      .rpc();

    await program.methods
      .approveMilestone(0)
      .accounts({
        contract: contract2,
        vault: vault2,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        reputation: reputationPda,   // same ReputationRecord as before
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    // completed_count was 2 after test 6; now it should be 3
    const reputation = await program.account.reputationRecord.fetch(reputationPda);
    assert.equal(reputation.completedCount, 3, "completedCount should accumulate across contracts");
  });

  // ── Test 12 ─────────────────────────────────────────────────────────────────
  it("12. vault empties exactly when amount does not divide evenly", async () => {
    // 7 lamports across 3 milestones: base_payout=2, remainder=1
    // milestone 0 → 2, milestone 1 → 2, milestone 2 → 2+1=3 → total = 7
    const contractId3 = new anchor.BN(Math.floor(Math.random() * 1_000_000));
    const { contractPda: contract3, vaultPda: vault3 } = deriveContractPdas(
      client.publicKey, freelancer.publicKey, contractId3
    );
    // Use enough SOL to cover rent + small amount. Anchor requires the vault to pay
    // its own rent, so we send enough to cover rent + 7 lamports worth of escrow.
    // We test the math by reading vault balance before and after each approval.
    const SEVEN = new anchor.BN(7);
    const MS_COUNT = 3;

    await program.methods
      .createContract(contractId3, SEVEN, MS_COUNT)
      .accounts({
        contract: contract3,
        vault: vault3,
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const contractAcc = await program.account.contract.fetch(contract3);
    assert.equal(contractAcc.basePayout.toNumber(), 2, "base_payout = 7 / 3 = 2");
    assert.equal(contractAcc.remainder.toNumber(), 1, "remainder = 7 % 3 = 1");

    // Approve all 3 milestones and track vault balance
    for (let i = 0; i < MS_COUNT; i++) {
      await program.methods
        .submitMilestone(i)
        .accounts({ contract: contract3, freelancer: freelancer.publicKey } as any)
        .signers([freelancer])
        .rpc();

      await program.methods
        .approveMilestone(i)
        .accounts({
          contract: contract3,
          vault: vault3,
          client: client.publicKey,
          freelancer: freelancer.publicKey,
          reputation: reputationPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
    }

    // After all milestones approved the vault's escrow portion must be exactly 0.
    // The vault SystemAccount will still hold its minimum rent exemption balance,
    // so we compare the excess lamports (vaultBalance - rentExemptMin) to 0.
    const vaultBalance = await provider.connection.getBalance(vault3);
    const rentMin = await provider.connection.getMinimumBalanceForRentExemption(0);
    assert.equal(
      vaultBalance - rentMin,
      0,
      "Vault escrow portion should be exactly 0 after all approvals (remainder paid on last milestone)"
    );
  });
});

