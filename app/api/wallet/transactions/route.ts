export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

/**
 * GET /api/wallet/transactions
 * Get transaction history for user's wallet
 * 
 * Query params: 
 *   - userId: string (required)
 *   - limit: number (optional, default 20)
 *   - offset: number (optional, default 0)
 *   - type: 'all' | 'onramp' | 'offramp' | 'payments' (optional)
 * 
 * Returns: { transactions: Transaction[], total: number }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch actual transactions from database
    // This would query:
    // 1. zkp2p on-ramp sessions
    // 2. Payment transactions (tips, bounties, purchases)
    // 3. On-chain transactions from Base network
    
    // For now, return mock data
    const mockTransactions = [
      {
        id: 'tx_1',
        type: 'onramp',
        amount: '50.00',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        description: 'Added funds via Bank Transfer',
        txHash: '0x1234567890abcdef1234567890abcdef12345678',
        from: 'Bank Account',
        to: 'Wallet'
      },
      {
        id: 'tx_2',
        type: 'tip',
        amount: '10.00',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        description: 'Tip to ARTIST_NAME',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        from: 'Wallet',
        to: 'creator_3'
      },
      {
        id: 'tx_3',
        type: 'bounty',
        amount: '75.00',
        status: 'pending',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        description: 'Bounty payment for Mix & Master',
        from: 'Wallet',
        to: 'Escrow'
      },
      {
        id: 'tx_4',
        type: 'purchase',
        amount: '25.00',
        status: 'completed',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'Purchased Dark Trap Beat Pack',
        txHash: '0x9876543210fedcba9876543210fedcba98765432',
        from: 'Wallet',
        to: 'creator_1'
      },
      {
        id: 'tx_5',
        type: 'onramp',
        amount: '100.00',
        status: 'completed',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Added funds via Venmo',
        txHash: '0x1111222233334444555566667777888899990000',
        from: 'Venmo',
        to: 'Wallet'
      },
    ]

    // Filter by type if specified
    const filteredTransactions = type === 'all' 
      ? mockTransactions
      : type === 'payments'
      ? mockTransactions.filter(tx => ['payment', 'tip', 'bounty', 'purchase'].includes(tx.type))
      : mockTransactions.filter(tx => tx.type === type)

    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit)

    return NextResponse.json({
      transactions: paginatedTransactions,
      total: filteredTransactions.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('[WALLET_TRANSACTIONS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
