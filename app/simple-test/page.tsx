'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SimpleTestPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const testPayment = async () => {
    setStatus('loading')
    setResult(null)

    try {
      console.log('🧪 Testing payment...')
      
      const response = await fetch('/api/x402/checkout-sponsored', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: '1',
          userId: 'test-' + Date.now(),
          paymentMethod: 'test'
        }),
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        setStatus('success')
        setResult(data)
      } else {
        setStatus('error')
        setResult(data)
      }
    } catch (error: any) {
      console.error('Error:', error)
      setStatus('error')
      setResult({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl border-b border-green-500 pb-2">
          SIMPLE PAYMENT TEST
        </h1>

        <Button 
          onClick={testPayment}
          disabled={status === 'loading'}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-lg py-6"
        >
          {status === 'loading' ? 'TESTING...' : 'TEST PAYMENT'}
        </Button>

        {status === 'loading' && (
          <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-400">
            ⏳ Testing API...
          </div>
        )}

        {status === 'success' && (
          <div className="p-4 bg-green-500/20 border border-green-500">
            <div className="text-xl mb-2">✅ SUCCESS!</div>
            <pre className="text-xs overflow-auto bg-black/50 p-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-500/20 border border-red-500 text-red-400">
            <div className="text-xl mb-2">❌ ERROR</div>
            <pre className="text-xs overflow-auto bg-black/50 p-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm opacity-70">
          This page loads FAST because it doesn't call /api/user/me
        </div>
      </div>
    </div>
  )
}
