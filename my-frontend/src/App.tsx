import { useState } from 'react';
import { useBalance, useSolTransfer, useWalletConnection } from "@solana/react-hooks";
import { classifyWalletError, type WalletErrorInfo } from "./walletErrors";

export default function App() {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState<number>(0.001);
  const [sendStatus, setSendStatus] = useState<WalletErrorInfo | null>(null);

  const { send, isSending } = useSolTransfer();
  const { connectors, connect, disconnect, wallet, status } =
    useWalletConnection();
  const { lamports } = useBalance(wallet?.account.address);
  const address = wallet?.account.address.toString();

  async function handleSend() {
    if (!amount) {
      setSendStatus({
        kind: "error",
        severity: "warning",
        title: "Invalid Input",
        message: `Enter a valid amount (SOL) to send.`,
        retryable: false,
      });
      return;
    }
    setSendStatus(null);
    try {
      const lamport_amount = BigInt(Math.round(amount * 1_000_000_000));
      const signature = await send({ amount: lamport_amount, destination });
      setSendStatus({
        kind: "success",
        severity: "success",
        title: "Sent",
        message: `Confirmed: ${signature}`,
        retryable: false,
      });
    } catch (error) {
      const info = classifyWalletError(error);
      console.error(`[wallet:${info.kind}]`, error); // full detail, for you
      setSendStatus(info);                           // friendly detail, for them
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg1 text-foreground">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col gap-10 border-x border-border-low px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">
            Solana starter kit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Ship a Solana dapp fast
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted">
            Drop in <code className="font-mono">@solana/react-hooks</code>, wrap
            your tree once, and you get wallet connect/disconnect plus
            ready-to-use hooks for balances and transactions—no manual RPC
            wiring.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span
                className="mt-1.5 h-2 w-2 rounded-full bg-foreground/60"
                aria-hidden
              />
              <div>
                <a
                  className="font-medium underline underline-offset-2"
                  href="https://solana.com/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  Solana docs
                </a>{" "}
                — core concepts, RPC, programs, and client patterns.
              </div>
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1.5 h-2 w-2 rounded-full bg-foreground/60"
                aria-hidden
              />
              <div>
                <a
                  className="font-medium underline underline-offset-2"
                  href="https://www.anchor-lang.com/docs/introduction"
                  target="_blank"
                  rel="noreferrer"
                >
                  Anchor docs
                </a>{" "}
                — build and test programs with IDL, macros, and type-safe
                clients.
              </div>
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1.5 h-2 w-2 rounded-full bg-foreground/60"
                aria-hidden
              />
              <div>
                <a
                  className="font-medium underline underline-offset-2"
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Solana faucet (devnet)
                </a>{" "}
                — grab free devnet SOL to try transfers and transactions.
              </div>
            </li>
            <li className="flex gap-2">
              <span
                className="mt-1.5 h-2 w-2 rounded-full bg-foreground/60"
                aria-hidden
              />
              <div>
                <a
                  className="font-medium underline underline-offset-2"
                  href="https://github.com/solana-foundation/solana-kit/tree/main/packages/react-hooks"
                  target="_blank"
                  rel="noreferrer"
                >
                  @solana/react-hooks README
                </a>{" "}
                — how this starter wires the client, connectors, and hooks.
              </div>
            </li>
          </ul>
        </header>

        <section className="w-full max-w-3xl space-y-4 rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold">Wallet connection</p>
              <p className="text-sm text-muted">
                Pick any discovered connector and manage connect / disconnect in
                one spot.
              </p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80">
              {status === "connected" ? "Connected" : "Not connected"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect(connector.id)}
                disabled={status === "connecting"}
                className="group flex items-center justify-between rounded-xl border border-border-low bg-card px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex flex-col">
                  <span className="text-base">{connector.name}</span>
                  <span className="text-xs text-muted">
                    {status === "connecting"
                      ? "Connecting…"
                      : status === "connected" &&
                          wallet?.connector.id === connector.id
                        ? "Active"
                        : "Tap to connect"}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${wallet?.connector.id === connector.id ? 'bg-green-500' : 'bg-border-low group-hover:bg-primary/80'} transition`}
                />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border-low pt-4 text-sm">
            <span className="rounded-lg border border-border-low bg-cream px-3 py-2 font-mono text-xs">
              {address ?? "No wallet connected"}
            </span>
            <span className="font-mono text-xs">
              {lamports != null ? `${Number(lamports) / 1e9} SOL` : '—'}
            </span>
            <button
              onClick={() => disconnect()}
              disabled={status !== "connected"}
              className={`inline-flex items-center gap-2 rounded-lg border border-border-low px-3 py-2 font-medium transition hover:-translate-y-0.5 hover:shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${status === "connected" ? "bg-red-600/50" : "bg-card"}`}
            >
              Disconnect
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Recipient address"
              className="rounded-lg border border-border-low bg-white text-black px-3 py-2 font-mono text-xs"
            />
            <input
              value={amount}
              type="number"
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              placeholder="Amount (SOL)"
              className="rounded-lg border border-border-low bg-white text-black px-3 py-2 font-mono text-xs"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !destination || !amount}
              className="rounded-lg border border-border-low bg-blue-500 text-white px-3 py-2 font-medium"
            >
              {isSending ? 'Sending…' : `Send ${amount} SOL`}
            </button>
            {sendStatus && (
              <div className={`status status--${sendStatus.severity}`} role="status">
                <strong>{sendStatus.title}</strong>
                <p>{sendStatus.message}</p>
                {sendStatus.retryable && sendStatus.severity !== "success" && (
                  <button
                    onClick={handleSend}
                    className="mt-2 rounded-lg border border-border-low bg-yellow-600 text-white px-3 py-2 font-medium"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
