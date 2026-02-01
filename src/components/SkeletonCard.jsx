import React from 'react'

export const SkeletonCard = ({ className = '', height = 'h-24' }) => (
  <div
    className={`animate-pulse bg-neutral-800 rounded-xl ${height} ${className}`}
    aria-hidden="true"
  />
)

export const SkeletonChart = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-neutral-800 rounded w-1/3" />
    <div className="h-48 bg-neutral-800 rounded-xl" />
    <div className="h-3 bg-neutral-800 rounded w-full" />
    <div className="h-3 bg-neutral-800 rounded w-2/3" />
  </div>
)

export const SkeletonResults = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-neutral-800 rounded-xl" />
      ))}
    </div>
    <div className="h-24 bg-neutral-800 rounded-xl" />
    <SkeletonChart />
    <div className="h-32 bg-neutral-800 rounded-xl" />
  </div>
)

/** Skeleton for AI section text blocks (Five Elements advice, Ten Gods, etc.) */
export const SectionSkeleton = ({ lines = 4 }) => (
  <div className="space-y-3 animate-pulse" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-neutral-800 rounded"
        style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
      />
    ))}
  </div>
)

export default SkeletonCard
