'use client'

import { ReactNode } from 'react'
import { Card, CardBody } from '@heroui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: ReactNode
  description?: string
}

export function StatCard({ title, value, change, icon, description }: StatCardProps) {
  return (
    <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-medium text-zinc-400">{title}</div>
          {icon && (
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold text-white mb-1">{value}</div>
            {description && (
              <div className="text-xs text-zinc-500">{description}</div>
            )}
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              change.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {change.trend === 'up' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
