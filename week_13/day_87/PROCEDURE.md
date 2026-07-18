# Publishing the IDL On-Chain and Generating a Codama Client

This procedure details publishing an Anchor program's Interface Definition Language (IDL) on-chain and generating a typed TypeScript client using Codama.

## Steps:

### Step 0: Get Program ID
- Go to the vault program at `counter/programs/vault/src/lib.rs` and copy the `declare_id`
- Save the program ID to terminal session: `echo VAULT=<program_id>`

### Step 1: Rebuild and Generate the IDL
- Compile the Anchor program to update the IDL file located at `target/idl/vault.json`:
  - `anchor build`

### Step 2: Publish the IDL On-Chain
- Check that the program is active on devnet:
  - `solana program show $VAULT --url devnet`
- Initialize and publish the IDL to the blockchain:
  - `anchor idl init -f target/idl/vault.json $VAULT --provider.cluster "https://devnet.helius-rpc.com/?api-key=YOUR_KEY"`

### Step 3: Fetch and Verify the IDL
- Pull the published IDL back from the blockchain to verify it matches your local copy:
  - `anchor idl fetch $VAULT --provider.cluster "https://devnet.helius-rpc.com/?api-key=YOUR_KEY" -o fetched-idl.json`

### Step 4: Configure Codama Code Generator
- Install Codama and its JavaScript/TypeScript SDK renderer:
  - `yarn add -D codama @codama/renderers-js`
- Create a `codama.json` configuration file in the project root:
  ```json
  {
    "idl": "target/idl/vault.json",
    "scripts": {
      "js": {
        "from": "@codama/renderers-js",
        "args": ["clients/js/src/generated"]
      }
    }
  }
  ```

### Step 5: Run Code Generation
- Execute the Codama code generator script from the anchor workspace (`/counter`):
  - `npx codama run js`
- This builds your typed client inside `counter/clients/js/src/generated/` including subdirectories for accounts, errors, instructions, and programs.
- Observe the structure of the generated program, like the programs, pds, instructions and accounts.
