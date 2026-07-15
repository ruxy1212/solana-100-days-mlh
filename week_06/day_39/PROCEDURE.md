# Inspect and Compare Token Extension Configurations

## Steps:

### Step 1: Inspect your interest-bearing mint from Day 36

- Locate the mint address you saved in `week_06/day_36/Addresses.txt`.
- Set it as a variable in your terminal:
  - Bash/macOS/Linux: `export DAY36_MINT=your_address_here`
  - PowerShell/Windows: `$env:DAY36_MINT="your_address_here"`
- Pull the full on-chain state to view the extensions:
  - `spl-token display $DAY36_MINT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Note the Rate authority and the Current rate in basis points.

### Step 2: Inspect your multi-extension mint from Day 37

- Locate the mint address from `week_06/day_37/Addresses.txt` and assign it to a variable:
  - Bash/macOS/Linux: `export DAY37_MINT=your_address_here`
  - PowerShell/Windows: `$env:DAY37_MINT="your_address_here"`
- Inspect its configuration:
  - `spl-token display $DAY37_MINT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Look for multiple entries in the Extensions section: `Transfer fees`, `Interest-bearing`, `Metadata Pointer`, and `Metadata`.

### Step 3: Inspect your default-frozen mint from Day 38

- Locate the mint address from `week_06/day_38/Addresses.txt` and assign it to a variable:
  - Bash/macOS/Linux: `export DAY38_MINT=your_address_here`
  - PowerShell/Windows: `$env:DAY38_MINT="your_address_here"`
- Inspect its configuration:
  - `spl-token display $DAY38_MINT --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Look for the `Default state: Frozen` line under the Extensions section and confirm the `Freeze authority` address.

### Step 4: Compare account sizes

- Each extension adds data to the mint account, requiring a different amount of rent-exempt storage.
- Run the following command for each of your mints (replace `$DAY36_MINT` with `$DAY37_MINT` and `$DAY38_MINT` respectively) to see their account sizes:
  - `solana account $DAY36_MINT --output json`
- Note the "Data Length" field or the "space" parameter in the JSON output.
- Notice the correlation between the number of extensions and the rent cost (larger footprint means higher rent cost in SOL).

### Step 5: Document the comparison

- Review the `README.md` in this directory (`day_39`) where a comparison table has been constructed using the collected values from your previous days.
