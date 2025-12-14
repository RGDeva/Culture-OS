"use client"

import { useEffect, useRef } from 'react'
import { CheckoutResponse } from '@/types/marketplace'
import { Button } from '@/components/ui/button'
import { X, Download, ExternalLink } from 'lucide-react'

interface UnlockSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  response: CheckoutResponse | null
}

export function UnlockSuccessModal({ isOpen, onClose, response }: UnlockSuccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus trap
      modalRef.current?.focus()
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !response) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-black border-2 border-green-500 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.3)] p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-400/60 hover:text-green-400 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-mono font-bold text-green-400">
            &gt; UNLOCK_SUCCESS
          </h2>
          <div className="h-px bg-green-500/30" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {response.downloadUrl && (
            <Button
              onClick={() => window.open(response.downloadUrl, '_blank')}
              className="w-full bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500 font-mono font-bold tracking-wider"
            >
              <Download className="w-4 h-4 mr-2" />
              DOWNLOAD_FILES
            </Button>
          )}

          {response.accessUrl && (
            <Button
              onClick={() => window.open(response.accessUrl, '_blank')}
              className="w-full bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500 font-mono font-bold tracking-wider"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              OPEN_ACCESS
            </Button>
          )}

          {!response.downloadUrl && !response.accessUrl && (
            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded text-sm text-green-300 font-mono">
              {response.message || 'Access instructions have been sent to your email.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 font-mono"
        >
          CLOSE
        </Button>
      </div>
    </div>
  )
}
