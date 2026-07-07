## Audit of Day67's Counter Program + UpdateProfile Specimen:

### **Table 1:** Account Inventory & Guard Verification

| Instruction | Account | Type | Owner question | Signer question | Verdict |
|---|---|---|---|---|---|
| InitConfig | config | `Account<'info, Config>` (init) | Yes - program-owned | n/a - not an authority account | ✅ |
| InitConfig | admin | `Signer<'info>` | n/a - no data read from it | Yes - Signer | ✅ |
| InitConfig | system_program | `Program<'info, System>` | n/a - not a data account you trust | n/a - not an authorizing account | ✅ |
| SetPaused | config | `Account<'info, Config>` + seeds/bump | Yes - owner check + PDA derivation | n/a - not an authority account | ✅ |
| SetPaused | admin | `Signer<'info>` | n/a - no data read from it | Yes - Signer, matched to `config.admin` via `has_one` | ✅ |
| InitCounter | config | `Account<'info, Config>` + seeds/bump | Yes - owner check + PDA derivation | n/a - not an authority account | ✅ |
| InitCounter | counter | `Account<'info, Counter>` (init) | Yes - new init, program-owned | n/a — not an authority account | ✅ |
| InitCounter | user | `Signer<'info>` (payer) | n/a - no data read from it | Yes — Signer | ✅ |
| InitCounter | system_program | `Program<'info, System>` | n/a - not a data account you trust | n/a - not an authorizing account | ✅ |
| Increment | config | `Account<'info, Config>` + `constraint = !config.paused` | Yes - owner check + PDA derivation | n/a — not an authority account | ✅ |
| Increment | counter | `Account<'info, Counter>` + seeds/bump + `has_one = user` | Yes - owner check + PDA derivation | n/a — this is the data account, not the authority | ✅ |
| Increment | user | `Signer<'info>` | n/a — no data read from it | Yes - Signer, matched to `counter.user` via `has_one` | ✅ |
| CloseCounter | counter | `Account<'info, Counter>` + `has_one = user` + `close = user` | Yes - owner check + PDA derivation | n/a — this is the data account, not the authority | ✅ |
| CloseCounter | user | `Signer<'info>` | n/a - no data read from it | Yes - Signer | ✅ |
| UpdateProfile | authority | `UncheckedAccount<'info>` | n/a - not a data account, only serves as an authority | **No** - `has_one` matches the public key but never requires this account to sign | ⚠️ |

> NB: The pattern to notice: `Signer` accounts get "n/a" on the owner question because they carry no state data for the logic to trust; and `Account<T>` state accounts get "n/a" on the signer question because they're not authorizing the action, but being acted on.

### **Table 2:** Findings — Question Failures & Consequences

| Account | Type | Question failed | Consequences |
|---|---|---|---|
| InitConfig.config | `Account<'info, T>` | None | ✅ None |
| InitConfig.admin | `Signer<'info>` | None | ✅ None |
| InitConfig.system_program | `Program<'info, T>` | None | ✅ None |
| SetPaused.config | `Account<'info, T>` | None | ✅ None |
| SetPaused.admin | `Signer<'info>` | None | ✅ None |
| InitCounter.config | `Account<'info, T>` | None | ✅ None |
| InitCounter.counter | `Account<'info, T>` | None | ✅ None |
| InitCounter.user | `Signer<'info>` | None | ✅ None |
| InitCounter.system_program | `Program<'info, T>` | None | ✅ None |
| Increment.config | `Account<'info, T>` | None | ✅ None |
| Increment.counter | `Account<'info, T>` | None | ✅ None |
| Increment.user | `Signer<'info>` | None | ✅ None |
| CloseCounter.counter | `Account<'info, T>` | None | ✅ None |
| CloseCounter.user | `Signer<'info>` | None | ✅ None |
| UpdateProfile.authority | `UncheckedAccount<'info>` | Signer question | ⚠️ Lets an attacker submit an authority's public key without holding its private key, meaning anyone can edit any profile without the actual owner's consent |
