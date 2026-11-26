# SoroWork Contracts

Soroban smart contracts powering SoroWork — a platform where communities post real-world tasks (cleanups, repairs, landscaping, maintenance) and workers earn USDC on Stellar for completing them.

## Contracts

### 1. Bounty Escrow (`contracts/bounty-escrow`)

Manages the full lifecycle of community work bounties:

- **Community leader** posts a task by depositing USDC into escrow
- **Leader** assigns a worker to the task
- **Worker** completes the job and submits proof (photos, video, or other evidence)
- **Leader** approves the work → USDC is released to the worker
- **Leader** can refund the bounty if it's still Open or Assigned

**States:** `Open → Assigned → Submitted → Approved` (or `Cancelled` via refund)

### 2. Community Treasury (`contracts/community-treasury`)

An admin-controlled pool for community funds:

- Anyone can **deposit** tokens into the treasury
- Only the **admin** can **distribute** tokens to recipients with a reason
- Useful for ongoing community maintenance, event cleanups, group rewards, and grants

### 3. Contribution Registry (`contracts/contribution-registry`)

On-chain, append-only record of verified worker contributions:

- Stores each worker's task IDs, evidence hashes, timestamps, and reward amounts
- Only the **authorized caller** (the bounty escrow contract) can write records
- Queryable by worker address: get count, single entry, or all entries (capped at 100)
- Workers build a verifiable on-chain work history

---

## Payment Flow

```
Community Leader         BountyEscrow                Worker
  |                          |                       |
  |  create_bounty(amount)   |                       |
  |------------------------->|                       |
  |  (USDC locked in escrow) |                       |
  |                          |                       |
  |  assign_contributor()    |                       |
  |------------------------->|                       |
  |                          |                       |
  |                          |  submit_work(hash)    |
  |                          |<----------------------|
  |                          |  (photos/video proof) |
  |                          |                       |
  |  approve_work()          |                       |
  |------------------------->|                       |
  |                          |  transfer USDC ------>|
  |                          |                       |
  |                          |  record_contribution()|
  |                          |--> ContribRegistry    |
```

---

## Deploy to Testnet

> **Important:** Contracts must be deployed and initialized in a specific order due to cross-contract dependencies. See [docs/deployment-ordering.md](docs/deployment-ordering.md) for the full guide with dependency diagram.

### Prerequisites

```bash
# Install Stellar CLI
cargo install stellar-cli --features opt

# Configure testnet identity
stellar keys generate --global mykey --network testnet
stellar keys fund mykey --network testnet
```

### Deploy Contracts

```bash
# Build all contracts
cargo build --target wasm32-unknown-unknown --release

# Deploy bounty-escrow
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_escrow.wasm \
  --source mykey \
  --network testnet
# Save output as CONTRACT_ID_ESCROW

# Deploy community-treasury
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/community_treasury.wasm \
  --source mykey \
  --network testnet
# Save output as CONTRACT_ID_TREASURY

# Initialize treasury
stellar contract invoke \
  --id $CONTRACT_ID_TREASURY \
  --source mykey \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address mykey) \
  --token USDC_TOKEN_ADDRESS

# Deploy contribution-registry
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contribution_registry.wasm \
  --source mykey \
  --network testnet
# Save output as CONTRACT_ID_REGISTRY

# Initialize registry — pass the escrow contract as the authorized caller
stellar contract invoke \
  --id $CONTRACT_ID_REGISTRY \
  --source mykey \
  --network testnet \
  -- initialize \
  --authorized_caller $CONTRACT_ID_ESCROW
```

---

## Function Reference

### BountyEscrow

| Function | Caller | Description |
|---|---|---|
| `create_bounty(creator, token, amount) -> u64` | Community leader | Lock tokens and create task |
| `assign_contributor(task_id, contributor, caller)` | Community leader | Assign a worker to a task |
| `submit_work(task_id, contributor, evidence_hash)` | Worker | Submit proof of completed work |
| `approve_work(task_id, caller)` | Community leader | Release escrow to worker |
| `refund_bounty(task_id, caller)` | Community leader | Cancel and return tokens |
| `get_bounty(task_id) -> BountyInfo` | Anyone | Read bounty state |
| `get_task_count() -> u64` | Anyone | Total number of tasks |

### CommunityTreasury

| Function | Caller | Description |
|---|---|---|
| `initialize(admin, token)` | Deployer | Set admin and token (once) |
| `deposit(from, amount)` | Anyone | Add funds to treasury |
| `distribute(caller, recipient, amount, reason)` | Admin | Send funds out |
| `get_balance() -> i128` | Anyone | Current treasury balance |
| `get_admin() -> Address` | Anyone | Current admin address |

### ContributionRegistry

| Function | Caller | Description |
|---|---|---|
| `initialize(authorized_caller)` | Deployer | Set the escrow contract (once) |
| `record_contribution(caller, contributor, task_id, evidence_hash, reward_amount)` | Escrow only | Log a verified contribution |
| `get_contribution_count(contributor) -> u32` | Anyone | How many contributions |
| `get_contribution(contributor, index) -> ContributionEntry` | Anyone | Single entry by index |
| `get_all_contributions(contributor) -> Vec<ContributionEntry>` | Anyone | All entries (max 100) |

---

## Security Notes

- **Re-entrancy**: Soroban's execution model prevents re-entrancy at the host level.
- **Authorization**: Every state-changing function requires `require_auth()` on the relevant party. The registry rejects any caller that is not the initialized escrow address.
- **Status guards**: Each state transition checks the current status, preventing double-approvals, double-refunds, and out-of-order submissions.
- **Initialization guards**: Treasury and registry cannot be re-initialized once set.
- **Evidence hashes**: Stored as raw `Bytes` on-chain. The backend validates evidence before triggering `approve_work`.
- **Testnet USDC**: Use Stellar's native testnet USDC asset for integration testing.

---

## Running Tests

```bash
cargo test --workspace
```
