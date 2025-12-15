"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ImageUpload from "@/components/ui/image-upload"
import AudioUpload from "@/components/ui/audio-upload"

interface AssetFormData {
  title: string
  type: string
  genre: string
  accessType: string
  price: number
  referralCount: number
  description: string
  audioUrl: string
  imageUrl: string
  fileSize?: number
  fileName?: string
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<AssetFormData>({
    title: "",
    type: "",
    genre: "",
    accessType: "",
    price: 0,
    referralCount: 0,
    description: "",
    audioUrl: "",
    imageUrl: ""
  })

  const assetTypes = [
    { id: "beat", label: "BEAT" },
    { id: "vocal", label: "VOCAL" },
    { id: "stem", label: "STEM" },
    { id: "demo", label: "DEMO" }
  ]

  const accessTypes = [
    { id: "pay", label: "PAY_TO_DOWNLOAD" },
    { id: "referral", label: "FREE_WITH_REFERRAL" },
    { id: "collab", label: "COLLAB_SPLIT" },
    { id: "bounty", label: "BOUNTY" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAudioUpload = async (url: string, fileSize?: number, fileName?: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      audioUrl: url,
      fileSize: fileSize,
      fileName: fileName,
      title: prev.title || fileName?.replace(/\.[^/.]+$/, '') || '' // Auto-fill title from filename if empty
    }))
  }

  const handleImageUpload = async (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!isSupabaseConfigured()) {
        // Mock success when Supabase is not configured
        console.log('Mock upload:', formData)
        alert('Upload successful! (Demo mode - Supabase not configured)')
        router.push('/vault')
        return
      }

      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: searchParams.get('userId'),
          ...formData,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      alert('Upload successful!')
      router.push('/vault')
    } catch (error) {
      console.error('Error uploading asset:', error)
      alert('Upload failed. Using demo mode instead.')
      router.push('/vault')
    }
  }

  const isFormValid = formData.title && formData.type && formData.audioUrl

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-400/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-2xl mb-12">
          <Link href="/dashboard" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_VAULT
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">UPLOAD_ASSET</h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">ASSET_INFO</h2>
            <div className="space-y-2">
              <input
                type="text"
                name="title"
                placeholder="Asset Title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              >
                <option value="">SELECT_TYPE</option>
                {assetTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="genre"
                placeholder="Genre Tags (comma separated)"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
            </div>
          </div>

          {/* Access Settings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">ACCESS_SETTINGS</h2>
            <div className="space-y-2">
              <select
                name="accessType"
                value={formData.accessType}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              >
                <option value="">SELECT_ACCESS</option>
                {accessTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {formData.accessType === "pay" && (
                <input
                  type="number"
                  name="price"
                  placeholder="Price in USD"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
                />
              )}
              {formData.accessType === "referral" && (
                <input
                  type="number"
                  name="referralCount"
                  placeholder="Required Referrals"
                  value={formData.referralCount}
                  onChange={handleInputChange}
                  className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
                />
              )}
            </div>
          </div>

          {/* Files */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">UPLOAD_FILES</h2>
            <div className="space-y-4">
              <AudioUpload onUpload={handleAudioUpload} />
              <ImageUpload onUpload={handleImageUpload} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">DESCRIPTION</h2>
            <textarea
              name="description"
              placeholder="Describe your asset..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded h-32"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className={`w-full ${isFormValid ? "bg-green-400 hover:bg-green-500" : "bg-gray-600 cursor-not-allowed"}`}
            disabled={!isFormValid}
          >
            → DEPLOY_ASSET
          </Button>
        </form>
      </div>
    </div>
  )
}
