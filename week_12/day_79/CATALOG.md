## Audit Catalog Table

| Constraint | What it checks | Typical use case |
|---|---|---|
| `has_one = <field>` | This account's `<field>` equals the key of the named account in the struct | Binding a state account to its owner/authority (e.g. `has_one = authority`) |
| `address = <const>` | This account's key equals a fixed, hardcoded pubkey | Pinning a known admin key or a specific well-known program account |
| `seeds = [...], bump = <state>.bump` | Re-derives the PDA from the seeds and confirms the passed-in address matches | Validating any program-derived account, so an attacker can't substitute a different one |
| `token::mint = <mint>, token::authority = <auth>` | Confirms an SPL token account's mint and owner match the expected accounts | Preventing wrong-mint or wrong-owner token account substitution |
| `constraint = <bool expr> @ ErrorVariant` | Any custom boolean expression; fails with the named error if false | Business-logic rules the typed constraints can't express (e.g. `vault.balance >= amount`) |
| `UncheckedAccount<'info>` + `/// CHECK:` comment | Nothing — this is the explicit "I'm skipping validation" escape hatch | Last resort only; the comment must justify why skipping is safe, and every instance is a flag for adversarial testing |