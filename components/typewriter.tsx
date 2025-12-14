"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
}

export function TypewriterText({ text, delay = 0, speed = 100 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed, started])

  return (
    <span className="relative">
      {displayText}
      {started && currentIndex <= text.length && <span className="animate-pulse text-green-400">|</span>}
    </span>
  )
}
