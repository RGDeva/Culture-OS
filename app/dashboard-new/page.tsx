'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'
import { StatCard } from '@/ui/StatCard'
import { ProjectCard } from '@/ui/ProjectCard'
import { EmptyState } from '@/ui/EmptyState'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Skeleton } from '@heroui/skeleton'
import { Tabs, Tab } from '@heroui/tabs'
import { Avatar } from '@heroui/avatar'
import { Chip } from '@heroui/chip'
import {
  FolderOpen,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Upload,
  ArrowRight,
  FileAudio,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  totalAssets: number
  totalCollaborators: number
  storageUsed: string
}

interface RecentProject {
  id: string
  name: string
  assetCount: number
  collaboratorCount: number
  lastModified: string
  thumbnail?: string
}

interface RecentActivity {
  id: string
  type: 'upload' | 'share' | 'comment' | 'invite'
  user: string
  action: string
  target: string
  timestamp: string
  avatar?: string
}

export default function DashboardNewPage() {
  const { authenticated, user, login } = usePrivy()
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalAssets: 0,
    totalCollaborators: 0,
    storageUsed: '0 GB'
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authenticated) {
      login()
      return
    }
    loadDashboardData()
  }, [authenticated, user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load recent projects
      const projectsResponse = await fetch('/api/vault/projects?limit=6')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setRecentProjects(projectsData.projects || [])
      }

      // Load recent activity
      const activityResponse = await fetch('/api/activity/recent?limit=10')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.activities || [])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="h-4 w-4" />
      case 'share': return <Users className="h-4 w-4" />
      case 'comment': return <AlertCircle className="h-4 w-4" />
      case 'invite': return <Users className="h-4 w-4" />
      default: return <CheckCircle2 className="h-4 w-4" />
    }
  }

  if (!authenticated) {
    return null
  }

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back${user ? `, ${(typeof user.email === 'string' ? user.email : user.email?.address)?.split('@')[0] || 'there'}` : ''}`}
        subtitle="Here's what's happening with your projects"
        primaryAction={{
          label: 'New Project',
          onClick: () => router.push('/vault/new'),
          icon: <Plus className="h-4 w-4" />
        }}
        secondaryActions={[
          {
            label: 'Upload Assets',
            onClick: () => router.push('/vault'),
            icon: <Upload className="h-4 w-4" />
          }
        ]}
      />

      <PageContainer maxWidth="full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-zinc-900 border border-zinc-800" radius="lg">
                  <CardBody className="p-6">
                    <Skeleton className="h-4 w-20 mb-4 rounded" />
                    <Skeleton className="h-8 w-24 mb-2 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </CardBody>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                change={{ value: 12, trend: 'up' }}
                icon={<FolderOpen className="h-5 w-5" />}
                description="Active projects"
              />
              <StatCard
                title="Total Assets"
                value={stats.totalAssets}
                change={{ value: 8, trend: 'up' }}
                icon={<FileAudio className="h-5 w-5" />}
                description="All file types"
              />
              <StatCard
                title="Collaborators"
                value={stats.totalCollaborators}
                icon={<Users className="h-5 w-5" />}
                description="Active members"
              />
              <StatCard
                title="Storage Used"
                value={stats.storageUsed}
                icon={<TrendingUp className="h-5 w-5" />}
                description="Of 100 GB"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
              <Button
                size="sm"
                variant="light"
                endContent={<ArrowRight className="h-4 w-4" />}
                onClick={() => router.push('/vault')}
              >
                View All
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-zinc-900 border border-zinc-800" radius="lg">
                    <CardBody className="p-0">
                      <Skeleton className="h-40 rounded-t-lg" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-3/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
                <CardBody>
                  <EmptyState
                    icon={<FolderOpen className="h-12 w-12" />}
                    title="No projects yet"
                    description="Create your first project to start organizing your assets"
                    action={{
                      label: 'Create Project',
                      onClick: () => router.push('/vault/new')
                    }}
                  />
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    status="active"
                    onClick={() => router.push(`/vault/projects/${project.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>

            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody className="p-0">
                {loading ? (
                  <div className="divide-y divide-zinc-800">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={<Clock className="h-10 w-10" />}
                      title="No activity yet"
                      description="Activity will appear here as you work on projects"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar
                            size="sm"
                            name={activity.user}
                            src={activity.avatar}
                            classNames={{
                              base: "bg-zinc-800 flex-shrink-0",
                              name: "text-zinc-300 text-xs"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <div className="p-1 bg-blue-500/10 rounded text-blue-400">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white">
                                  <span className="font-medium">{activity.user}</span>
                                  {' '}
                                  <span className="text-zinc-400">{activity.action}</span>
                                  {' '}
                                  <span className="font-medium">{activity.target}</span>
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">
                                  {activity.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody className="p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    fullWidth
                    variant="flat"
                    className="justify-start"
                    startContent={<Plus className="h-4 w-4" />}
                    onClick={() => router.push('/vault/new')}
                  >
                    New Project
                  </Button>
                  <Button
                    fullWidth
                    variant="flat"
                    className="justify-start"
                    startContent={<Upload className="h-4 w-4" />}
                    onClick={() => router.push('/vault')}
                  >
                    Upload Assets
                  </Button>
                  <Button
                    fullWidth
                    variant="flat"
                    className="justify-start"
                    startContent={<Users className="h-4 w-4" />}
                    onClick={() => router.push('/network')}
                  >
                    Invite Collaborator
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  )
}
