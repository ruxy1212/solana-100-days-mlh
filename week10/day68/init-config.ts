import * as anchor from "@anchor-lang/core";
import { Counter } from "./counter";

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Counter as anchor.Program<Counter>;
  await program.methods.initConfig().rpc();
  console.log("config initialized");
})();