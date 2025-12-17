'use client'

import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'
import { StatCard } from '@/ui/StatCard'
import { AssetCard } from '@/ui/AssetCard'
import { ProjectCard } from '@/ui/ProjectCard'
import { IntegrationCard } from '@/ui/IntegrationCard'
import { EmptyState } from '@/ui/EmptyState'
import { LoadingState } from '@/ui/LoadingState'
import { ErrorState } from '@/ui/ErrorState'
import { FileUpload } from '@/ui/FileUpload'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Tabs, Tab } from '@heroui/tabs'
import { 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Cloud,
  Music,
  AlertCircle
} from 'lucide-react'

export default function DesignSystemDemo() {
  return (
    <AppShell>
      <PageHeader
        title="Design System Demo"
        subtitle="Showcase of all UI components"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Design System' }
        ]}
        primaryAction={{
          label: 'Primary Action',
          onClick: () => alert('Primary action clicked'),
          icon: <Plus className="h-4 w-4" />
        }}
        secondaryActions={[
          {
            label: 'Secondary',
            onClick: () => alert('Secondary action clicked')
          }
        ]}
      />

      <PageContainer maxWidth="full">
        <div className="space-y-12">
          {/* Stat Cards */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Stat Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Projects"
                value="1,234"
                change={{ value: 12, trend: 'up' }}
                icon={<FolderOpen className="h-5 w-5" />}
                description="Active projects"
              />
              <StatCard
                title="Collaborators"
                value="56"
                change={{ value: 8, trend: 'up' }}
                icon={<Users className="h-5 w-5" />}
                description="Team members"
              />
              <StatCard
                title="Storage Used"
                value="45.2 GB"
                icon={<TrendingUp className="h-5 w-5" />}
                description="Of 100 GB"
              />
              <StatCard
                title="Assets"
                value="8,492"
                change={{ value: 5, trend: 'down' }}
                icon={<FolderOpen className="h-5 w-5" />}
                description="All file types"
              />
            </div>
          </section>

          {/* Asset Cards */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Asset Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AssetCard
                id="1"
                name="track-final-master.wav"
                type="Audio"
                size="24.5 MB"
                tags={['master', 'final', 'approved']}
                lastModified="2 hours ago"
                onDownload={() => alert('Download')}
                onShare={() => alert('Share')}
                onDelete={() => alert('Delete')}
              />
              <AssetCard
                id="2"
                name="cover-art-v3.png"
                type="Image"
                size="2.1 MB"
                tags={['artwork', 'final']}
                lastModified="1 day ago"
                onDownload={() => alert('Download')}
              />
              <AssetCard
                id="3"
                name="project-stems.zip"
                type="Archive"
                size="156 MB"
                tags={['stems', 'backup']}
                lastModified="3 days ago"
              />
            </div>
          </section>

          {/* Project Cards */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Project Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProjectCard
                id="1"
                name="Summer EP 2024"
                description="5-track EP with collaborators from LA and NYC"
                assetCount={45}
                collaboratorCount={3}
                lastModified="2 hours ago"
                status="active"
                collaborators={[
                  { name: 'John Doe' },
                  { name: 'Jane Smith' },
                  { name: 'Mike Johnson' }
                ]}
                onClick={() => alert('View project')}
              />
              <ProjectCard
                id="2"
                name="Album Artwork"
                description="Visual assets for upcoming album release"
                assetCount={28}
                collaboratorCount={2}
                lastModified="1 day ago"
                status="draft"
                collaborators={[
                  { name: 'Designer 1' },
                  { name: 'Designer 2' }
                ]}
              />
              <ProjectCard
                id="3"
                name="Archive 2023"
                description="Archived projects from last year"
                assetCount={156}
                collaboratorCount={5}
                lastModified="3 months ago"
                status="archived"
                collaborators={[]}
              />
            </div>
          </section>

          {/* Integration Cards */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Integration Cards</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IntegrationCard
                id="google-drive"
                name="Google Drive"
                description="Import and sync files from your Google Drive"
                icon={<Cloud className="h-6 w-6 text-blue-400" />}
                status="connected"
                lastSync="5 minutes ago"
                onDisconnect={() => alert('Disconnect')}
                onConfigure={() => alert('Configure')}
              />
              <IntegrationCard
                id="fl-studio"
                name="FL Studio"
                description="Import projects and stems directly from FL Studio"
                icon={<Music className="h-6 w-6 text-amber-400" />}
                status="disconnected"
                onConnect={() => alert('Connect')}
              />
              <IntegrationCard
                id="error-integration"
                name="Error Integration"
                description="This integration has encountered an error"
                icon={<AlertCircle className="h-6 w-6 text-red-400" />}
                status="error"
                onConnect={() => alert('Reconnect')}
              />
            </div>
          </section>

          {/* Empty State */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Empty State</h2>
            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody>
                <EmptyState
                  icon={<FolderOpen className="h-16 w-16" />}
                  title="No projects yet"
                  description="Create your first project to start organizing your creative work"
                  action={{
                    label: 'Create Project',
                    onClick: () => alert('Create project')
                  }}
                  secondaryAction={{
                    label: 'Learn More',
                    onClick: () => alert('Learn more')
                  }}
                />
              </CardBody>
            </Card>
          </section>

          {/* Loading State */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Loading State</h2>
            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody>
                <LoadingState message="Loading your projects..." />
              </CardBody>
            </Card>
          </section>

          {/* Error State */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Error State</h2>
            <Card className="bg-zinc-900 border border-zinc-800" radius="lg">
              <CardBody>
                <ErrorState
                  title="Failed to load projects"
                  message="We couldn't load your projects. Please check your connection and try again."
                  onRetry={() => alert('Retry')}
                  onBack={() => alert('Go back')}
                />
              </CardBody>
            </Card>
          </section>

          {/* File Upload */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">File Upload</h2>
            <FileUpload
              accept="audio/*,video/*,image/*"
              multiple
              maxSize={100 * 1024 * 1024}
              onFilesSelected={(files) => console.log('Files:', files)}
            />
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button color="primary" variant="shadow" radius="md">
                Primary Shadow
              </Button>
              <Button color="primary" variant="solid" radius="md">
                Primary Solid
              </Button>
              <Button variant="bordered" className="border-zinc-700" radius="md">
                Bordered
              </Button>
              <Button variant="flat" radius="md">
                Flat
              </Button>
              <Button variant="light" radius="md">
                Light
              </Button>
              <Button color="success" variant="shadow" radius="md">
                Success
              </Button>
              <Button color="warning" variant="shadow" radius="md">
                Warning
              </Button>
              <Button color="danger" variant="shadow" radius="md">
                Danger
              </Button>
            </div>
          </section>

          {/* Tabs */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Tabs</h2>
            <Tabs
              classNames={{
                tabList: "bg-zinc-900 border border-zinc-800",
                cursor: "bg-blue-500",
                tab: "text-zinc-400 data-[selected=true]:text-white"
              }}
              radius="md"
            >
              <Tab key="all" title="All Projects" />
              <Tab key="active" title="Active" />
              <Tab key="archived" title="Archived" />
            </Tabs>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  )
}
