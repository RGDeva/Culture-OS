'use client'

import { CheckCircle2, Loader2, AlertCircle, Music } from 'lucide-react'

export interface UploadFile {
  name: string
  size: number
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error'
  progress?: number
  error?: string
  projectId?: string
}

interface UploadStatusProps {
  files: UploadFile[]
  onClose?: () => void
}

export function UploadStatus({ files, onClose }: UploadStatusProps) {
  const totalFiles = files.length
  const completedFiles = files.filter(f => f.status === 'complete').length
  const errorFiles = files.filter(f => f.status === 'error').length
  const uploadingFiles = files.filter(f => f.status === 'uploading' || f.status === 'analyzing').length
  
  const allComplete = completedFiles === totalFiles
  const hasErrors = errorFiles > 0

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[500px] border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-2 dark:border-green-400/30 border-green-600/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {uploadingFiles > 0 && (
            <Loader2 className="h-5 w-5 dark:text-green-400 text-green-700 animate-spin" />
          )}
          {allComplete && !hasErrors && (
            <CheckCircle2 className="h-5 w-5 dark:text-green-400 text-green-700" />
          )}
          {hasErrors && (
            <AlertCircle className="h-5 w-5 dark:text-red-400 text-red-700" />
          )}
          <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
            UPLOAD_STATUS
          </h3>
        </div>
        {allComplete && onClose && (
          <button
            onClick={onClose}
            className="text-xs font-mono dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700"
          >
            CLOSE
          </button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="p-3 border-b-2 dark:border-green-400/30 border-green-600/40 dark:bg-green-400/5 bg-green-50">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="dark:text-green-400 text-green-700">
            {completedFiles} / {totalFiles} complete
          </span>
          {hasErrors && (
            <span className="dark:text-red-400 text-red-700">
              {errorFiles} failed
            </span>
          )}
        </div>
        <div className="w-full h-2 dark:bg-green-400/20 bg-green-600/20 rounded-full overflow-hidden">
          <div
            className="h-full dark:bg-green-400 bg-green-600 transition-all duration-300"
            style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="border dark:border-green-400/30 border-green-600/40 p-2 text-xs font-mono"
          >
            <div className="flex items-start gap-2 mb-1">
              {file.status === 'pending' && (
                <div className="w-4 h-4 rounded-full dark:border-green-400/50 border-green-600/50 border-2 mt-0.5" />
              )}
              {file.status === 'uploading' && (
                <Loader2 className="w-4 h-4 dark:text-yellow-400 text-yellow-600 animate-spin mt-0.5" />
              )}
              {file.status === 'analyzing' && (
                <Loader2 className="w-4 h-4 dark:text-cyan-400 text-cyan-600 animate-spin mt-0.5" />
              )}
              {file.status === 'complete' && (
                <CheckCircle2 className="w-4 h-4 dark:text-green-400 text-green-700 mt-0.5" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="w-4 h-4 dark:text-red-400 text-red-700 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate dark:text-green-400 text-green-700 font-bold">
                  {file.name}
                </div>
                <div className="dark:text-green-400/60 text-green-700/60">
                  {formatSize(file.size)}
                </div>
              </div>
            </div>
            
            {/* Status Text */}
            <div className="ml-6">
              {file.status === 'pending' && (
                <span className="dark:text-gray-400 text-gray-600">Waiting...</span>
              )}
              {file.status === 'uploading' && (
                <span className="dark:text-yellow-400 text-yellow-600">
                  Uploading{file.progress ? ` ${file.progress}%` : '...'}
                </span>
              )}
              {file.status === 'analyzing' && (
                <span className="dark:text-cyan-400 text-cyan-600">Analyzing audio...</span>
              )}
              {file.status === 'complete' && (
                <span className="dark:text-green-400 text-green-700">✓ Complete</span>
              )}
              {file.status === 'error' && (
                <span className="dark:text-red-400 text-red-700">
                  ✗ {file.error || 'Upload failed'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {allComplete && (
        <div className="p-3 border-t-2 dark:border-green-400/30 border-green-600/40 text-center">
          <p className="text-xs font-mono dark:text-green-400 text-green-700">
            {hasErrors
              ? `⚠️ ${completedFiles} succeeded, ${errorFiles} failed`
              : `✓ All ${totalFiles} files uploaded successfully!`}
          </p>
        </div>
      )}
    </div>
  )
}
