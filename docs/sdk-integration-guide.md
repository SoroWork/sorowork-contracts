# SDK Integration Guide

How to interact with SoroWork contracts from TypeScript/JavaScript applications using `@stellar/stellar-sdk`.

## Setup

```bash
npm install @stellar/stellar-sdk
```

```typescript
import { SorobanRpc, Contract, Networks, TransactionBuilder, Keypair, xdr } from '@stellar/stellar-sdk'

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org')
const networkPassphrase = Networks.TESTNET
```

## Reading Contract State

### Get a bounty

```typescript
async function getBounty(contractId: string, taskId: number) {
  const contract = new Contract(contractId)
  const tx = new TransactionBuilder(await server.getAccount('G...'), {
    fee: '100',
    networkPassphrase,
  })
    .addOperation(contract.call('get_bounty', xdr.ScVal.scvU64(xdr.Uint64.fromString(String(taskId)))))
    .setTimeout(30)
    .build()

  const result = await server.simulateTransaction(tx)
  return result
}
```

### Get worker contribution count

```typescript
async function getContributionCount(registryId: string, workerAddress: string) {
  const contract = new Contract(registryId)
  const tx = new TransactionBuilder(await server.getAccount('G...'), {
    fee: '100',
    networkPassphrase,
  })
    .addOperation(contract.call('get_contribution_count', new Address(workerAddress).toScVal()))
    .setTimeout(30)
    .build()

  const result = await server.simulateTransaction(tx)
  return result
}
```

## Writing Transactions

For state-changing operations, you need to sign and submit:

```typescript
async function submitTransaction(tx: Transaction, signer: Keypair) {
  const prepared = await server.prepareTransaction(tx)
  prepared.sign(signer)
  const response = await server.sendTransaction(prepared)

  // Poll for completion
  let status = await server.getTransaction(response.hash)
  while (status.status === 'NOT_FOUND') {
    await new Promise(r => setTimeout(r, 1000))
    status = await server.getTransaction(response.hash)
  }
  return status
}
```

## Freighter Integration (Browser)

```typescript
import { requestAccess, signTransaction } from '@stellar/freighter-api'

async function connectAndSign(tx: string) {
  const publicKey = await requestAccess()
  const signed = await signTransaction(tx, { networkPassphrase })
  return signed
}
```

## Contract Addresses

See `DEPLOYED.md` in the repository root for current testnet contract addresses.
