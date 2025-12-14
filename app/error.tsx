'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)

    // If it's a chunk loading error, force a full page reload after a short delay
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      console.log('Chunk loading error detected, reloading page in 1 second...')
      const timer = setTimeout(() => {
        window.location.reload()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              // Attempt to recover by trying to re-render the segment
              reset()
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            Go to home
          </button>
        </div>
      </div>
    </div>
  )
}
