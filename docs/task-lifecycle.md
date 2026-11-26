# Task Lifecycle Diagrams

Complete state machine for community work tasks on SoroWork.

## Task States

```
                    create_bounty
                         │
                         ▼
                      ┌──────┐
                      │ OPEN │
                      └──┬───┘
                         │
              assign_contributor
                         │
                         ▼
                   ┌──────────┐
           ┌──────│ ASSIGNED  │──────┐
           │      └──────────┘      │
           │           │            │
      refund_bounty  submit_work    │ (timeout — future)
           │           │            │
           ▼           ▼            ▼
      ┌──────────┐ ┌───────────┐ ┌───────────┐
      │CANCELLED │ │ SUBMITTED │ │  EXPIRED  │
      └──────────┘ └─────┬─────┘ └───────────┘
                         │
                   approve_work
                         │
                         ▼
                   ┌──────────┐
                   │ APPROVED │
                   └──────────┘
```

## Payment Flow

```
Creator Wallet ──► BountyEscrow Contract ──► Worker Wallet
     │              (holds USDC)                  ▲
     │                   │                        │
     │            on approve_work:                │
     │            1. transfer USDC ───────────────┘
     │            2. record_contribution ──► ContributionRegistry
     │                                       (permanent record)
     │
     └── on refund: USDC returned to creator
```

## Error Paths

| State | Error Scenario | Result |
|:--|:--|:--|
| OPEN | Creator cancels before assignment | USDC refunded, task cancelled |
| ASSIGNED | Wrong address tries to submit | Rejected — only assigned worker can submit |
| ASSIGNED | Creator cancels after assignment | USDC refunded, task cancelled |
| SUBMITTED | Non-admin tries to approve | Rejected — only admin can approve |
| APPROVED | Any modification attempted | Rejected — final state, immutable |
| CANCELLED | Any modification attempted | Rejected — final state |

## Cross-Contract Calls

When `approve_work` is called on BountyEscrow:
1. BountyEscrow transfers USDC from itself to the worker via the token contract
2. BountyEscrow calls `record_contribution` on ContributionRegistry
3. ContributionRegistry stores the contribution entry with task ID, evidence hash, reward, and timestamp
