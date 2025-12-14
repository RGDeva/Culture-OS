'use client'

import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, ExternalLink } from 'lucide-react'
import { Payment } from '@/lib/types/payments'

interface PaymentHistoryProps {
  userId: string
  limit?: number
}

export function PaymentHistory({ userId, limit = 10 }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`/api/payments?userId=${userId}&limit=${limit}`)
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments)
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [userId, limit])

  if (loading) {
    return (
      <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-green-400/20 w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-green-400/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MARKETPLACE_PURCHASE: 'Marketplace',
      BOUNTY_PAYMENT: 'Bounty',
      TIP: 'Tip',
      PROJECT_FUNDING: 'Project',
      STUDIO_SESSION: 'Studio',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'text-green-400 bg-green-400/20 border-green-400/50',
      PENDING: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50',
      PROCESSING: 'text-cyan-400 bg-cyan-400/20 border-cyan-400/50',
      ESCROWED: 'text-purple-400 bg-purple-400/20 border-purple-400/50',
      FAILED: 'text-red-400 bg-red-400/20 border-red-400/50',
    }
    return colors[status] || 'text-gray-400 bg-gray-400/20 border-gray-400/50'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">PAYMENT_HISTORY</h2>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-green-400/40 mx-auto mb-2" />
          <p className="text-green-400/60 font-mono">No payments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const isIncoming = payment.toUserId === userId
            const isOutgoing = payment.fromUserId === userId

            return (
              <div
                key={payment.id}
                className="p-4 bg-black/30 border border-green-400/20 rounded-lg hover:bg-green-400/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${isIncoming ? 'bg-green-400/20' : 'bg-yellow-400/20'}`}>
                      {isIncoming ? (
                        <ArrowDownToLine className="h-5 w-5 text-green-400" />
                      ) : (
                        <ArrowUpFromLine className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-green-400">
                          {payment.description || getTypeLabel(payment.type)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-mono border rounded ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-green-400/60 font-mono">
                        <span>{formatDate(payment.createdAt)}</span>
                        <span>•</span>
                        <span>{getTypeLabel(payment.type)}</span>
                        {payment.txHash && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://sepolia.basescan.org/tx/${payment.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-green-400 transition-colors"
                            >
                              View TX
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        )}
                      </div>
                      
                      {payment.platformFee > 0 && (
                        <div className="text-xs text-green-400/40 font-mono mt-1">
                          Net: ${payment.netAmount.toFixed(2)} (Fee: ${payment.platformFee.toFixed(2)})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold font-mono ${isIncoming ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isIncoming ? '+' : '-'}${payment.amountUSDC.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-400/60 font-mono">USDC</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
