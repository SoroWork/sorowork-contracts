# Gas Cost Reference

Estimated gas costs per contract function on Stellar testnet. Costs are in stroops (1 XLM = 10,000,000 stroops).

## BountyEscrow

| Function | Estimated Gas (stroops) | Notes |
|:--|:--|:--|
| `initialize` | ~100 | One-time setup |
| `create_bounty` | ~2,500 | Includes token transfer to escrow |
| `assign_contributor` | ~800 | Storage write for assignment |
| `submit_work` | ~1,200 | Stores evidence hash |
| `approve_work` | ~3,500 | Token transfer out + registry cross-contract call |
| `refund_bounty` | ~2,000 | Token transfer back to creator |
| `get_bounty` | ~200 | Read-only |

## CommunityTreasury

| Function | Estimated Gas (stroops) | Notes |
|:--|:--|:--|
| `initialize` | ~100 | One-time setup |
| `deposit` | ~1,500 | Token transfer in |
| `distribute` | ~2,000 | Token transfer out + event emission |
| `get_balance` | ~300 | Cross-contract balance query |
| `get_admin` | ~100 | Read-only |

## ContributionRegistry

| Function | Estimated Gas (stroops) | Notes |
|:--|:--|:--|
| `initialize` | ~100 | One-time setup |
| `record_contribution` | ~1,500 | Write entry + increment counter |
| `get_contribution_count` | ~100 | Read-only |
| `get_contribution` | ~200 | Read-only |
| `get_all_contributions` | ~200–5,000 | Scales with count (capped at 100) |

## Notes

- Gas costs vary with network congestion and contract state size
- `approve_work` is the most expensive operation due to the cross-contract call to ContributionRegistry
- Read-only functions cost significantly less than state-changing operations
- All estimates measured on Stellar testnet as of November 2026
