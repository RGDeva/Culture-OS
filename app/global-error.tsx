'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error caught:', error)
    
    // Handle chunk loading errors specifically
    if (error.name === 'ChunkLoadError') {
      console.log('Chunk loading error detected, reloading page...')
      // Force a full page reload for chunk loading errors
      window.location.reload()
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
            <p className="text-gray-300 mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
              >
                Go to home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
