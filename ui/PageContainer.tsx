'use client'

import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

export function PageContainer({ 
  children, 
  maxWidth = 'full',
  className = '' 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full'
  }

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}
