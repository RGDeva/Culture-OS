'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'
import { ProjectCard } from '@/ui/ProjectCard'
import { EmptyState } from '@/ui/EmptyState'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Tabs, Tab } from '@heroui/tabs'
import { Skeleton } from '@heroui/skeleton'
import { Card, CardBody } from '@heroui/card'
import {
  Plus,
  Search,
  Grid3x3,
  List,
  FolderOpen,
  Archive,
  FileText
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  assetCount: number
  collaboratorCount: number
  lastModified: string
  status: 'active' | 'archived' | 'draft'
  collaborators: Array<{ name: string; avatar?: string }>
}

export default function ProjectsNewPage() {
  const { authenticated, user, login } = usePrivy()
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived' | 'draft'>('all')
  const [selectedTab, setSelectedTab] = useState('all')

  useEffect(() => {
    if (!authenticated) {
      login()
      return
    }
    loadProjects()
  }, [authenticated, user])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vault/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    router.push('/vault/new')
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const projectCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    archived: projects.filter(p => p.status === 'archived').length,
    draft: projects.filter(p => p.status === 'draft').length
  }

  if (!authenticated) {
    return null
  }

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        subtitle={`${filteredProjects.length} projects`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects' }
        ]}
        primaryAction={{
          label: 'New Project',
          onClick: handleCreateProject,
          icon: <Plus className="h-4 w-4" />
        }}
      />

      <PageContainer maxWidth="full">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => {
              setSelectedTab(key as string)
              setFilterStatus(key as any)
            }}
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
                  <FolderOpen className="h-4 w-4" />
                  <span>All Projects</span>
                  <span className="text-xs text-zinc-500">({projectCounts.all})</span>
                </div>
              }
            />
            <Tab
              key="active"
              title={
                <div className="flex items-center gap-2">
                  <span>Active</span>
                  <span className="text-xs text-zinc-500">({projectCounts.active})</span>
                </div>
              }
            />
            <Tab
              key="draft"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Drafts</span>
                  <span className="text-xs text-zinc-500">({projectCounts.draft})</span>
                </div>
              }
            />
            <Tab
              key="archived"
              title={
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span>Archived</span>
                  <span className="text-xs text-zinc-500">({projectCounts.archived})</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="h-4 w-4 text-zinc-500" />}
              classNames={{
                inputWrapper: "bg-zinc-900 border-zinc-800"
              }}
              radius="md"
            />
          </div>

          <div className="flex border border-zinc-800 rounded-lg overflow-hidden">
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? 'flat' : 'light'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-zinc-800' : ''}
              radius="none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === 'list' ? 'flat' : 'light'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-zinc-800' : ''}
              radius="none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
          }>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-zinc-900 border border-zinc-800" radius="lg">
                <CardBody className="p-0">
                  <Skeleton className="h-48 rounded-t-lg" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-16 w-16" />}
            title={searchQuery ? 'No projects found' : 'No projects yet'}
            description={searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first project to start organizing your creative work'
            }
            action={{
              label: 'Create Project',
              onClick: handleCreateProject
            }}
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onClick={() => router.push(`/vault/projects/${project.id}`)}
                onEdit={() => console.log('Edit:', project.id)}
                onArchive={() => console.log('Archive:', project.id)}
                onDelete={() => console.log('Delete:', project.id)}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  )
}
