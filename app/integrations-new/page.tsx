'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'
import { IntegrationCard } from '@/ui/IntegrationCard'
import { EmptyState } from '@/ui/EmptyState'
import { Card, CardBody } from '@heroui/card'
import { Skeleton } from '@heroui/skeleton'
import { Tabs, Tab } from '@heroui/tabs'
import {
  Cloud,
  HardDrive,
  Music,
  Plug,
  Zap,
  Database,
  Globe
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: 'storage' | 'daw' | 'streaming' | 'other'
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
}

export default function IntegrationsNewPage() {
  const { authenticated, user, login } = usePrivy()
  const router = useRouter()

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'storage' | 'daw' | 'streaming' | 'other'>('all')

  useEffect(() => {
    if (!authenticated) {
      login()
      return
    }
    loadIntegrations()
  }, [authenticated, user])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockIntegrations: Integration[] = [
        {
          id: 'google-drive',
          name: 'Google Drive',
          description: 'Import and sync files from your Google Drive',
          category: 'storage',
          status: 'disconnected'
        },
        {
          id: 'fl-studio',
          name: 'FL Studio',
          description: 'Import projects and stems directly from FL Studio',
          category: 'daw',
          status: 'disconnected'
        },
        {
          id: 'dropbox',
          name: 'Dropbox',
          description: 'Sync your creative files with Dropbox',
          category: 'storage',
          status: 'disconnected'
        },
        {
          id: 'ableton',
          name: 'Ableton Live',
          description: 'Connect your Ableton projects and samples',
          category: 'daw',
          status: 'disconnected'
        },
        {
          id: 'soundcloud',
          name: 'SoundCloud',
          description: 'Distribute and track your releases on SoundCloud',
          category: 'streaming',
          status: 'disconnected'
        },
        {
          id: 'spotify',
          name: 'Spotify for Artists',
          description: 'Monitor your Spotify analytics and releases',
          category: 'streaming',
          status: 'disconnected'
        }
      ]

      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (integrationId: string) => {
    if (integrationId === 'google-drive') {
      router.push('/integrations/google-drive')
    } else if (integrationId === 'fl-studio') {
      router.push('/integrations/fl-studio')
    } else {
      console.log('Connect:', integrationId)
    }
  }

  const handleDisconnect = (integrationId: string) => {
    console.log('Disconnect:', integrationId)
  }

  const handleConfigure = (integrationId: string) => {
    console.log('Configure:', integrationId)
  }

  const getIntegrationIcon = (id: string) => {
    const icons: Record<string, JSX.Element> = {
      'google-drive': <Cloud className="h-6 w-6 text-blue-400" />,
      'fl-studio': <Music className="h-6 w-6 text-amber-400" />,
      'dropbox': <Cloud className="h-6 w-6 text-blue-400" />,
      'ableton': <Music className="h-6 w-6 text-purple-400" />,
      'soundcloud': <Globe className="h-6 w-6 text-orange-400" />,
      'spotify': <Globe className="h-6 w-6 text-green-400" />
    }
    return icons[id] || <Plug className="h-6 w-6 text-zinc-400" />
  }

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  )

  const categoryCounts = {
    all: integrations.length,
    storage: integrations.filter(i => i.category === 'storage').length,
    daw: integrations.filter(i => i.category === 'daw').length,
    streaming: integrations.filter(i => i.category === 'streaming').length,
    other: integrations.filter(i => i.category === 'other').length
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  if (!authenticated) {
    return null
  }

  return (
    <AppShell>
      <PageHeader
        title="Integrations"
        subtitle={`${connectedCount} of ${integrations.length} integrations connected`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Integrations' }
        ]}
      />

      <PageContainer maxWidth="xl">
        {/* Overview Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8" radius="lg">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect Your Tools
                </h3>
                <p className="text-sm text-zinc-300 mb-4">
                  Integrate with your favorite tools and services to streamline your workflow. 
                  Import files, sync projects, and distribute your work all from one place.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-2xl font-semibold text-white">{connectedCount}</span>
                    <span className="text-zinc-400 ml-2">Connected</span>
                  </div>
                  <div>
                    <span className="text-2xl font-semibold text-white">{integrations.length - connectedCount}</span>
                    <span className="text-zinc-400 ml-2">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Category Tabs */}
        <div className="mb-6">
          <Tabs
            selectedKey={selectedCategory}
            onSelectionChange={(key) => setSelectedCategory(key as any)}
            classNames={{
              tabList: "bg-zinc-900 border border-zinc-800",
              cursor: "bg-blue-500",
              tab: "text-zinc-400 data-[selected=true]:text-white"
            }}
            radius="md"
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  <span>All</span>
                  <span className="text-xs text-zinc-500">({categoryCounts.all})</span>
                </div>
              }
            />
            <Tab
              key="storage"
              title={
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span>Storage</span>
                  <span className="text-xs text-zinc-500">({categoryCounts.storage})</span>
                </div>
              }
            />
            <Tab
              key="daw"
              title={
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span>DAWs</span>
                  <span className="text-xs text-zinc-500">({categoryCounts.daw})</span>
                </div>
              }
            />
            <Tab
              key="streaming"
              title={
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Streaming</span>
                  <span className="text-xs text-zinc-500">({categoryCounts.streaming})</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-zinc-900 border border-zinc-800" radius="lg">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-32 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-8 w-24 rounded" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <EmptyState
            icon={<Plug className="h-16 w-16" />}
            title="No integrations in this category"
            description="Check back soon for more integrations"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                {...integration}
                icon={getIntegrationIcon(integration.id)}
                onConnect={() => handleConnect(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
                onConfigure={() => handleConfigure(integration.id)}
              />
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Logic Pro', 'Pro Tools', 'Apple Music', 'YouTube Music', 'OneDrive', 'Box'].map((name) => (
              <Card key={name} className="bg-zinc-900/50 border border-zinc-800/50" radius="lg">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <Database className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-400">{name}</p>
                      <p className="text-xs text-zinc-600">Coming soon</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </AppShell>
  )
}
