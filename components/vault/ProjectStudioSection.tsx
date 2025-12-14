'use client'

import { Studio } from '@/types/project'

interface ProjectStudioSectionProps {
  hostStudioId: string | null | undefined
  openToStudioProposals: boolean
  studios: Studio[]
  onHostStudioChange: (studioId: string | null) => void
  onOpenToProposalsChange: (open: boolean) => void
}

export function ProjectStudioSection({
  hostStudioId,
  openToStudioProposals,
  studios,
  onHostStudioChange,
  onOpenToProposalsChange,
}: ProjectStudioSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold font-mono text-green-400 dark:text-green-400 light:text-gray-900">
        &gt; STUDIO_ASSOCIATION
      </h3>

      {/* Studio Selection */}
      <div>
        <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
          HOST_STUDIO (optional)
        </label>
        <select
          value={hostStudioId || ''}
          onChange={(e) => onHostStudioChange(e.target.value || null)}
          className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
        >
          <option value="">Independent / No Studio</option>
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name} {studio.location ? `(${studio.location})` : ''}
              {studio.verified ? ' ✓' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-green-400/50 dark:text-green-400/50 light:text-gray-500 font-mono mt-1">
          // Select a studio if this project is based at or partnered with one
        </p>
      </div>

      {/* Open to Studio Proposals */}
      <div className="flex items-start gap-3 p-4 border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 bg-black/10 dark:bg-black/10 light:bg-gray-50">
        <input
          type="checkbox"
          id="openToStudioProposals"
          checked={openToStudioProposals}
          onChange={(e) => onOpenToProposalsChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-600 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600"
        />
        <div className="flex-1">
          <label
            htmlFor="openToStudioProposals"
            className="font-mono text-sm text-green-400 dark:text-green-400 light:text-gray-900 font-bold cursor-pointer"
          >
            OPEN_TO_STUDIO_PROPOSALS
          </label>
          <p className="text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
            Allow studios to propose packages or partnerships for this project
          </p>
        </div>
      </div>
    </div>
  )
}
