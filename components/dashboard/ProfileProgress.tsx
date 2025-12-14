'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

interface ProfileProgressProps {
  userId: string
}

interface Progress {
  completeness: number
  connectedPlatforms: number
  networkConnections: number
  nextSteps: {
    label: string
    completed: boolean
    link: string
  }[]
}

export function ProfileProgress({ userId }: ProfileProgressProps) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/dashboard/metrics?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProgress(data.progress)
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-green-400/20 w-1/2 mb-4"></div>
        <div className="h-20 bg-green-400/10 rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-green-400/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!progress) return null

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">&gt; PROFILE_PROGRESS</h2>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-3">
          <div className="text-xs text-green-400/60 font-mono mb-1">PROFILE_COMPLETENESS</div>
          <div className="text-2xl font-bold text-green-400 font-mono">{progress.completeness}%</div>
          <div className="mt-2 h-2 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${progress.completeness}%` }}
            />
          </div>
        </div>

        <div className="bg-black/30 border border-green-400/20 rounded-lg p-3">
          <div className="text-xs text-green-400/60 font-mono mb-1">CONNECTED_PLATFORMS</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{progress.connectedPlatforms}</div>
          <div className="text-xs text-green-400/40 font-mono mt-1">Streaming & social</div>
        </div>

        <div className="bg-black/30 border border-green-400/20 rounded-lg p-3">
          <div className="text-xs text-green-400/60 font-mono mb-1">NETWORK_CONNECTIONS</div>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{progress.networkConnections}</div>
          <div className="text-xs text-green-400/40 font-mono mt-1">Collaborators</div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-2">
        <div className="text-sm font-mono text-green-400/80 mb-3">NEXT_STEPS:</div>
        {progress.nextSteps.map((step, index) => (
          <Link key={index} href={step.link}>
            <div className="flex items-center gap-3 p-3 bg-black/30 border border-green-400/20 rounded-lg hover:bg-green-400/5 transition-colors cursor-pointer">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-green-400/40 flex-shrink-0" />
              )}
              <span className={`text-sm font-mono ${step.completed ? 'text-green-400/60 line-through' : 'text-green-400'}`}>
                {step.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
