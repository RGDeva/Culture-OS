'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/ui/AppShell'
import { PageHeader } from '@/ui/PageHeader'
import { PageContainer } from '@/ui/PageContainer'
import { AssetCard } from '@/ui/AssetCard'
import { EmptyState } from '@/ui/EmptyState'
import { FileUpload } from '@/ui/FileUpload'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Tabs, Tab } from '@heroui/tabs'
import { Chip } from '@heroui/chip'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown'
import { Skeleton } from '@heroui/skeleton'
import { 
  Upload, 
  FolderOpen, 
  Search, 
  Filter, 
  Grid3x3, 
  List,
  ChevronDown,
  SortAsc,
  Plus,
  HardDrive,
  Cloud
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: string
  size: string
  thumbnail?: string
  tags: string[]
  lastModified: string
  folderId?: string
}

export default function VaultNewPage() {
  const { authenticated, user, login } = usePrivy()
  const router = useRouter()
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadSource, setUploadSource] = useState<'computer' | 'drive' | 'flstudio' | null>(null)

  useEffect(() => {
    if (!authenticated) {
      login()
      return
    }
    loadAssets()
  }, [authenticated, user])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vault/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleUploadSource = (source: 'computer' | 'drive' | 'flstudio') => {
    setUploadSource(source)
    if (source === 'drive') {
      router.push('/vault/integrations/google-drive')
    } else if (source === 'flstudio') {
      router.push('/vault/integrations/fl-studio')
    }
  }

  const handleFilesSelected = async (files: File[]) => {
    console.log('Files selected:', files)
    // Handle file upload logic here
    setShowUploadModal(false)
    setUploadSource(null)
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || asset.type.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  if (!authenticated) {
    return null
  }

  return (
    <AppShell>
      <PageHeader
        title="Vault"
        subtitle={`${assets.length} assets across all projects`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Vault' }
        ]}
        primaryAction={{
          label: 'Import',
          onClick: handleUploadClick,
          icon: <Upload className="h-4 w-4" />
        }}
        secondaryActions={[
          {
            label: 'New Project',
            onClick: () => router.push('/vault/new'),
            icon: <Plus className="h-4 w-4" />
          }
        ]}
      />

      <PageContainer maxWidth="full">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="h-4 w-4 text-zinc-500" />}
              classNames={{
                inputWrapper: "bg-zinc-900 border-zinc-800"
              }}
              radius="md"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              placeholder="Filter by type"
              selectedKeys={[selectedFilter]}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-40"
              classNames={{
                trigger: "bg-zinc-900 border-zinc-800"
              }}
              radius="md"
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              <SelectItem key="audio" value="audio">Audio</SelectItem>
              <SelectItem key="video" value="video">Video</SelectItem>
              <SelectItem key="image" value="image">Image</SelectItem>
              <SelectItem key="document" value="document">Document</SelectItem>
            </Select>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="border-zinc-800"
                  endContent={<ChevronDown className="h-4 w-4" />}
                  radius="md"
                >
                  <SortAsc className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                onAction={(key) => setSortBy(key as string)}
              >
                <DropdownItem key="date">Date Modified</DropdownItem>
                <DropdownItem key="name">Name</DropdownItem>
                <DropdownItem key="size">Size</DropdownItem>
                <DropdownItem key="type">Type</DropdownItem>
              </DropdownMenu>
            </Dropdown>

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
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Chip size="sm" variant="flat" className="bg-zinc-800">All</Chip>
          <Chip size="sm" variant="flat" className="bg-zinc-900">Masters</Chip>
          <Chip size="sm" variant="flat" className="bg-zinc-900">Stems</Chip>
          <Chip size="sm" variant="flat" className="bg-zinc-900">Samples</Chip>
          <Chip size="sm" variant="flat" className="bg-zinc-900">Projects</Chip>
        </div>

        {/* Content */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
          }>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-16 w-16" />}
            title={searchQuery ? 'No assets found' : 'No assets yet'}
            description={searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Upload your first asset to get started with your vault'
            }
            action={{
              label: 'Import Assets',
              onClick: handleUploadClick
            }}
            secondaryAction={{
              label: 'Create Project',
              onClick: () => router.push('/vault/new')
            }}
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
          }>
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                {...asset}
                onClick={() => console.log('View asset:', asset.id)}
                onDownload={() => console.log('Download:', asset.id)}
                onShare={() => console.log('Share:', asset.id)}
                onDelete={() => console.log('Delete:', asset.id)}
              />
            ))}
          </div>
        )}
      </PageContainer>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          setUploadSource(null)
        }}
        size="2xl"
        backdrop="blur"
        classNames={{
          base: "bg-zinc-950 border border-zinc-800",
          header: "border-b border-zinc-800",
          body: "py-6",
          footer: "border-t border-zinc-800"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">Import Assets</h2>
          </ModalHeader>
          <ModalBody>
            {!uploadSource ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400 mb-4">
                  Choose where to import your assets from
                </p>
                
                <Button
                  fullWidth
                  variant="bordered"
                  className="border-zinc-800 justify-start h-auto py-4"
                  onClick={() => handleUploadSource('computer')}
                  radius="lg"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <HardDrive className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">From Computer</div>
                      <div className="text-xs text-zinc-500">Upload files from your device</div>
                    </div>
                  </div>
                </Button>

                <Button
                  fullWidth
                  variant="bordered"
                  className="border-zinc-800 justify-start h-auto py-4"
                  onClick={() => handleUploadSource('drive')}
                  radius="lg"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <Cloud className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">Google Drive</div>
                      <div className="text-xs text-zinc-500">Import from Google Drive</div>
                    </div>
                  </div>
                </Button>

                <Button
                  fullWidth
                  variant="bordered"
                  className="border-zinc-800 justify-start h-auto py-4"
                  onClick={() => handleUploadSource('flstudio')}
                  radius="lg"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Upload className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">FL Studio</div>
                      <div className="text-xs text-zinc-500">Import from FL Studio Beta</div>
                    </div>
                  </div>
                </Button>
              </div>
            ) : uploadSource === 'computer' ? (
              <FileUpload
                accept="audio/*,video/*,image/*,.zip,.rar,.flp"
                multiple
                maxSize={500 * 1024 * 1024}
                onFilesSelected={handleFilesSelected}
              />
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => {
                setShowUploadModal(false)
                setUploadSource(null)
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppShell>
  )
}
