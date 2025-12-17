'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-12 text-center dark:bg-black/50 bg-white/80">
      <Icon className="h-16 w-16 dark:text-green-400/30 text-green-700/40 mx-auto mb-4" />
      <h3 className="text-lg font-mono font-bold dark:text-green-400 text-green-700 mb-2">
        {title}
      </h3>
      <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-3 justify-center">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
