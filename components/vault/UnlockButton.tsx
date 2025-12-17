'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Lock, Download } from 'lucide-react'
import { Button } from '@heroui/button'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal'
import { Spinner } from '@heroui/spinner'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'

interface UnlockButtonProps {
  assetId: string
  assetName: string
  onUnlocked?: () => void
}

interface UnlockStatus {
  isPaid: boolean
  hasEntitlement: boolean
  priceCents: number | null
  currency: string
  receiverAddress: string
}

export function UnlockButton({
  assetId,
  assetName,
  onUnlocked
}: UnlockButtonProps) {
  const { authenticated, user, login, connectWallet } = usePrivy()
  const [status, setStatus] = useState<UnlockStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentChallenge, setPaymentChallenge] = useState<any>(null)

  // Load unlock status
  useEffect(() => {
    fetch(`/api/vault/assets/${assetId}/unlock-status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(err => console.error('Failed to load unlock status:', err))
  }, [assetId])

  async function handleDownload() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/vault/assets/${assetId}/download`)

      if (response.status === 401) {
        setError('Please sign in to download')
        setLoading(false)
        return
      }

      if (response.status === 402) {
        // Payment required
        const data = await response.json()
        setPaymentChallenge(data.payment)
        setShowPaymentModal(true)
        setLoading(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.downloadUrl) {
          // Redirect to signed URL
          window.location.href = data.downloadUrl
          onUnlocked?.()
        } else {
          setError('Invalid response from server')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to download')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    setLoading(true)
    setError(null)

    try {
      if (!paymentChallenge) {
        setError('Payment challenge not loaded')
        setLoading(false)
        return
      }

      // Get wallet address from Privy
      const walletAddress = user?.wallet?.address
      if (!walletAddress) {
        setError('Wallet not connected')
        setLoading(false)
        return
      }

      // TODO: Implement real Coinbase x402 client payment flow
      // For production, use official Coinbase x402 SDK:
      // 1. Import x402 client library
      // 2. Initialize with payment challenge
      // 3. Request user to approve USDC transfer in wallet
      // 4. Submit transaction to Base network
      // 5. Wait for confirmation
      // 6. Get transaction hash
      
      // For MVP, we'll simulate the payment
      // In production, replace this with:
      // const x402Client = new X402Client()
      // const tx = await x402Client.pay(paymentChallenge)
      // const txHash = tx.hash

      console.log('[x402] Payment challenge:', paymentChallenge)
      console.log('[x402] Wallet address:', walletAddress)

      // Simulated payment - replace with real x402 flow
      const paymentData = {
        transactionHash: '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        amount: paymentChallenge.amount,
        currency: paymentChallenge.currency,
        network: paymentChallenge.network,
        recipient: paymentChallenge.recipient,
        idempotencyKey: `${assetId}-${Date.now()}`
      }

      console.log('[x402] Submitting payment:', paymentData)

      // Retry download with payment authorization
      const response = await fetch(`/api/vault/assets/${assetId}/download`, {
        headers: {
          'X-Payment-Authorization': JSON.stringify(paymentData)
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.downloadUrl) {
          // Payment accepted - redirect to signed URL
          setShowPaymentModal(false)
          window.location.href = data.downloadUrl
          onUnlocked?.()
          
          // Refresh status
          fetch(`/api/vault/assets/${assetId}/unlock-status`)
            .then(r => r.json())
            .then(setStatus)
        } else {
          setError('Invalid response from server')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Payment verification failed')
      }
    } catch (err) {
      console.error('[x402] Payment error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (!status) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Spinner size="sm" color="default" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  // Free asset or has entitlement - show download button
  if (!status.isPaid || status.hasEntitlement) {
    return (
      <Button
        color="primary"
        variant="shadow"
        size="lg"
        startContent={loading ? <Spinner size="sm" color="current" /> : <Download className="h-5 w-5" />}
        onClick={handleDownload}
        isLoading={loading}
        className="font-semibold"
        radius="md"
      >
        {loading ? 'Downloading...' : 'Download'}
      </Button>
    )
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <Button
        color="default"
        variant="bordered"
        size="lg"
        startContent={<Lock className="h-5 w-5" />}
        onClick={login}
        className="font-semibold border-zinc-700 hover:border-zinc-500"
        radius="md"
      >
        Sign in to unlock
      </Button>
    )
  }

  // No wallet connected
  const hasWallet = user?.wallet?.address
  if (!hasWallet) {
    return (
      <Button
        color="default"
        variant="bordered"
        size="lg"
        startContent={<Lock className="h-5 w-5" />}
        onClick={connectWallet}
        className="font-semibold border-zinc-700 hover:border-zinc-500"
        radius="md"
      >
        Connect wallet to unlock
      </Button>
    )
  }

  // Paid asset, needs payment
  const price = status.priceCents ? (status.priceCents / 100).toFixed(2) : '0.00'

  return (
    <>
      <Button
        color="primary"
        variant="shadow"
        size="lg"
        startContent={loading ? <Spinner size="sm" color="current" /> : <Lock className="h-5 w-5" />}
        onClick={handleDownload}
        isLoading={loading}
        className="font-semibold"
        radius="md"
      >
        {loading ? 'Processing...' : `Unlock with ${price} ${status.currency}`}
      </Button>

      {error && (
        <Chip color="danger" variant="flat" className="mt-2" radius="sm">
          {error}
        </Chip>
      )}

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        size="md"
        backdrop="blur"
        isDismissable={!loading}
        hideCloseButton={loading}
        classNames={{
          base: "bg-zinc-950 border border-zinc-800",
          header: "border-b border-zinc-800",
          body: "py-6",
          footer: "border-t border-zinc-800"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 items-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Unlock Asset</h2>
            <p className="text-zinc-400 text-sm font-normal">{assetName}</p>
          </ModalHeader>
          <ModalBody>
            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400">Price</span>
                  <span className="text-2xl font-semibold text-white">
                    {paymentChallenge?.amount} {paymentChallenge?.currency}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Instant unlock • Secure payment on Base
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  Network: {paymentChallenge?.network}
                </p>
              </CardBody>
            </Card>

            {error && (
              <Chip color="danger" variant="flat" className="w-full" radius="sm">
                {error}
              </Chip>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-col gap-2">
            <Button
              color="primary"
              variant="shadow"
              size="lg"
              fullWidth
              onClick={handlePayment}
              isLoading={loading}
              className="font-semibold"
              radius="md"
            >
              {loading ? 'Processing Payment...' : `Pay ${paymentChallenge?.amount} ${paymentChallenge?.currency}`}
            </Button>
            <Button
              variant="bordered"
              size="lg"
              fullWidth
              onClick={() => setShowPaymentModal(false)}
              isDisabled={loading}
              className="border-zinc-700 text-zinc-300 hover:border-zinc-500"
              radius="md"
            >
              Cancel
            </Button>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Powered by Coinbase x402
            </p>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
