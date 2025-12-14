'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, ExternalLink, Filter } from 'lucide-react'

interface Transaction {
  id: string
  type: 'onramp' | 'offramp' | 'payment' | 'tip' | 'bounty' | 'purchase'
  amount: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  description: string
  txHash?: string
}

interface TransactionHistoryProps {
  userId: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'onramp' | 'offramp' | 'payments'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [userId])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      // TODO: Fetch actual transactions from API
      // For now, mock data
      setTransactions([
        {
          id: 'tx_1',
          type: 'onramp',
          amount: '50.00',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: 'Added funds via Bank Transfer',
          txHash: '0x1234...5678'
        },
        {
          id: 'tx_2',
          type: 'tip',
          amount: '10.00',
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          description: 'Tip to ARTIST_NAME',
          txHash: '0xabcd...efgh'
        },
        {
          id: 'tx_3',
          type: 'bounty',
          amount: '75.00',
          status: 'pending',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          description: 'Bounty payment for Mix & Master',
        },
        {
          id: 'tx_4',
          type: 'purchase',
          amount: '25.00',
          status: 'completed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          description: 'Purchased Dark Trap Beat Pack',
          txHash: '0x9876...5432'
        },
      ])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'onramp':
        return <ArrowDownToLine className="h-4 w-4" />
      case 'offramp':
        return <ArrowUpFromLine className="h-4 w-4" />
      default:
        return <ArrowRightLeft className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'onramp':
        return 'text-green-400'
      case 'offramp':
        return 'text-yellow-400'
      case 'tip':
        return 'text-pink-400'
      case 'bounty':
        return 'text-cyan-400'
      default:
        return 'text-green-400'
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const colors = {
      completed: 'bg-green-400/20 text-green-400 border-green-400/50',
      pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50',
      failed: 'bg-red-400/20 text-red-400 border-red-400/50'
    }
    
    return (
      <span className={`px-2 py-0.5 text-xs font-mono border rounded ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    if (filter === 'onramp') return tx.type === 'onramp'
    if (filter === 'offramp') return tx.type === 'offramp'
    if (filter === 'payments') return ['payment', 'tip', 'bounty', 'purchase'].includes(tx.type)
    return true
  })

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-mono text-green-400">TRANSACTION_HISTORY</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('all')}
            className={`font-mono text-xs ${filter === 'all' ? 'text-green-400 bg-green-400/10' : 'text-green-400/60'}`}
          >
            ALL
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('onramp')}
            className={`font-mono text-xs ${filter === 'onramp' ? 'text-green-400 bg-green-400/10' : 'text-green-400/60'}`}
          >
            ON-RAMP
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('offramp')}
            className={`font-mono text-xs ${filter === 'offramp' ? 'text-green-400 bg-green-400/10' : 'text-green-400/60'}`}
          >
            OFF-RAMP
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter('payments')}
            className={`font-mono text-xs ${filter === 'payments' ? 'text-green-400 bg-green-400/10' : 'text-green-400/60'}`}
          >
            PAYMENTS
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-green-400/60 font-mono">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-green-400/60 font-mono">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 bg-black/30 border border-green-400/20 rounded-lg hover:bg-green-400/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 bg-black/50 rounded-lg ${getTypeColor(tx.type)}`}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-green-400">{tx.description}</p>
                      {getStatusBadge(tx.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-green-400/60 font-mono">
                      <span>{formatTimestamp(tx.timestamp)}</span>
                      {tx.txHash && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => window.open(`https://basescan.org/tx/${tx.txHash}`, '_blank')}
                            className="flex items-center gap-1 hover:text-green-400 transition-colors"
                          >
                            {tx.txHash}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold font-mono ${
                    tx.type === 'onramp' ? 'text-green-400' : 
                    tx.type === 'offramp' ? 'text-yellow-400' : 
                    'text-green-400/80'
                  }`}>
                    {tx.type === 'onramp' ? '+' : '-'}${tx.amount}
                  </p>
                  <p className="text-xs text-green-400/60 font-mono">USDC</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-green-400/20">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-green-400 hover:bg-green-400/10 font-mono"
        >
          LOAD_MORE
        </Button>
      </div>
    </div>
  )
}
