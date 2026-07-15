# Week4 of #100DaysOfSolana: Solana's Account Model

**Tags:** solana, blockchain, web3, 100DaysOfSolana

If you come from Web2, Solana's account model can feel strange at first. The first time I inspected an account with the CLI, I saw fields like `lamports`, `owner`, and `data` all sitting together and thought, "Wait, where is the smart contract state stored?"

That question is the whole lesson. On Solana, everything is an account. Wallets are accounts. Program code lives in accounts. Application state lives in accounts. There is no separate world of contract accounts versus externally owned accounts like you may have seen elsewhere. Solana uses one flat key-value store where the key is a 32-byte address and the value is the account itself.

That design clicked for me when I started thinking about accounts like files in a filesystem. Each file has metadata, contents, and permissions. Solana accounts work the same way:

- the address is the filename
- the owner is the program allowed to manage it
- the data is the file contents
- the balance is the lamports stored alongside it
- the executable flag tells you whether the file is runnable code or just data

That analogy is not perfect, but it gets you close fast. The System Program is like the operating system kernel. It creates accounts, assigns ownership, and handles basic bookkeeping. Other programs then read and write the accounts they own.

Every Solana account has the same five fields:

1. `lamports` - the balance stored in the account. One SOL equals 1 billion lamports.
2. `data` - a byte array that can hold arbitrary state.
3. `owner` - the program that controls the account.
4. `executable` - whether the account contains runnable program code.
5. `rent_epoch` - a legacy field that is now effectively retired and set to the maximum value.

The most important rule is ownership. Only the owner program can modify an account's data or debit its lamports. That means a token program can update token accounts it owns, but nobody else can casually rewrite those bytes. At the same time, anyone can credit lamports to a writable account. That combination is simple, but it creates a very clear security model.

What surprised me most was the statelessness of programs. In Web2 terms, a program is not a server that keeps its own memory forever. It is more like a web server binary that reads from and writes to a database. The executable account stores the code, and separate data accounts store the application state. That separation is why the account model matters so much: if you understand who owns the account and what data it contains, you understand how the program behaves.

Here is the kind of output I kept seeing while exploring accounts:


Each field tells a story. A zero-length `data` field means the account is just holding value. The owner `11111111111111111111111111111111` is the System Program. `executable: false` means this is not a program account. And the huge `rentEpoch` value is a clue that rent exemption has taken over the old rent schedule.

Rent exemption is another detail that makes Solana feel different from a traditional backend. Every account must hold a minimum lamport balance proportional to its data size if it wants to stay on-chain. If the account drops below that threshold, it risks being purged over time. For a tiny basic account, the minimum is around 0.00089 SOL, though the exact value depends on the account size. You can check it with `solana rent` or the `getMinimumBalanceForRentExemption` RPC method.

That idea matters because it forces you to think about storage costs up front. If you create a larger state account, you need to fund it accordingly. In Web2, disk space is usually someone else's problem. On Solana, the cost of storage is part of the design.

The account model also explains why Solana feels so composable. Programs do not hide their state inside private memory. They operate on explicit accounts that can be inspected, passed around, and reasoned about independently. Once I stopped thinking in terms of "a contract with internal state" and started thinking in terms of "a program that manages files," the architecture made much more sense.

If you are a Web2 developer, that is the mental model I would keep: Solana is a filesystem for programmable state. Accounts are the files. Programs are the executables. The System Program is the kernel. And ownership is the permission system that keeps everything safe.

That framing turned Solana from something mysterious into something structured. The account model is not just an implementation detail. It is the core abstraction that makes the rest of Solana understandable.