"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { updateListenerProfile } from "@/lib/supabase"

interface ListenerFormData {
  preferredGenres: string[]
  supportPreferences: string[]
}

const genreOptions = [
  "Hip Hop",
  "Electronic",
  "Rock",
  "Pop",
  "Jazz",
  "Classical",
  "Experimental",
  "Ambient"
]

const supportOptions = [
  "donate",
  "stream",
  "buy_merch",
  "attend_live",
  "share_content"
]

export function ListenerForm() {
  const [formData, setFormData] = useState<ListenerFormData>({
    preferredGenres: [],
    supportPreferences: []
  })

  const router = useRouter()

  const handleGenreChange = (genre: string) => {
    setFormData((prev) => {
      const updatedGenres = prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter((g) => g !== genre)
        : [...prev.preferredGenres, genre]
      return { ...prev, preferredGenres: updatedGenres }
    })
  }

  const handleSupportChange = (support: string) => {
    setFormData((prev) => {
      const updatedSupport = prev.supportPreferences.includes(support)
        ? prev.supportPreferences.filter((s) => s !== support)
        : [...prev.supportPreferences, support]
      return { ...prev, supportPreferences: updatedSupport }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateListenerProfile(useSearchParams().get('userId') as string, {
  preferred_genres: formData.preferredGenres,
  support_preferences: formData.supportPreferences
})
      router.push('/listener_dashboard')
    } catch (error) {
      console.error('Error saving listener profile:', error)
    }
  }

  const isFormValid = formData.preferredGenres.length > 0

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
          <Link href="/onboarding/listener" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_SYSTEM
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">LISTENER_SETUP</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_3/3</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          {/* Preferred Genres */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">PREFERRED_GENRES</h2>
            <div className="grid grid-cols-2 gap-2">
              {genreOptions.map((genre) => (
                <Button
                  key={genre}
                  variant={formData.preferredGenres.includes(genre) ? "default" : "outline"}
                  onClick={() => handleGenreChange(genre)}
                  className="w-full justify-start"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Support Preferences */}
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">SUPPORT_PREFERENCES</h2>
            <div className="grid grid-cols-2 gap-2">
              {supportOptions.map((support) => (
                <Button
                  key={support}
                  variant={formData.supportPreferences.includes(support) ? "default" : "outline"}
                  onClick={() => handleSupportChange(support)}
                  className="w-full justify-start"
                >
                  {support.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={`w-full ${isFormValid ? "bg-green-400 hover:bg-green-500" : "bg-gray-600 cursor-not-allowed"}`}
            disabled={!isFormValid}
          >
            → DEPLOY_DASHBOARD
          </Button>
        </form>
      </div>
    </div>
  )
}
