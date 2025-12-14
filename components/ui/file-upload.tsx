'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Music, Image as ImageIcon, Video, FileText } from 'lucide-react'
import { Button } from './button'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  label?: string
  description?: string
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 100,
  acceptedTypes = ['audio/*', 'image/*', 'video/*', 'application/pdf', '.zip', '.rar'],
  label = 'UPLOAD_FILES',
  description = 'Drag and drop files or click to browse'
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) return <Music className="h-5 w-5" />
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File ${file.name} exceeds ${maxSizeMB}MB limit`
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const [category] = type.split('/')
        return file.type.startsWith(category + '/')
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type === type
    })

    if (!isAccepted) {
      return `File type ${file.type} is not accepted`
    }

    return null
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    setError(null)
    const fileArray = Array.from(newFiles)

    // Check max files
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      validFiles.push(file)
    }

    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    setError(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-2 text-green-400/70 font-mono">{label}</label>
        
        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-green-400 bg-green-400/10'
              : 'border-green-400/30 hover:border-green-400/50 bg-black/20'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-green-400/50" />
          <p className="text-green-400 font-mono mb-2">{description}</p>
          <p className="text-xs text-green-400/50 font-mono">
            Max {maxFiles} files · {maxSizeMB}MB per file
          </p>
        </div>

        {error && (
          <div className="mt-2 p-3 border border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-green-400/70 font-mono">
            UPLOADED_FILES ({files.length}/{maxFiles})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border border-green-400/30 bg-black/40 hover:border-green-400 transition-all"
            >
              <div className="text-green-400">{getFileIcon(file)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-green-400 truncate">{file.name}</p>
                <p className="text-xs text-green-400/60 font-mono">{formatFileSize(file.size)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
