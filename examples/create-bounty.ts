import { Contract, Networks, TransactionBuilder, Keypair, SorobanRpc } from '@stellar/stellar-sdk'

const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET
const CONTRACT_ID = 'YOUR_BOUNTY_ESCROW_CONTRACT_ID'

async function createBounty(
  sourceKeypair: Keypair,
  title: string,
  rewardAmount: bigint,
  tokenAddress: string,
) {
  const server = new SorobanRpc.Server(RPC_URL)
  const account = await server.getAccount(sourceKeypair.publicKey())

  const contract = new Contract(CONTRACT_ID)
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'create_bounty',
        ...[/* admin, token, amount, description params */],
      ),
    )
    .setTimeout(30)
    .build()

  console.log('Transaction built for bounty:', title)
  console.log('Reward:', rewardAmount.toString(), 'stroops')
}
