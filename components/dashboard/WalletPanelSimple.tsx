'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

interface WalletPanelSimpleProps {
  userId: string
}

export function WalletPanelSimple({ userId }: WalletPanelSimpleProps) {
  const [balance] = useState<string>('0.00')

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-400/10 rounded-lg">
          <Wallet className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono text-green-400">WALLET</h2>
          <p className="text-xs text-green-400/60">Smart Wallet on Base</p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-6 p-4 bg-black/50 border border-green-400/20 rounded-lg">
        <p className="text-sm text-green-400/60 mb-1 font-mono">USDC BALANCE</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-green-400">${balance}</span>
          <span className="text-sm text-green-400/60">USDC</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => alert('On-ramp feature - Coming soon!')}
          className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
        >
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          ADD_FUNDS
        </Button>
        <Button
          onClick={() => alert('Off-ramp feature - Coming soon!')}
          variant="outline"
          className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono font-bold"
        >
          <ArrowUpFromLine className="h-4 w-4 mr-2" />
          WITHDRAW
        </Button>
      </div>

      <p className="text-xs text-green-400/40 text-center mt-4 font-mono">
        Wallet features coming soon
      </p>
    </div>
  )
}
