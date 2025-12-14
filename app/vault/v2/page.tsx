'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VaultV2Redirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to main vault
    router.replace('/vault')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black bg-white">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="font-mono dark:text-green-400 text-green-700">REDIRECTING_TO_VAULT...</p>
      </div>
    </div>
  )
}
