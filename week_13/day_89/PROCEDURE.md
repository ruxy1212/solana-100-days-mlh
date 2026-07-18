# Classifying and Handling Wallet Transaction Errors

This procedure describes how to implement user-friendly error classification and reporting in the React frontend workspace when transactions fail due to user cancellation, low funds, or network conditions.

The implementation files are located at [walletErrors.ts](../../my-frontend/src/walletErrors.ts) and the frontend is at [my-frontend](../../my-frontend).

## Steps:

### Step 1: Create the Pure Error Classifier
- Write a classifier helper file in [walletErrors.ts](../../my-frontend/src/walletErrors.ts) to classify errors into human-readable messages:
  ```typescript
  import { isSolanaError, SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED } from "@solana/kit";

  export type WalletErrorInfo = {
    kind: string;
    title: string;
    message: string;
    retryable: boolean;
    severity: "info" | "warning" | "error" | "success";
  };

  export function classifyWalletError(error: unknown): WalletErrorInfo {
    // 1. User Rejection
    if (isUserRejection(error)) {
      return {
        kind: "user-rejected",
        title: "Transaction cancelled",
        message: "You closed the wallet before approving. Nothing was sent.",
        retryable: true,
        severity: "info",
      };
    }
    // 2. Blockhash Expiry
    if (unwrap(error).some((e) => isSolanaError(e, SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED))) {
      return {
        kind: "blockhash-expired",
        title: "Transaction expired",
        message: "It took too long to confirm. Try again to send it with a fresh blockhash.",
        retryable: true,
        severity: "warning",
      };
    }
    // 3. Insufficient Funds
    if (/insufficient (lamports|funds)/i.test(messageOf(error))) {
      return {
        kind: "insufficient-funds",
        title: "Not enough SOL",
        message: "This account does not have enough SOL to cover the amount plus the network fee.",
        retryable: false,
        severity: "error",
      };
    }
    // 4. Wallet Locked or Disconnected
    if (/not connected|disconnected|no .* account/i.test(messageOf(error))) {
      return {
        kind: "wallet-disconnected",
        title: "Wallet not connected",
        message: "Your wallet is disconnected or locked. Please unlock it and try again.",
        retryable: true,
        severity: "warning",
      };
    }
    // 5. Fallback for Unknown errors
    return {
      kind: "unknown",
      title: "Something went wrong",
      message: messageOf(error) || "An unexpected error occurred. Please try again.",
      retryable: true,
      severity: "error",
    };
  }
  ```

### Step 2: Wire the Classifier into the React Send Handler
- In [App.tsx](../../my-frontend/src/App.tsx), set up state to store the classified status:
  ```typescript
  const [sendStatus, setSendStatus] = useState<WalletErrorInfo | null>(null);
  ```
- Wrap the transfer instruction call in a `try...catch` block:
  ```typescript
  async function handleSend() {
    setSendStatus(null);
    try {
      const signature = await send({ amount: 1_000_000n, destination });
      setSendStatus({
        kind: "success",
        severity: "success",
        title: "Sent",
        message: `Confirmed: ${signature}`,
        retryable: false,
      });
    } catch (error) {
      const info = classifyWalletError(error);
      console.error(`[wallet:${info.kind}]`, error);
      setSendStatus(info);
    }
  }
  ```

### Step 3: Render status messages to the User
- Add a status block in the JSX underneath your button:
  ```tsx
  {sendStatus && (
    <div className={`status status--${sendStatus.severity}`} role="status">
      <strong>{sendStatus.title}</strong>
      <p>{sendStatus.message}</p>
      {sendStatus.retryable && sendStatus.severity !== "success" && (
        <button onClick={handleSend}>Try again</button>
      )}
    </div>
  )}
  ```

### Step 4: Run Failure Experiments
- **Experiment 1 (User Rejection):** Trigger a transfer and click "Cancel" or close the extension popup. Verify that the UI displays a calm "Transaction cancelled" message.
- **Experiment 2 (Insufficient Funds):** Attempt to transfer an amount larger than your wallet balance. Confirm that a "Not enough SOL" error is classified.
- **Experiment 3 (Disconnected Wallet):** Lock or disconnect your wallet extension and hit send. Verify that the new "Wallet not connected" handler catches the condition correctly.
