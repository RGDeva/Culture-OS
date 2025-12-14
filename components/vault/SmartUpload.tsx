'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FolderOpen, FileAudio, FileCode, Image, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  organizeFiles,
  categorizeFile,
  formatFileSize,
  getCategoryIcon,
  getCategoryColor,
  getDAWName,
  type FileGroup,
  type OrganizedFile
} from '@/lib/fileOrganizer'

interface SmartUploadProps {
  projectId?: string
  onUploadComplete?: (groups: FileGroup[]) => void
}

export function SmartUpload({ projectId, onUploadComplete }: SmartUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [organizedGroups, setOrganizedGroups] = useState<FileGroup[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    
    // Organize files automatically
    const organized: OrganizedFile[] = acceptedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      category: categorizeFile(file.name),
    }))
    
    const groups = organizeFiles(organized)
    setOrganizedGroups(groups)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName))
    
    // Re-organize remaining files
    const remaining: OrganizedFile[] = files
      .filter(f => f.name !== fileName)
      .map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        category: categorizeFile(file.name),
      }))
    
    setOrganizedGroups(organizeFiles(remaining))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    
    try {
      // Upload files to Cloudinary
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'noculture_vault')
        
        if (projectId) {
          formData.append('folder', `projects/${projectId}`)
        }
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        const data = await response.json()
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100,
        }))
        
        // Update organized groups with Cloudinary URLs
        setOrganizedGroups(prev => 
          prev.map(group => ({
            ...group,
            primaryFile: group.primaryFile.name === file.name
              ? { ...group.primaryFile, url: data.secure_url, cloudinaryId: data.public_id }
              : group.primaryFile,
            relatedFiles: group.relatedFiles.map(f =>
              f.name === file.name
                ? { ...f, url: data.secure_url, cloudinaryId: data.public_id }
                : f
            ),
          }))
        )
      }
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(organizedGroups)
      }
      
      // Reset
      setFiles([])
      setOrganizedGroups([])
      setUploadProgress({})
    } catch (error) {
      console.error('[SMART_UPLOAD] Error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10' 
            : 'dark:border-green-400/30 border-green-600/30 dark:hover:border-green-400 hover:border-green-600'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 dark:text-green-400 text-green-700" />
        <p className="text-lg font-mono dark:text-green-400 text-green-700 mb-2">
          {isDragActive ? 'DROP_FILES_HERE' : 'DRAG_&_DROP_FILES'}
        </p>
        <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
          or click to browse
        </p>
        <p className="text-xs font-mono dark:text-green-400/40 text-green-700/50 mt-4">
          Supports: .ptx, .als, .flp, .wav, .mp3, and more
        </p>
      </div>

      {/* Organized Groups */}
      {organizedGroups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
              &gt; ORGANIZED_FILES ({organizedGroups.length} {organizedGroups.length === 1 ? 'group' : 'groups'})
            </h3>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  UPLOADING...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  UPLOAD_ALL
                </>
              )}
            </Button>
          </div>

          {organizedGroups.map((group, index) => (
            <div
              key={group.id}
              className="border-2 dark:border-green-400/30 border-green-600/30 p-4 dark:bg-black bg-white"
            >
              {/* Group Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 dark:text-green-400 text-green-700" />
                  <div>
                    <h4 className="font-mono font-bold dark:text-green-400 text-green-700">
                      {group.name}
                    </h4>
                    <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                      {group.metadata.fileCount} file{group.metadata.fileCount !== 1 ? 's' : ''} · {formatFileSize(group.metadata.totalSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.metadata.hasSession && (
                    <span className="px-2 py-1 text-xs font-mono dark:bg-purple-400/20 bg-purple-600/20 dark:text-purple-400 text-purple-700 border dark:border-purple-400/30 border-purple-600/30">
                      SESSION
                    </span>
                  )}
                  {group.metadata.hasStems && (
                    <span className="px-2 py-1 text-xs font-mono dark:bg-blue-400/20 bg-blue-600/20 dark:text-blue-400 text-blue-700 border dark:border-blue-400/30 border-blue-600/30">
                      STEMS
                    </span>
                  )}
                </div>
              </div>

              {/* Primary File */}
              <div className="mb-2 p-3 border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{getCategoryIcon(group.primaryFile.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm dark:text-green-400 text-green-700 truncate">
                        {group.primaryFile.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                        <span className={getCategoryColor(group.primaryFile.category)}>
                          {group.primaryFile.category.replace('_', ' ').toUpperCase()}
                        </span>
                        <span>·</span>
                        <span>{formatFileSize(group.primaryFile.size)}</span>
                        {group.primaryFile.category === 'daw_session' && (
                          <>
                            <span>·</span>
                            <span>{getDAWName(group.primaryFile.name)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(group.primaryFile.name)}
                    className="p-1 dark:text-red-400 text-red-600 hover:dark:bg-red-400/10 hover:bg-red-600/10 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Upload Progress */}
                {uploading && uploadProgress[group.primaryFile.name] !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
                      <div
                        className="h-full dark:bg-green-400 bg-green-600 transition-all duration-300"
                        style={{ width: `${uploadProgress[group.primaryFile.name]}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Related Files */}
              {group.relatedFiles.length > 0 && (
                <div className="space-y-2 ml-8">
                  {group.relatedFiles.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="p-2 border dark:border-green-400/10 border-green-600/10 dark:bg-black bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">{getCategoryIcon(file.category)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs dark:text-green-400/80 text-green-700/80 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.name)}
                          className="p-1 dark:text-red-400 text-red-600 hover:dark:bg-red-400/10 hover:bg-red-600/10 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Upload Progress */}
                      {uploading && uploadProgress[file.name] !== undefined && (
                        <div className="mt-1">
                          <div className="h-0.5 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
                            <div
                              className="h-full dark:bg-green-400 bg-green-600 transition-all duration-300"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {files.length === 0 && (
        <div className="p-4 border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5">
          <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80">
            <strong>Smart Organization:</strong> Files are automatically grouped by project name. 
            DAW sessions (.ptx, .als, .flp) are detected and related audio files are grouped together.
          </p>
        </div>
      )}
    </div>
  )
}
