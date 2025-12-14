'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { formatDuration } from '@/lib/audioParser'

interface AudioPlayerProps {
  src: string
  title?: string
  waveform?: number[]
  onEnded?: () => void
}

export function AudioPlayer({ src, title, waveform, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progress = progressRef.current
    if (!audio || !progress) return

    const rect = progress.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audio.currentTime = percentage * duration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Title */}
      {title && (
        <div className="mb-3 text-sm font-mono dark:text-green-400 text-green-700 truncate">
          {title}
        </div>
      )}

      {/* Waveform / Progress Bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="relative h-16 mb-3 cursor-pointer group"
      >
        {waveform && waveform.length > 0 ? (
          // Waveform visualization
          <div className="flex items-center justify-between h-full gap-[1px]">
            {waveform.map((amplitude, idx) => {
              const height = Math.max(4, amplitude * 100)
              const played = (idx / waveform.length) * 100 < progress
              return (
                <div
                  key={idx}
                  className={`flex-1 transition-colors ${
                    played
                      ? 'dark:bg-green-400 bg-green-600'
                      : 'dark:bg-green-400/30 bg-green-600/40'
                  } group-hover:dark:bg-green-300 group-hover:bg-green-500`}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        ) : (
          // Simple progress bar
          <div className="relative h-2 dark:bg-green-400/20 bg-green-600/30 rounded-full overflow-hidden top-1/2 -translate-y-1/2">
            <div
              className="h-full dark:bg-green-400 bg-green-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Progress indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 dark:bg-green-400 bg-green-600 pointer-events-none"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono dark:text-green-400/70 text-green-700/70">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Skip Back */}
        <button
          onClick={() => skip(-10)}
          className="p-2 dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
          title="Skip back 10s"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-3 border-2 dark:border-green-400 border-green-600 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5" fill="currentColor" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => skip(10)}
          className="p-2 dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
          title="Skip forward 10s"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 ml-2">
          <button
            onClick={toggleMute}
            className="p-2 dark:text-green-400 text-green-700 hover:opacity-70 transition-opacity"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 dark:bg-green-400/20 bg-green-600/30 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:dark:bg-green-400
              [&::-webkit-slider-thumb]:bg-green-600
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:dark:bg-green-400
              [&::-moz-range-thumb]:bg-green-600
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
