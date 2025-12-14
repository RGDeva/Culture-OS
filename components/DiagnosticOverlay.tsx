'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function DiagnosticOverlay() {
  const [show, setShow] = useState(false)
  const { user, authenticated, ready } = usePrivy()
  
  useEffect(() => {
    // Show diagnostic after 3 seconds if page seems stuck
    const timer = setTimeout(() => {
      setShow(true)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 border-2 border-green-400 p-4 max-w-sm text-xs font-mono text-green-400">
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold">DIAGNOSTIC</span>
        <button onClick={() => setShow(false)} className="text-green-400 hover:text-green-300">
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <div>Privy Ready: {ready ? '✓' : '✗'}</div>
        <div>Authenticated: {authenticated ? '✓' : '✗'}</div>
        <div>User ID: {user?.id || 'none'}</div>
        <div>Window: {typeof window !== 'undefined' ? '✓' : '✗'}</div>
        <div>Document: {typeof document !== 'undefined' ? '✓' : '✗'}</div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full bg-green-400 text-black px-3 py-1 hover:bg-green-300"
      >
        RELOAD
      </button>
    </div>
  )
}
