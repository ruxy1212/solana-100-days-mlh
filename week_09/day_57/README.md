# Day 57: Your First Anchor Program

## Overview
Today's task marks the transition from being a client of Solana programs (minting, transferring, etc.) to becoming a developer. The goal is to set up the **Anchor framework**, which simplifies Solana program development by handling account serialization, generating typed clients, and providing a standard project layout.

## The Goal
Install the Anchor toolchain and scaffold a new project to ensure the environment is correctly configured.

## Prerequisites
- Solana CLI
- Rust toolchain (`rustc`, `cargo`)
- Node.js 18+ & npm/yarn

## Steps Taken

### 1. Install Anchor Version Manager (AVM)
AVM allows managing multiple versions of the Anchor CLI.
```bash
cargo install --git https://github.com/solana-foundation/anchor avm --force
```

### 2. Install and Use Anchor CLI
```bash
avm install latest
avm use latest
anchor --version
```

### 3. Scaffold a New Project
Initialize a fresh Anchor workspace:
```bash
anchor init counter
cd counter
```

### 4. Explore the Project Structure
Key files generated:
- **Anchor.toml**: Project configuration and program ID mapping.
- **programs/counter/src/lib.rs**: The main program file containing the instruction handlers.
- **tests/**: Scaffolded tests for the program.
- **Cargo.toml**: Rust workspace configuration.

### 5. Build the Program
Compile the scaffolded program to verify the toolchain:
```bash
anchor build
```

This produces the compiled `.so` binary and the IDL (Interface Definition Language) JSON file in the `target/` directory.
