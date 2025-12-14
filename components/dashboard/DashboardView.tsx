'use client'

import { MySnapshot } from './MySnapshot'
import { ConnectedProfiles } from './ConnectedProfiles'
import { ProfileProgress } from './ProfileProgress'
import { QuickActions } from './QuickActions'

interface DashboardViewProps {
  userId: string
}

export function DashboardView({ userId }: DashboardViewProps) {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Row: Snapshot + Connected Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MySnapshot userId={userId} />
        </div>
        <div>
          <ConnectedProfiles userId={userId} />
        </div>
      </div>

      {/* Middle Row: Profile Progress */}
      <ProfileProgress userId={userId} />

      {/* Bottom Row: Quick Actions */}
      <QuickActions />
    </div>
  )
}
