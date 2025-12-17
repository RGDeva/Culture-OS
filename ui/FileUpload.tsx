'use client'

import { useCallback, useState } from 'react'
import { Upload, X, File } from 'lucide-react'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFilesSelected,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [disabled])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFiles(files)
  }, [disabled])

  const handleFiles = (files: File[]) => {
    let validFiles = files

    if (maxSize) {
      validFiles = files.filter(file => file.size <= maxSize)
    }

    setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : validFiles)
    onFilesSelected(validFiles)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/5' 
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        radius="lg"
      >
        <CardBody
          className="p-8"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className={`h-12 w-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-zinc-500'}`} />
            <p className="text-sm font-medium text-white mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-zinc-500">
              {accept ? `Accepted: ${accept}` : 'All file types accepted'}
              {maxSize && ` • Max ${(maxSize / 1024 / 1024).toFixed(0)}MB`}
            </p>
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleChange}
              disabled={disabled}
            />
          </label>
        </CardBody>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
