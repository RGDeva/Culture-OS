'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestPaymentPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const testPayment = async () => {
    setStatus('loading')
    setResult(null)

    try {
      console.log('🧪 Testing payment API...')
      
      const response = await fetch('/api/x402/checkout-sponsored', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: '1',
          userId: 'test-user-' + Date.now(),
          paymentMethod: 'test'
        }),
      })

      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (response.ok) {
        setStatus('success')
        setResult(data)
      } else {
        setStatus('error')
        setResult(data)
      }
    } catch (error: any) {
      console.error('❌ Error:', error)
      setStatus('error')
      setResult({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl mb-8 border-b border-green-500 pb-4">
          🧪 PAYMENT API TEST
        </h1>

        <div className="space-y-4">
          <Button 
            onClick={testPayment}
            disabled={status === 'loading'}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
          >
            {status === 'loading' ? '⏳ Testing...' : '🚀 Test Payment API'}
          </Button>

          {status === 'loading' && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500">
              <div className="animate-pulse">⏳ Calling API...</div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-green-500/20 border border-green-500">
              <div className="text-2xl mb-2">✅ SUCCESS!</div>
              <div className="text-sm">Payment API is working correctly!</div>
              <pre className="mt-4 p-3 bg-black/50 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/20 border border-red-500">
              <div className="text-2xl mb-2 text-red-400">❌ ERROR</div>
              <pre className="mt-4 p-3 bg-black/50 text-xs overflow-auto text-red-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500">
            <div className="font-bold mb-2">📊 How to Use:</div>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Test Payment API" button</li>
              <li>Watch the console logs</li>
              <li>Should see ✅ SUCCESS with payment details</li>
              <li>Check server logs for confirmation</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-gray-800 border border-gray-700">
            <div className="font-bold mb-2">🔍 What This Tests:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Direct API call to <code>/api/x402/checkout-sponsored</code></li>
              <li>Bypasses any React state or caching issues</li>
              <li>Shows actual API response</li>
              <li>Proves the backend works</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500">
            <div className="font-bold mb-2">🎯 Expected Result:</div>
            <pre className="text-xs mt-2 text-purple-300">
{`{
  "downloadUrl": "/marketplace/play/1",
  "message": "UNLOCK_SUCCESS — You can now access NEON_DREAMS_BEAT"
}`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500">
            <div className="font-bold mb-2">🔧 If You See Error:</div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check server is running</li>
              <li>Check console for details</li>
              <li>Check server logs in terminal</li>
              <li>API endpoint might be down</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-900/20 border border-green-500">
          <div className="font-bold mb-2">✅ Server Logs Should Show:</div>
          <pre className="text-xs">
{`[SPONSORED] Checkout initiated: { productId: '1' }
[SPONSORED] Product found: { id: '1', title: 'NEON_DREAMS_BEAT' }
[SPONSORED] Server wallet processing payment with test ETH...
[SPONSORED] Payment successful (server-sponsored)
POST /api/x402/checkout-sponsored 200 in 1400ms ✅`}
          </pre>
        </div>

        <div className="mt-8 text-center text-sm opacity-50">
          <div>Go back to: <a href="/marketplace" className="underline hover:text-white">Marketplace</a></div>
        </div>
      </div>
    </div>
  )
}
