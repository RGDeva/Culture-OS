"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="flex items-center gap-4 bg-black/60 border border-green-400/50 p-4 backdrop-blur-sm">
      <audio ref={audioRef} loop onEnded={() => setIsPlaying(false)}>
        <source src="/audio/ambient-track.mp3" type="audio/mpeg" />
      </audio>

      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        className="text-green-400 hover:text-black hover:bg-green-400"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="text-green-400 font-mono text-sm">AMBIENT_TRACK_001.mp3</div>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="text-green-400 hover:text-black hover:bg-green-400"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
