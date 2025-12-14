'use client'

import { useState } from 'react'
import { X402CheckoutButton } from './X402CheckoutButton'
import { DollarSign, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TipSectionProps {
  targetUserId: string
  targetUserName?: string
  onSuccess?: () => void
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100]

export function TipSection({ targetUserId, targetUserName, onSuccess }: TipSectionProps) {
  const [customAmount, setCustomAmount] = useState<string>('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value)
      setSelectedAmount(null)
    }
  }

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setShowCustom(false)
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setSelectedAmount(null)
  }

  const getActiveAmount = (): number | null => {
    if (selectedAmount) return selectedAmount
    if (customAmount) {
      const parsed = parseFloat(customAmount)
      return isNaN(parsed) || parsed <= 0 ? null : parsed
    }
    return null
  }

  const activeAmount = getActiveAmount()

  return (
    <div className="dark:bg-black/50 bg-white/80 border-2 dark:border-green-400/30 border-green-600/40 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="h-6 w-6 dark:text-green-400 text-green-700" />
        <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">SEND_TIP</h3>
      </div>

      <p className="text-sm dark:text-green-400/60 text-green-700/70 font-mono mb-6">
        Support {targetUserName || 'this creator'} directly with USDC
      </p>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {PRESET_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            variant={selectedAmount === amount ? 'default' : 'outline'}
            className={`
              font-mono font-bold
              ${selectedAmount === amount 
                ? 'bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300' 
                : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 dark:hover:bg-green-400/10 hover:bg-green-600/10'
              }
            `}
          >
            ${amount}
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-6">
        {!showCustom ? (
          <Button
            onClick={handleCustomClick}
            variant="outline"
            className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            CUSTOM_AMOUNT
          </Button>
        ) : (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Enter amount"
              className="
                w-full pl-10 pr-4 py-2
                bg-black border-2 border-green-400/50
                text-green-400 font-mono
                placeholder:text-green-400/40
                focus:outline-none focus:border-green-400
                rounded
              "
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Send Button */}
      {activeAmount && (
        <X402CheckoutButton
          amountUsd={activeAmount}
          label={`SEND $${activeAmount} TIP`}
          mode="TIP"
          targetUserId={targetUserId}
          onSuccess={() => {
            // Reset form
            setSelectedAmount(null)
            setCustomAmount('')
            setShowCustom(false)
            onSuccess?.()
          }}
          className="w-full"
        />
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-green-400/60 font-mono text-center space-y-1">
        <div>100% goes to the creator (minus network fees)</div>
        <div>Powered by x402 • Base Network</div>
      </div>
    </div>
  )
}
