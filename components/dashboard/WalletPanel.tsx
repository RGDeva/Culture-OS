'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Copy, ExternalLink, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface WalletPanelProps {
  userId: string
}

export function WalletPanel({ userId }: WalletPanelProps) {
  const { user } = usePrivy()
  const [balance, setBalance] = useState<string>('0.00')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showOnRamp, setShowOnRamp] = useState(false)
  const [showOffRamp, setShowOffRamp] = useState(false)

  useEffect(() => {
    // Get embedded wallet address
    if (user?.wallet?.address) {
      setWalletAddress(user.wallet.address)
      fetchBalance(user.wallet.address)
    } else {
      // Fallback: check linked accounts
      const embeddedWallet = user?.linkedAccounts?.find(
        (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
      )
      
      if (embeddedWallet && 'address' in embeddedWallet) {
        setWalletAddress(embeddedWallet.address as string)
        fetchBalance(embeddedWallet.address as string)
      }
    }
  }, [user])

  const fetchBalance = async (address: string) => {
    setLoading(true)
    try {
      // TODO: Fetch actual USDC balance from Base
      // For now, mock data
      setBalance('125.50')
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      toast.error('Failed to fetch wallet balance')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast.success('Wallet address copied!')
    }
  }

  const refreshBalance = () => {
    if (walletAddress) {
      fetchBalance(walletAddress)
      toast.success('Balance refreshed')
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-400/10 rounded-lg">
            <Wallet className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-green-400">WALLET</h2>
            <p className="text-xs text-green-400/60">Smart Wallet on Base</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshBalance}
          disabled={loading}
          className="text-green-400 hover:bg-green-400/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Balance Display */}
      <div className="mb-6 p-4 bg-black/50 border border-green-400/20 rounded-lg">
        <p className="text-sm text-green-400/60 mb-1 font-mono">USDC BALANCE</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-green-400">${balance}</span>
          <span className="text-sm text-green-400/60">USDC</span>
        </div>
      </div>

      {/* Wallet Address */}
      {walletAddress && (
        <div className="mb-6 p-3 bg-black/30 border border-green-400/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-green-400/60 mb-1 font-mono">WALLET ADDRESS</p>
              <p className="text-sm text-green-400 font-mono">{formatAddress(walletAddress)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="text-green-400 hover:bg-green-400/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
                className="text-green-400 hover:bg-green-400/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowOnRamp(!showOnRamp)}
          className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
        >
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          ADD_FUNDS
        </Button>
        <Button
          onClick={() => setShowOffRamp(!showOffRamp)}
          variant="outline"
          className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono font-bold"
        >
          <ArrowUpFromLine className="h-4 w-4 mr-2" />
          WITHDRAW
        </Button>
      </div>

      {/* On-Ramp Panel */}
      {showOnRamp && (
        <div className="mt-6 p-4 border-2 border-green-400/50 rounded-lg bg-black/70">
          <OnRampPanel 
            walletAddress={walletAddress} 
            onClose={() => setShowOnRamp(false)}
            onSuccess={() => {
              setShowOnRamp(false)
              refreshBalance()
            }}
          />
        </div>
      )}

      {/* Off-Ramp Panel */}
      {showOffRamp && (
        <div className="mt-6 p-4 border-2 border-green-400/50 rounded-lg bg-black/70">
          <OffRampPanel 
            walletAddress={walletAddress}
            currentBalance={balance}
            onClose={() => setShowOffRamp(false)}
            onSuccess={() => {
              setShowOffRamp(false)
              refreshBalance()
            }}
          />
        </div>
      )}
    </div>
  )
}

// On-Ramp Component
function OnRampPanel({ 
  walletAddress, 
  onClose, 
  onSuccess 
}: { 
  walletAddress: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [amount, setAmount] = useState('25')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle')

  useEffect(() => {
    if (sessionId && status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/zkp2p/onramp/${sessionId}`)
          const data = await res.json()
          
          if (data.status === 'COMPLETED') {
            setStatus('completed')
            clearInterval(interval)
            toast.success('Funds received!')
            setTimeout(() => onSuccess(), 2000)
          } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
            setStatus('failed')
            clearInterval(interval)
            toast.error('Transaction failed')
          }
        } catch (error) {
          console.error('Failed to poll status:', error)
        }
      }, 12000) // Poll every 12 seconds

      return () => clearInterval(interval)
    }
  }, [sessionId, status, onSuccess])

  const handleStartOnRamp = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/zkp2p/onramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUsd: parseFloat(amount), memo })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create session')
      }

      const data = await res.json()
      setSessionId(data.id)
      setPaymentInstructions(data.paymentInstructions)
      setStatus('pending')
      toast.success('On-ramp session created!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start on-ramp')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'completed') {
    return (
      <div className="text-center py-6">
        <div className="mb-4 text-green-400 text-5xl">✓</div>
        <h3 className="text-lg font-bold text-green-400 mb-2 font-mono">FUNDS_RECEIVED</h3>
        <p className="text-sm text-green-400/70">Your wallet has been credited</p>
      </div>
    )
  }

  if (paymentInstructions) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400 font-mono">PAYMENT_INSTRUCTIONS</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-green-400">✕</Button>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="p-3 bg-black/50 border border-green-400/20 rounded">
            <p className="text-xs text-green-400/60 mb-1">METHOD</p>
            <p className="text-sm text-green-400 font-mono">{paymentInstructions.method}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-400/20 rounded">
            <p className="text-xs text-green-400/60 mb-1">RECIPIENT</p>
            <p className="text-sm text-green-400 font-mono">{paymentInstructions.recipientId}</p>
          </div>
          <div className="p-3 bg-black/50 border border-green-400/20 rounded">
            <p className="text-xs text-green-400/60 mb-1">AMOUNT</p>
            <p className="text-sm text-green-400 font-mono">${paymentInstructions.amount}</p>
          </div>
          {paymentInstructions.memo && (
            <div className="p-3 bg-black/50 border border-green-400/20 rounded">
              <p className="text-xs text-green-400/60 mb-1">MEMO (REQUIRED)</p>
              <p className="text-sm text-green-400 font-mono">{paymentInstructions.memo}</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-green-400/10 border border-green-400/30 rounded mb-4">
          <p className="text-xs text-green-400 font-mono">
            ⏳ Waiting for payment... Status will update automatically
          </p>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full border-green-400/50 text-green-400">
          CLOSE
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-400 font-mono">ADD_FUNDS</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-green-400">✕</Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-green-400/70 mb-2 font-mono">AMOUNT (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
            <input
              type="number"
              min="1"
              max="5000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {['10', '25', '50', '100'].map((quick) => (
              <button
                key={quick}
                onClick={() => setAmount(quick)}
                className={`flex-1 px-3 py-1 border font-mono text-sm transition-all ${
                  amount === quick
                    ? 'bg-green-400 text-black border-green-400'
                    : 'bg-black/50 text-green-400 border-green-400/30 hover:border-green-400'
                }`}
              >
                ${quick}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-green-400/70 mb-2 font-mono">MEMO (OPTIONAL)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="e.g., Studio session funds"
            className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
          />
        </div>

        <Button
          onClick={handleStartOnRamp}
          disabled={loading || !amount || parseFloat(amount) < 1}
          className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
        >
          {loading ? 'PROCESSING...' : '> START_ONRAMP'}
        </Button>

        <p className="text-xs text-green-400/40 text-center font-mono">
          Powered by zkp2p • Bank/Venmo/Zelle → USDC
        </p>
      </div>
    </div>
  )
}

// Off-Ramp Component
function OffRampPanel({ 
  walletAddress,
  currentBalance,
  onClose, 
  onSuccess 
}: { 
  walletAddress: string
  currentBalance: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'bank' | 'venmo' | 'paypal'>('bank')
  const [accountInfo, setAccountInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual off-ramp via zkp2p or other provider
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Withdrawal initiated!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate withdrawal')
    } finally {
      setLoading(false)
    }
  }

  const maxAmount = parseFloat(currentBalance)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-400 font-mono">WITHDRAW_FUNDS</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-green-400">✕</Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-green-400/70 mb-2 font-mono">AMOUNT (USDC)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
            <input
              type="number"
              min="1"
              max={maxAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setAmount(currentBalance)}
            className="text-xs text-green-400/60 hover:text-green-400 mt-1 font-mono"
          >
            MAX: ${currentBalance}
          </button>
        </div>

        <div>
          <label className="block text-sm text-green-400/70 mb-2 font-mono">WITHDRAWAL METHOD</label>
          <div className="grid grid-cols-3 gap-2">
            {(['bank', 'venmo', 'paypal'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-2 border font-mono text-sm transition-all ${
                  method === m
                    ? 'bg-green-400 text-black border-green-400'
                    : 'bg-black/50 text-green-400 border-green-400/30 hover:border-green-400'
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-green-400/70 mb-2 font-mono">
            {method === 'bank' ? 'ACCOUNT NUMBER' : `${method.toUpperCase()} USERNAME`}
          </label>
          <input
            type="text"
            value={accountInfo}
            onChange={(e) => setAccountInfo(e.target.value)}
            placeholder={method === 'bank' ? 'Enter account number' : `@${method}username`}
            className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
          />
        </div>

        <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded">
          <p className="text-xs text-yellow-400 font-mono">
            ⚠️ Off-ramp feature coming soon. Currently in development.
          </p>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={loading || !amount || !accountInfo || parseFloat(amount) > maxAmount}
          className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
        >
          {loading ? 'PROCESSING...' : '> INITIATE_WITHDRAWAL'}
        </Button>

        <p className="text-xs text-green-400/40 text-center font-mono">
          Withdrawals typically process within 1-3 business days
        </p>
      </div>
    </div>
  )
}
