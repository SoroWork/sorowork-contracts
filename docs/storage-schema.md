# On-Chain Storage Schema

Reference for all storage keys, types, and TTL settings across SoroWork contracts.

## BountyEscrow

| Key | Type | Storage | Description |
|:--|:--|:--|:--|
| `Admin` | `Address` | Instance | Contract administrator |
| `Token` | `Address` | Instance | USDC token contract address |
| `Registry` | `Address` | Instance | ContributionRegistry contract address |
| `TaskCount` | `u64` | Instance | Auto-incrementing task counter |
| `Bounty(task_id)` | `BountyInfo` | Persistent | Task details, status, creator, assignee, reward |

**TTL**: Persistent entries — threshold 17,280 ledgers (~1 day), extend to 1,036,800 (~60 days).

## CommunityTreasury

| Key | Type | Storage | Description |
|:--|:--|:--|:--|
| `Admin` | `Address` | Instance | Treasury administrator |
| `Token` | `Address` | Instance | USDC token contract address |
| `DepositCount` | `u64` | Instance | Total deposit counter |

**TTL**: Instance — threshold 17,280 ledgers, extend to 518,400 (~30 days).

## ContributionRegistry

| Key | Type | Storage | Description |
|:--|:--|:--|:--|
| `AuthorizedCaller` | `Address` | Instance | BountyEscrow contract address (only caller allowed to record) |
| `ContribCount(address)` | `u32` | Persistent | Number of contributions for a given worker |
| `ContribEntry(address, index)` | `ContributionEntry` | Persistent | Individual contribution record |

**TTL**: Persistent entries — threshold 17,280 ledgers, extend to 1,036,800 (~60 days).
