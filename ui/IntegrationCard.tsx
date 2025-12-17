'use client'

import { ReactNode } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface IntegrationCardProps {
  id: string
  name: string
  description: string
  icon: ReactNode
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onConfigure?: () => void
}

export function IntegrationCard({
  id,
  name,
  description,
  icon,
  status,
  lastSync,
  onConnect,
  onDisconnect,
  onConfigure
}: IntegrationCardProps) {
  const statusConfig = {
    connected: {
      color: 'success' as const,
      label: 'Connected',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />
    },
    disconnected: {
      color: 'default' as const,
      label: 'Not Connected',
      icon: <AlertCircle className="h-3.5 w-3.5" />
    },
    error: {
      color: 'danger' as const,
      label: 'Error',
      icon: <AlertCircle className="h-3.5 w-3.5" />
    }
  }

  const config = statusConfig[status]

  return (
    <Card className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors" radius="lg">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-3 bg-zinc-800 rounded-lg flex-shrink-0">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-white">
                {name}
              </h3>
              <Chip
                size="sm"
                color={config.color}
                variant="flat"
                startContent={config.icon}
                radius="sm"
              >
                {config.label}
              </Chip>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              {description}
            </p>

            {/* Last sync */}
            {lastSync && status === 'connected' && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-4">
                <Clock className="h-3.5 w-3.5" />
                <span>Last synced {lastSync}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {status === 'connected' ? (
                <>
                  {onConfigure && (
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={onConfigure}
                      radius="md"
                    >
                      Configure
                    </Button>
                  )}
                  {onDisconnect && (
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={onDisconnect}
                      className="border-zinc-700"
                      radius="md"
                    >
                      Disconnect
                    </Button>
                  )}
                </>
              ) : (
                onConnect && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="shadow"
                    onClick={onConnect}
                    radius="md"
                  >
                    Connect
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
