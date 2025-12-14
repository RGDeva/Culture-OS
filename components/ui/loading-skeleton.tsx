'use client'

interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export function LoadingSkeleton({ className = '', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-green-400/10 border border-green-400/20 ${className}`}
        />
      ))}
    </>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="border-2 border-green-400/20 p-6 animate-pulse">
      <div className="h-48 bg-green-400/10 mb-4" />
      <div className="h-6 bg-green-400/10 mb-2 w-3/4" />
      <div className="h-4 bg-green-400/10 mb-2 w-1/2" />
      <div className="h-4 bg-green-400/10 mb-4 w-full" />
      <div className="h-8 bg-green-400/10 w-1/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-10 bg-green-400/10 flex-1" />
        <div className="h-10 bg-green-400/10 flex-1" />
      </div>
    </div>
  )
}

export function BountyCardSkeleton() {
  return (
    <div className="border-2 border-green-400/20 p-6 animate-pulse">
      <div className="h-6 bg-green-400/10 mb-2 w-3/4" />
      <div className="h-4 bg-green-400/10 mb-3 w-1/2" />
      <div className="h-4 bg-green-400/10 mb-2 w-1/4" />
      <div className="h-12 bg-green-400/10 mb-4 w-full" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-green-400/10 w-2/3" />
        <div className="h-4 bg-green-400/10 w-1/2" />
      </div>
      <div className="h-10 bg-green-400/10 w-full" />
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className="border-2 border-green-400/20 p-6 animate-pulse">
      <div className="h-6 bg-green-400/10 mb-3 w-2/3" />
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-green-400/10 w-20" />
        <div className="h-6 bg-green-400/10 w-20" />
      </div>
      <div className="h-4 bg-green-400/10 mb-2 w-1/2" />
      <div className="h-4 bg-green-400/10 mb-4 w-full" />
      <div className="h-2 bg-green-400/10 mb-3 w-full" />
      <div className="h-10 bg-green-400/10 w-full" />
    </div>
  )
}
