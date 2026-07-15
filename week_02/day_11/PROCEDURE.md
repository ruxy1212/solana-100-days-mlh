# Compare accounts vs databases

## Steps:

### Step 1: Inspect your own wallet account

- Get your wallet's public key: `solana address`
- Inspect your account data: `solana account $(solana address)`
> In a traditional database, this is your "row." On Solana, this account lives on a global ledger maintained by validators rather than a private server.
- Note the `Owner` (System Program), `Data Length` (0 bytes for a basic wallet), and `Executable` (false) fields.

### Step 2: Inspect a program account

- Inspect the SPL Token Program: `solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Observe that `executable` is `true` and the owner is the `BPF Loader`.
> Unlike Web2 where code (binary) and data (database) live in separate systems, Solana treats both as accounts within the same model.



### Step 3: Build your comparison table

- Mapping Web2 database knowledge to Solana's architecture:

| Concept | Web2 | Solana |
| :--- | :--- | :--- |
| **Data Storage** | MySQL/PostgreSQL rows or MongoDB docs | A "flat" byte array in an Account |
| **Logic vs. State** | Your Laravel/Node code is the logic; the DB is the state | Both are Accounts; logic is just an account with `executable: true` |
| **Primary Keys** | Auto-increment IDs or UUIDs (e.g., `user_id: 101`) | Base58 Public Keys (32 bytes) or PDAs |
| **Security/Auth** | Middleware checks (e.g., `$request->user()`) | The Runtime checks: only the "Owner" program can write |
| **Filtering/Joins** | `SELECT * FROM table WHERE...` (Server-side) | No Joins. You fetch the account by address or filter off-chain via RPC |
| **Infrastructure** | AWS/DigitalOcean monthly bills | "Rent": A lamport deposit you get back when you `close()` the account |
| **Deployment** | CI/CD pushes code to a server | Deploying a Program creates an account owned by the BPF Loader |

### Step 4: Check the rent-exempt cost

- Calculate the deposit required for different data sizes:
  - `solana rent 0` (A basic account)
  - `solana rent 100` (Small data storage)
  - `solana rent 1000` (Larger data storage)
> Storage costs on Solana are explicit. You "lock" SOL to keep the account alive, which is reclaimed when the account is closed.

### Step 5: Visualizing the State

- Open the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) and search for your wallet address.
- Compare the visual transaction history to a database audit log.
- **The Core Shift:** In a database, you query for data. On Solana, programs receive accounts as inputs. There are no native "JOIN" operations; you must organize your data strategy off-chain via RPC.