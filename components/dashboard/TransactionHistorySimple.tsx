'use client'

import { ArrowRightLeft } from 'lucide-react'

interface TransactionHistorySimpleProps {
  userId: string
}

export function TransactionHistorySimple({ userId }: TransactionHistorySimpleProps) {
  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">TRANSACTION_HISTORY</h2>

      <div className="text-center py-12">
        <div className="p-4 bg-green-400/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <ArrowRightLeft className="h-8 w-8 text-green-400/60" />
        </div>
        <p className="text-green-400/60 font-mono text-sm">No transactions yet</p>
        <p className="text-green-400/40 font-mono text-xs mt-2">
          Your transaction history will appear here
        </p>
      </div>
    </div>
  )
}
