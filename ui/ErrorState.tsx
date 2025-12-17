'use client'

import { ReactNode } from 'react'
import { Button } from '@heroui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  icon?: ReactNode
  onRetry?: () => void
  onBack?: () => void
}

export function ErrorState({ 
  title = 'Something went wrong',
  message, 
  icon,
  onRetry,
  onBack
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 p-4 bg-red-500/10 rounded-full text-red-400">
        {icon || <AlertCircle className="h-12 w-12" />}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-zinc-400 max-w-md mb-6">
        {message}
      </p>
      
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button
            color="primary"
            variant="shadow"
            onClick={onRetry}
            radius="md"
          >
            Try Again
          </Button>
        )}
        {onBack && (
          <Button
            variant="bordered"
            onClick={onBack}
            className="border-zinc-700"
            radius="md"
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  )
}
