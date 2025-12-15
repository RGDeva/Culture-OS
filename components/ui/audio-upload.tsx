"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface AudioUploadProps {
  onUpload: (url: string, fileSize?: number, fileName?: string) => void
}

export default function AudioUpload({ onUpload }: AudioUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file')
      return
    }

    try {
      setError(null)
      setUploading(true)
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
      setFileSize(file.size)
      setFileName(file.name)

      // TODO: Implement actual file upload to Supabase storage
      // For now, we'll just use the preview URL
      onUpload(preview, file.size, file.name)
    } catch (error) {
      setError('Error uploading audio')
      console.error('Error uploading audio:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full bg-black/80 border-2 border-dashed border-green-400/50 rounded-lg overflow-hidden">
        {previewUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-green-400 p-4">
            <div className="text-2xl mb-2">Audio Preview</div>
            {fileName && <div className="text-sm mb-1">{fileName}</div>}
            {fileSize && (
              <div className="text-xs text-green-400/70 mb-4">
                Size: {(fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
            <audio
              src={previewUrl}
              controls
              className="w-full mt-4"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-green-400">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">Click to upload audio file</p>
          </div>
        )}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <Button
        variant="outline"
        className="w-full bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
        disabled={uploading}
      >
        {uploading ? "UPLOADING..." : "UPLOAD_AUDIO"}
      </Button>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
