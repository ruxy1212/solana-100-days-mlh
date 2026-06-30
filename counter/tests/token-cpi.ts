import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
// import { TokenCpi } from "../target/types/token_cpi";
import { strict as assert } from "assert";
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";

export type TokenCpi = {
  "address": "EcFqW9ZeahZg4Hy5F4MM1KGuJKz2STirBRBNbjAKcm3j",
  "metadata": {
    "name": "tokenCpi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "mintTokens",
      "discriminator": [
        59,
        132,
        24,
        246,
        122,
        39,
        8,
        243
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
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

const { BN } = anchor.default;

describe("token_cpi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenCpi as Program<TokenCpi>;

  it("mints Token-2022 tokens through the program", async () => {
    const payer = (provider.wallet as anchor.Wallet).payer;
    const connection = provider.connection;

    // 1. Create a Token-2022 mint. Your wallet is the mint authority.
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey, // mint authority
      null,            // no freeze authority
      9,               // decimals
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    // 2. Create the destination token account your wallet owns.
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    // 3. Ask YOUR program to mint. It runs the mint_to CPI for you.
    const amount = new BN(1_000_000_000); // 1 whole token at 9 decimals
    await program.methods
      .mintTokens(amount)
      .accountsPartial({
        signer: payer.publicKey,
        mint,
        tokenAccount: ata.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    // 4. Read the balance straight from the chain.
    const account = await getAccount(connection, ata.address, undefined, TOKEN_2022_PROGRAM_ID);
    console.log("Minted base units:", account.amount.toString());
    assert.equal(account.amount.toString(), amount.toString());
  });
});