"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ArtistFormData {
  artistType: string
  genres: string[]
  soundcloud: string
  spotify: string
}

const artistTypes = [
  { id: "musician", label: "MUSICIAN" },
  { id: "producer", label: "PRODUCER" },
  { id: "engineer", label: "ENGINEER" }
]

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

export function ArtistForm() {
  const [formData, setFormData] = useState<ArtistFormData>({
    artistType: "",
    genres: [],
    soundcloud: "",
    spotify: ""
  })

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenreChange = (genre: string) => {
    setFormData((prev) => {
      const updatedGenres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre]
      return { ...prev, genres: updatedGenres }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement Supabase storage
    router.push('/artist_dashboard')
  }

  const isFormValid = formData.artistType && formData.genres.length > 0

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
          <Link href="/onboarding/artist" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK_TO_SYSTEM
          </Link>
          <h1 className="text-4xl md:text-6xl font-mono font-bold">ARTIST_SETUP</h1>
          <div className="text-sm font-mono text-green-400/60">STEP_3/3</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">ARTIST_TYPE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {artistTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={formData.artistType === type.id ? "default" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, artistType: type.id }))}
                  className="w-full justify-start"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">GENRES</h2>
            <div className="grid grid-cols-2 gap-2">
              {genreOptions.map((genre) => (
                <Button
                  key={genre}
                  variant={formData.genres.includes(genre) ? "default" : "outline"}
                  onClick={() => handleGenreChange(genre)}
                  className="w-full justify-start"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-mono font-bold text-green-400">SOCIAL_LINKS</h2>
            <div className="space-y-2">
              <input
                type="text"
                name="soundcloud"
                placeholder="SoundCloud URL"
                value={formData.soundcloud}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
              <input
                type="text"
                name="spotify"
                placeholder="Spotify URL"
                value={formData.spotify}
                onChange={handleInputChange}
                className="w-full bg-black/80 border border-green-400/50 text-green-400 px-4 py-2 rounded"
              />
            </div>
          </div>

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
