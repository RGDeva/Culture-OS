"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, Share2, MoreHorizontal, Disc, Headphones, Music2 } from "lucide-react"
import Link from "next/link"

export default function MusicPage() {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("tracks")
  const router = useRouter()

  const tracks = [
    {
      id: 1,
      title: "Neon Dreams",
      artist: "XEN",
      duration: "3:45",
      plays: "1.2M",
      likes: "245K",
      genre: "Electronic"
    },
    {
      id: 2,
      title: "Midnight Echoes",
      artist: "CYPHER",
      duration: "4:12",
      plays: "890K",
      likes: "198K",
      genre: "Ambient"
    },
    {
      id: 3,
      title: "Cosmic Waves",
      artist: "NOVA",
      duration: "3:22",
      plays: "2.1M",
      likes: "512K",
      genre: "Synthwave"
    }
  ]

  const playlists = [
    { id: 1, name: "Chill Vibes", tracks: 24 },
    { id: 2, name: "Focus Flow", tracks: 18 },
    { id: 3, name: "Workout Mix", tracks: 32 },
  ]

  const togglePlay = (index: number) => {
    setCurrentTrack(index)
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-green-400 hover:text-black hover:bg-green-400 font-mono px-4 py-2 rounded flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK_TO_DASHBOARD
        </Link>
        <h1 className="text-3xl md:text-5xl font-mono font-bold">MUSIC</h1>
        <div className="w-32"></div>
      </div>

      <div className="border-b border-green-400/20 mb-8">
        <nav className="-mb-px flex space-x-8">
          {["tracks", "playlists"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-green-400/70 hover:text-green-400 hover:border-green-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "tracks" && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-green-400/10 text-green-400/70 text-xs font-mono">
            <div className="col-span-1">#</div>
            <div className="col-span-5">TITLE</div>
            <div className="col-span-3">ARTIST</div>
            <div className="col-span-2">GENRE</div>
            <div className="col-span-1">DURATION</div>
          </div>
          {tracks.map((track, index) => (
            <div key={track.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-green-400/5">
              <div className="col-span-1">
                <button onClick={() => togglePlay(index)} className="text-green-400 hover:text-white">
                  {currentTrack === index && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
              <div className="col-span-5">{track.title}</div>
              <div className="col-span-3">{track.artist}</div>
              <div className="col-span-2">{track.genre}</div>
              <div className="col-span-1">{track.duration}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-black/30 border border-green-400/20 rounded-lg p-6 hover:border-green-400/50 transition-colors">
              <div className="h-40 bg-gradient-to-br from-green-400/10 to-green-400/5 rounded mb-4 flex items-center justify-center">
                <Disc className="h-12 w-12 text-green-400/50" />
              </div>
              <h3 className="font-mono font-bold text-lg mb-1">{playlist.name}</h3>
              <p className="text-green-400/60 text-sm">{playlist.tracks} tracks</p>
            </div>
          ))}
        </div>
      )}

      {/* Now Playing Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-green-400/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded flex items-center justify-center">
              <Music2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="font-medium">{tracks[currentTrack]?.title || 'No track selected'}</div>
              <div className="text-sm text-green-400/70">{tracks[currentTrack]?.artist || '—'}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-green-400/70 hover:text-green-400">
              <Shuffle className="h-5 w-5" />
            </button>
            <button className="text-green-400/70 hover:text-green-400">
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className="h-10 w-10 rounded-full bg-green-400 text-black flex items-center justify-center hover:bg-green-300"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button className="text-green-400/70 hover:text-green-400">
              <SkipForward className="h-5 w-5" />
            </button>
            <button className="text-green-400/70 hover:text-green-400">
              <Repeat className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Volume2 className="h-5 w-5 text-green-400/70" />
            <div className="w-24 h-1 bg-green-400/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
