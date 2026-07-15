import { createSolanaRpc, devnet, address } from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const addressInput = document.getElementById("addressInput") as HTMLInputElement;
const fetchBtn = document.getElementById("fetchBtn") as HTMLButtonElement;
const resultsDiv = document.getElementById("results") as HTMLDivElement;
const errorDiv = document.getElementById("error") as HTMLDivElement;
const loadingDiv = document.getElementById("loading") as HTMLDivElement;

fetchBtn.addEventListener("click", async () => {
  errorDiv.textContent = "";
  resultsDiv.innerHTML = "";
  loadingDiv.textContent = "Fetching...";

  try {
    const targetAddress = address(addressInput.value.trim());

    // Fetch balance (same as Day 8)
    const { value: balanceInLamports } = await rpc
      .getBalance(targetAddress)
      .send();
    const balanceInSol = Number(balanceInLamports) / 1_000_000_000;

    // Fetch recent transactions (same as Day 9)
    const signatures = await rpc
      .getSignaturesForAddress(targetAddress, { limit: 5 })
      .send();

    // Render balance
    let html = `<div class="balance">${balanceInSol} SOL</div>`;
    html += `<h3>Recent transactions</h3>`;

    if (signatures.length === 0) {
      html += `<p>No transactions found for this address.</p>`;
    }

    // Render transactions
    for (const tx of signatures) {
      const time = tx.blockTime
        ? new Date(Number(tx.blockTime) * 1000).toLocaleString()
        : "unknown";
      const statusClass = tx.err ? "status failed" : "status";
      const statusText = tx.err ? "Failed" : "Success";

      html += `
        <div class="tx">
          <div><strong>Signature:</strong> ${tx.signature}</div>
          <div><strong>Slot:</strong> ${tx.slot}</div>
          <div><strong>Time:</strong> ${time}</div>
          <div class="${statusClass}"><strong>Status:</strong> ${statusText}</div>
        </div>
      `;
    }

    resultsDiv.innerHTML = html;
  } catch (err: unknown) {
    errorDiv.textContent = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
  } finally {
    loadingDiv.textContent = "";
  }
});