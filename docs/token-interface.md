# Token Interface Requirements

All SoroWork contracts interact with Stellar Asset Contract (SAC) tokens for USDC payments.

## Required Token Interface

The contracts call the following methods on the token contract:

| Method | Used By | Purpose |
|:--|:--|:--|
| `transfer(from, to, amount)` | BountyEscrow, CommunityTreasury | Move USDC between accounts and contracts |
| `balance(address)` | CommunityTreasury | Check contract balance |

## Supported Token Types

- **Stellar Asset Contracts (SAC)**: The primary supported token type. Wraps classic Stellar assets (like USDC) for use in Soroban.
- **Custom Soroban tokens**: Any token implementing the standard `transfer` and `balance` interface will work.

## USDC on Stellar

SoroWork uses USDC issued by Circle on Stellar. On testnet, use a test SAC token created via `soroban contract asset deploy`.

## Configuration

Each contract receives the token address at initialization:

- **BountyEscrow**: `initialize(admin, token, registry)` — `token` is the USDC SAC address
- **CommunityTreasury**: `initialize(admin, token)` — same USDC SAC address

Both contracts must use the same token address to ensure consistent accounting.

## Testnet Setup

```bash
# Deploy a test token (SAC wrapper)
soroban contract asset deploy \
  --asset USDC:$(stellar keys address mykey) \
  --source mykey \
  --network testnet

# Mint test tokens
soroban contract invoke \
  --id <TOKEN_ID> \
  --source mykey \
  --network testnet \
  -- mint --to <RECIPIENT> --amount 10000000000
```
