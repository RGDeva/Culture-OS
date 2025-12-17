'use client'

import { ReactNode } from 'react'
import { Button } from '@heroui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-6 p-4 bg-zinc-900 rounded-full text-zinc-500">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-zinc-400 max-w-md mb-6">
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              color="primary"
              variant="shadow"
              onClick={action.onClick}
              radius="md"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="bordered"
              onClick={secondaryAction.onClick}
              className="border-zinc-700"
              radius="md"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
