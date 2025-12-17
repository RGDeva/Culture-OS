'use client'

import { ReactNode } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown'
import { Button } from '@heroui/button'
import { MoreVertical, Download, Share2, Trash2, FileText } from 'lucide-react'
import { Chip } from '@heroui/chip'

interface AssetCardProps {
  id: string
  name: string
  type: string
  size?: string
  thumbnail?: string
  tags?: string[]
  lastModified?: string
  onDownload?: () => void
  onShare?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export function AssetCard({
  id,
  name,
  type,
  size,
  thumbnail,
  tags,
  lastModified,
  onDownload,
  onShare,
  onDelete,
  onClick
}: AssetCardProps) {
  return (
    <Card 
      isPressable={!!onClick}
      onPress={onClick}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
      radius="lg"
    >
      <CardBody className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video bg-zinc-950 flex items-center justify-center border-b border-zinc-800">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <FileText className="h-12 w-12 text-zinc-600" />
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate mb-1">
                {name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{type}</span>
                {size && (
                  <>
                    <span>•</span>
                    <span>{size}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions menu */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Asset actions">
                {onDownload && (
                  <DropdownItem
                    key="download"
                    startContent={<Download className="h-4 w-4" />}
                    onPress={onDownload}
                  >
                    Download
                  </DropdownItem>
                )}
                {onShare && (
                  <DropdownItem
                    key="share"
                    startContent={<Share2 className="h-4 w-4" />}
                    onPress={onShare}
                  >
                    Share
                  </DropdownItem>
                )}
                {onDelete && (
                  <DropdownItem
                    key="delete"
                    color="danger"
                    startContent={<Trash2 className="h-4 w-4" />}
                    onPress={onDelete}
                  >
                    Delete
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  className="bg-zinc-800 text-zinc-300"
                  radius="sm"
                >
                  {tag}
                </Chip>
              ))}
              {tags.length > 3 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-zinc-800 text-zinc-400"
                  radius="sm"
                >
                  +{tags.length - 3}
                </Chip>
              )}
            </div>
          )}

          {/* Last modified */}
          {lastModified && (
            <div className="text-xs text-zinc-600 mt-3">
              {lastModified}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
