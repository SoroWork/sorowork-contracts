# Error Codes and Handling

All panic messages and error types across SoroWork contracts.

## BountyEscrow

| Error | Trigger | Resolution |
|:--|:--|:--|
| `"already initialized"` | Calling `initialize` on an already-initialized contract | Contract can only be initialized once after deployment |
| `"not initialized"` | Calling any function before `initialize` | Deploy and initialize the contract first |
| `"only admin"` | Non-admin calling admin-only functions | Use the admin address that was set during initialization |
| `"bounty not found"` | Referencing a non-existent `task_id` | Verify the task ID exists via `get_bounty` |
| `"amount must be positive"` | Creating a bounty with zero or negative reward | Provide a reward amount greater than 0 |
| `"already assigned"` | Assigning a worker to an already-assigned task | Task already has a worker; check status first |
| `"not assigned"` | Submitting work for an unassigned task | Worker must be assigned before submitting |
| `"wrong contributor"` | A different address submitting work | Only the assigned worker can submit |
| `"work not submitted"` | Approving before work is submitted | Wait for the worker to submit evidence |

## CommunityTreasury

| Error | Trigger | Resolution |
|:--|:--|:--|
| `"already initialized"` | Double initialization | Contract can only be initialized once |
| `"not initialized"` | Operating before initialization | Initialize with admin and token address |
| `"only admin can distribute"` | Non-admin calling `distribute` | Only the admin set at init can distribute funds |
| `"amount must be positive"` | Zero/negative deposit or distribution | Use a positive amount |

## ContributionRegistry

| Error | Trigger | Resolution |
|:--|:--|:--|
| `"already initialized"` | Double initialization | Contract can only be initialized once |
| `"not initialized"` | Operating before initialization | Initialize with the escrow contract address |
| `"unauthorized caller"` | Non-escrow address recording a contribution | Only the authorized BountyEscrow contract can call `record_contribution` |
| `"contribution not found"` | Querying a non-existent contribution index | Check `get_contribution_count` first |
