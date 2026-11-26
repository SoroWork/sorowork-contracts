# Multi-Contract Deployment Ordering

SoroWork uses three interdependent Soroban contracts. They must be deployed and initialized in a specific order because each contract references the address of another.

## Dependency Graph

```
ContributionRegistry  (standalone — no dependencies)
        ▲
        │ registry address passed at init
        │
   BountyEscrow  (depends on: ContributionRegistry, USDC token)
        ▲
        │ escrow address passed at init
        │
CommunityTreasury  (depends on: USDC token)
```

## Deployment Steps

### Step 1: Deploy ContributionRegistry

The registry has no external dependencies. Deploy it first.

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contribution_registry.wasm \
  --source <DEPLOYER_SECRET> \
  --network testnet
```

Initialize it with the address that will be authorized to record contributions (the BountyEscrow address from Step 2):

```bash
soroban contract invoke \
  --id <REGISTRY_CONTRACT_ID> \
  --source <DEPLOYER_SECRET> \
  --network testnet \
  -- initialize \
  --authorized_caller <BOUNTY_ESCROW_CONTRACT_ID>
```

> **Note:** This creates a chicken-and-egg situation — the registry needs the escrow address, but escrow is deployed in Step 2. In practice, deploy both contracts first, then initialize the registry with the escrow address before any tasks are created.

### Step 2: Deploy BountyEscrow

The escrow contract locks USDC and records contributions to the registry on approval.

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_escrow.wasm \
  --source <DEPLOYER_SECRET> \
  --network testnet
```

Initialize with the admin address, USDC token address, and the registry contract from Step 1:

```bash
soroban contract invoke \
  --id <BOUNTY_ESCROW_CONTRACT_ID> \
  --source <DEPLOYER_SECRET> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --token <USDC_TOKEN_ADDRESS> \
  --registry <REGISTRY_CONTRACT_ID>
```

### Step 3: Deploy CommunityTreasury

The treasury is independent of the other two contracts but shares the same USDC token.

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/community_treasury.wasm \
  --source <DEPLOYER_SECRET> \
  --network testnet
```

Initialize with admin and token:

```bash
soroban contract invoke \
  --id <TREASURY_CONTRACT_ID> \
  --source <DEPLOYER_SECRET> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --token <USDC_TOKEN_ADDRESS>
```

## Practical Deployment Order

1. Build all contracts: `make build`
2. Deploy ContributionRegistry → save contract ID
3. Deploy BountyEscrow → save contract ID
4. Deploy CommunityTreasury → save contract ID
5. Initialize ContributionRegistry with BountyEscrow's address as `authorized_caller`
6. Initialize BountyEscrow with admin, USDC token, and ContributionRegistry address
7. Initialize CommunityTreasury with admin and USDC token
8. Record all contract IDs in `.env` or `DEPLOYED.md`

## Testnet USDC

On Stellar testnet, you can use the Stellar Asset Contract (SAC) for a test token. The `scripts/seed-testnet.sh` script handles this automatically.

## Verification

After deployment, verify each contract is initialized:

```bash
# Check registry authorized caller
soroban contract invoke --id <REGISTRY_ID> --network testnet -- get_authorized_caller

# Check escrow admin
soroban contract invoke --id <ESCROW_ID> --network testnet -- get_admin

# Check treasury admin
soroban contract invoke --id <TREASURY_ID> --network testnet -- get_admin
```
