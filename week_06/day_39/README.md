# Day 39: Inspect and Compare Token Extension Configurations

This table summarizes the configurations and on-chain metrics for the tokens created in the past three days. It illustrates how different extension choices directly impact account data size and rent costs.

### Comparison Table

| Mint | Extensions Enabled | Account Data Size (bytes) | Rent Cost (SOL) | Key Authorities |
| ------------- | :------------- | :------------- | :------------- | :------------- |
| **Day 36**<br>`4mfb53CFzwaLj67BtqYKLi7a9FLzDMh3yt3KmuG4HETw`| Interest-bearing | 222 | ~0.002436 SOL | Mint authority, Rate authority |
| **Day 37**<br>`9hYkWU9w9ufMbGfz7xo16iaoUpzf5dLA9GDY2kUvus5H` | Interest-bearing, Transfer fees, Metadata Pointer, Metadata | 599 | ~0.005060 SOL | Mint auth, Rate auth, Config auth, Withdrawal auth, Metadata Update auth |
| **Day 38**<br>`EdfVw23vaPqjqY9hB9BVqKsqzCyMf2tDiANFMRS6juTD` | Default Account State (Frozen) | 171 | ~0.002081 SOL | Mint authority, Freeze authority |

### Observation

- **Account Size and Space:** Every Token-2022 extension requires explicit allocation of bytes in the mint account. 
- **Resource Footprint:** The single-purpose interest-bearing mint (Day 36) has a relatively small footprint, while the feature-stuffed multi-extension mint (Day 37) is substantially larger. The Default Account State extension (Day 38) proves to be highly efficient, taking minimal space.
- **Cost Implication:** Because Solana requires rent-exempt deposits proportional to data storage, larger accounts inherently cost more SOL to create. Choosing token extensions effectively translates directly into infrastructure cost optimizations.
