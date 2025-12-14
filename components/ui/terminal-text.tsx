'use client'

import { useState, useEffect } from 'react'

interface TerminalTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
  startDelay?: number
  cursor?: boolean
}

export function TerminalText({ 
  text, 
  speed = 50, 
  className = '', 
  onComplete,
  startDelay = 0,
  cursor = true
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        setCurrentIndex(0)
      }, startDelay)
      return () => clearTimeout(delayTimer)
    }
  }, [startDelay])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, onComplete, isComplete])

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <span className="animate-pulse">▋</span>
      )}
    </span>
  )
}

interface TerminalLinesProps {
  lines: string[]
  speed?: number
  lineDelay?: number
  className?: string
  onComplete?: () => void
}

export function TerminalLines({ 
  lines, 
  speed = 50, 
  lineDelay = 300,
  className = '',
  onComplete 
}: TerminalLinesProps) {
  const [currentLine, setCurrentLine] = useState(0)

  const handleLineComplete = () => {
    if (currentLine < lines.length - 1) {
      setTimeout(() => {
        setCurrentLine(prev => prev + 1)
      }, lineDelay)
    } else {
      onComplete?.()
    }
  }

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <div key={index}>
          {index <= currentLine && (
            <TerminalText
              text={line}
              speed={speed}
              onComplete={index === currentLine ? handleLineComplete : undefined}
              cursor={index === currentLine}
            />
          )}
        </div>
      ))}
    </div>
  )
}
