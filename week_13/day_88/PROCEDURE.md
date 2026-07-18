# Creating a Frontend Client with Wallet Standard

This procedure walks through connecting a React frontend to your Solana workspace using the Wallet Standard, tracking devnet balances, and executing transfers.

The source code for this frontend is located in [my-frontend](../../my-frontend).

## Steps:

### Step 1: Scaffold the DApp
- Generate a new React + Vite project using the Solana Foundation templates:
  - `npx create-solana-dapp@latest my-frontend`
- During setup, select the **Kit Framework** group and the **react-vite** template.
- Navigate to the frontend directory and install dependencies:
  - `cd my-frontend`
  - `npm install`

### Step 2: Configure Provider Cluster
- Ensure the Solana RPC provider in [providers.tsx](../../my-frontend/src/providers.tsx) is set to target devnet:
  ```typescript
  // src/providers.tsx
  const endpoint = "https://api.devnet.solana.com";
  ```
- Switch your browser wallet extension (e.g., Phantom or Solflare) to **Devnet** mode to prevent network mismatches.

### Step 3: Implement Balance Readouts
- Import the hooks in [App.tsx](../../my-frontend/src/App.tsx):
  ```typescript
  import { useBalance } from '@solana/react-hooks';
  ```
- Invoke the balance tracker inside the `App` component using the active wallet's address:
  ```typescript
  const { lamports } = useBalance(wallet?.account.address);
  ```
- Render the formatted balance in your JSX:
  ```tsx
  <span>{lamports != null ? `${Number(lamports) / 1e9} SOL` : '—'}</span>
  ```

### Step 4: Implement Transfer Flows
- Import the `useSolTransfer` hook in [App.tsx](../../my-frontend/src/App.tsx):
  ```typescript
  import { useSolTransfer } from '@solana/react-hooks';
  ```
- Add state to track the destination address and invoke the transfer hook:
  ```typescript
  const { send, isSending } = useSolTransfer();
  const [destination, setDestination] = useState('');
  ```
- Add the input field and trigger button to the UI:
  ```tsx
  <input
    value={destination}
    onChange={(e) => setDestination(e.target.value)}
    placeholder="Recipient address"
  />
  <button
    onClick={() => send({ amount: 1_000_000n, destination })}
    disabled={isSending || !destination}
  >
    {isSending ? 'Sending…' : 'Send 0.001 SOL'}
  </button>
  ```
