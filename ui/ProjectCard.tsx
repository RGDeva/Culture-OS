'use client'

import { ReactNode } from 'react'
import { Card, CardBody, CardFooter } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Avatar, AvatarGroup } from '@heroui/avatar'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown'
import { MoreVertical, FolderOpen, Users, Clock } from 'lucide-react'

interface ProjectCardProps {
  id: string
  name: string
  description?: string
  thumbnail?: string
  assetCount: number
  collaboratorCount: number
  lastModified: string
  status?: 'active' | 'archived' | 'draft'
  collaborators?: Array<{ name: string; avatar?: string }>
  onClick?: () => void
  onEdit?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function ProjectCard({
  id,
  name,
  description,
  thumbnail,
  assetCount,
  collaboratorCount,
  lastModified,
  status = 'active',
  collaborators = [],
  onClick,
  onEdit,
  onArchive,
  onDelete
}: ProjectCardProps) {
  const statusColors = {
    active: 'success',
    archived: 'default',
    draft: 'warning'
  } as const

  const statusLabels = {
    active: 'Active',
    archived: 'Archived',
    draft: 'Draft'
  }

  return (
    <Card
      isPressable={!!onClick}
      onPress={onClick}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
      radius="lg"
    >
      <CardBody className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video bg-zinc-950 flex items-center justify-center border-b border-zinc-800 relative overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <FolderOpen className="h-16 w-16 text-zinc-700" />
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Chip
              size="sm"
              color={statusColors[status]}
              variant="flat"
              radius="sm"
            >
              {statusLabels[status]}
            </Chip>
          </div>

          {/* Actions menu */}
          <div className="absolute top-3 right-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-black/50 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Project actions">
                {onEdit && (
                  <DropdownItem key="edit" onPress={onEdit}>
                    Edit Project
                  </DropdownItem>
                )}
                {onArchive && (
                  <DropdownItem key="archive" onPress={onArchive}>
                    {status === 'archived' ? 'Unarchive' : 'Archive'}
                  </DropdownItem>
                )}
                {onDelete && (
                  <DropdownItem key="delete" color="danger" onPress={onDelete}>
                    Delete Project
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-white mb-2 truncate">
            {name}
          </h3>
          
          {description && (
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{assetCount} assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{collaboratorCount} members</span>
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center justify-between">
              <AvatarGroup size="sm" max={4}>
                {collaborators.map((collab, index) => (
                  <Avatar
                    key={index}
                    name={collab.name}
                    src={collab.avatar}
                    classNames={{
                      base: "bg-zinc-800 border-zinc-900",
                      name: "text-zinc-300 text-xs"
                    }}
                  />
                ))}
              </AvatarGroup>
              
              <div className="flex items-center gap-1 text-xs text-zinc-600">
                <Clock className="h-3 w-3" />
                <span>{lastModified}</span>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
