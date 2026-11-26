import { Contract, Networks, TransactionBuilder, Keypair, SorobanRpc } from '@stellar/stellar-sdk'

const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET
const CONTRACT_ID = 'YOUR_BOUNTY_ESCROW_CONTRACT_ID'

async function submitWork(
  workerKeypair: Keypair,
  taskId: number,
  evidenceHash: string,
) {
  const server = new SorobanRpc.Server(RPC_URL)
  const account = await server.getAccount(workerKeypair.publicKey())

  const contract = new Contract(CONTRACT_ID)
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'submit_work',
        ...[/* contributor, task_id, evidence_hash params */],
      ),
    )
    .setTimeout(30)
    .build()

  console.log('Submitting work for task:', taskId)
  console.log('Evidence hash:', evidenceHash)
}
