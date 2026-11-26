# Testnet Interaction Tutorial

Step-by-step guide to creating a bounty, submitting work, and approving payment on Stellar testnet.

## Prerequisites

```bash
cargo install stellar-cli --features opt
stellar keys generate --global mykey --network testnet
stellar keys fund mykey --network testnet
```

## 1. Deploy and Initialize Contracts

See [deployment-ordering.md](deployment-ordering.md) for the full deployment sequence.

## 2. Create a Cleanup Bounty

```bash
stellar contract invoke \
  --id $CONTRACT_ID_ESCROW \
  --source mykey \
  --network testnet \
  -- create_bounty \
  --creator $(stellar keys address mykey) \
  --token $USDC_TOKEN_ID \
  --amount 5000000000 \
  --description "Clean up trash along the river trail — 1 mile stretch"
```

This locks 500 USDC (5000000000 stroops) in escrow and returns a `task_id`.

## 3. Assign a Worker

```bash
stellar contract invoke \
  --id $CONTRACT_ID_ESCROW \
  --source mykey \
  --network testnet \
  -- assign_contributor \
  --admin $(stellar keys address mykey) \
  --task_id 0 \
  --contributor $WORKER_ADDRESS
```

## 4. Submit Work (as the Worker)

```bash
stellar contract invoke \
  --id $CONTRACT_ID_ESCROW \
  --source worker_key \
  --network testnet \
  -- submit_work \
  --contributor $WORKER_ADDRESS \
  --task_id 0 \
  --evidence_hash "516d..."
```

The `evidence_hash` is typically an IPFS CID of the uploaded before/after photos.

## 5. Approve and Release Payment

```bash
stellar contract invoke \
  --id $CONTRACT_ID_ESCROW \
  --source mykey \
  --network testnet \
  -- approve_work \
  --admin $(stellar keys address mykey) \
  --task_id 0
```

This releases the escrowed USDC to the worker and records the contribution in the ContributionRegistry.

## 6. Verify

```bash
# Check bounty status
stellar contract invoke --id $CONTRACT_ID_ESCROW --network testnet -- get_bounty --task_id 0

# Check worker's contribution count
stellar contract invoke --id $CONTRACT_ID_REGISTRY --network testnet -- get_contribution_count --contributor $WORKER_ADDRESS
```
