'use client'

import { User, Building2, Star } from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/types/profile'
import { calculateXpTier, getTierInfo } from '@/lib/xp-system'

interface ProjectOwnerStripProps {
  owner: Profile
  studioName?: string
  onClick?: () => void
}

export function ProjectOwnerStrip({ owner, studioName, onClick }: ProjectOwnerStripProps) {
  const xp = owner.xp || 0
  const tier = calculateXpTier(xp)
  const tierInfo = getTierInfo(tier)

  const content = (
    <div className="flex items-center gap-4 p-4 border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 bg-black/20 dark:bg-black/20 light:bg-white hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 transition-all cursor-pointer">
      {/* User Icon */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 border-2 border-green-400 dark:border-green-400 light:border-green-600 flex items-center justify-center">
          <User className="h-6 w-6 text-green-400 dark:text-green-400 light:text-green-700" />
        </div>
      </div>

      {/* Owner Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm text-green-400/70 dark:text-green-400/70 light:text-gray-600">
            CREATED_BY:
          </span>
          <span className="font-mono text-base text-green-400 dark:text-green-400 light:text-gray-900 font-bold">
            {owner.displayName}
          </span>
          {/* XP Tier Badge */}
          <span className={`px-2 py-0.5 text-[10px] font-bold ${tierInfo.bgColor} ${tierInfo.color} ${tierInfo.borderColor} border`}>
            {tierInfo.label}
          </span>
        </div>

        {/* Roles */}
        {owner.roles && owner.roles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {owner.roles.slice(0, 3).map((role) => (
              <span
                key={role}
                className="text-[10px] px-2 py-0.5 border border-cyan-400 dark:border-cyan-400 light:border-cyan-600 text-cyan-400 dark:text-cyan-400 light:text-cyan-700 font-mono"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Studio Association */}
        {studioName && (
          <div className="flex items-center gap-1 text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono">
            <Building2 className="h-3 w-3" />
            <span>BASED_AT: {studioName}</span>
          </div>
        )}

        {/* XP */}
        <div className="flex items-center gap-1 text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
          <Star className="h-3 w-3" />
          <span>{xp} XP</span>
        </div>
      </div>

      {/* View Profile Arrow */}
      <div className="flex-shrink-0">
        <div className="text-green-400 dark:text-green-400 light:text-green-700 font-mono text-sm">
          &gt;
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link href={`/network?userId=${owner.id}`} className="block">
      {content}
    </Link>
  )
}
