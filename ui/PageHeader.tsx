'use client'

import { ReactNode } from 'react'
import { Button } from '@heroui/button'
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void
    icon?: ReactNode
  }>
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions
}: PageHeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-16 z-20">
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            size="sm"
            classNames={{
              list: "text-zinc-500"
            }}
            className="mb-3"
          >
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index} href={crumb.href}>
                {crumb.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        )}

        {/* Title and actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white mb-1 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {(primaryAction || secondaryActions) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {secondaryActions?.map((action, index) => (
                <Button
                  key={index}
                  variant="bordered"
                  onClick={action.onClick}
                  startContent={action.icon}
                  className="border-zinc-700"
                  radius="md"
                >
                  {action.label}
                </Button>
              ))}
              {primaryAction && (
                <Button
                  color="primary"
                  variant="shadow"
                  onClick={primaryAction.onClick}
                  startContent={primaryAction.icon}
                  radius="md"
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
