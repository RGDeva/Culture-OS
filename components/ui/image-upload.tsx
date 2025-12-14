"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Image } from "lucide-react"

interface ImageUploadProps {
  onUpload: (url: string) => void
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // TODO: Implement actual file upload to Supabase storage
      // For now, we'll just use the preview URL
      onUpload(preview)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full bg-black/80 border-2 border-dashed border-green-400/50 rounded-lg overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-green-400">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">Click to upload or drag and drop</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <Button
        variant="outline"
        className="w-full bg-black/80 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
        disabled={uploading}
      >
        {uploading ? "UPLOADING..." : "UPLOAD_LOGO"}
      </Button>
    </div>
  )
}
