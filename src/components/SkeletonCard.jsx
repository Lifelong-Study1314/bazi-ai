import React from 'react'

export const SkeletonCard = ({ className = '', height = 'h-24' }) => (
  <div
    className={`bg-neutral-800 rounded-xl animate-shimmer ${height} ${className}`}
    aria-hidden="true"
  />
)

export const SkeletonChart = () => (
  <div className="space-y-4">
    <div className="h-4 bg-neutral-800 rounded w-1/3 animate-shimmer" />
    <div className="h-48 bg-neutral-800 rounded-xl animate-shimmer" />
    <div className="h-3 bg-neutral-800 rounded w-full animate-shimmer" />
    <div className="h-3 bg-neutral-800 rounded w-2/3 animate-shimmer" />
  </div>
)

export const SkeletonResults = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-neutral-800 rounded-xl animate-shimmer" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
    <div className="h-24 bg-neutral-800 rounded-xl animate-shimmer" />
    <SkeletonChart />
    <div className="h-32 bg-neutral-800 rounded-xl animate-shimmer" />
  </div>
)

/** Skeleton for AI section text blocks (Five Elements advice, Ten Gods, etc.) */
export const SectionSkeleton = ({ lines = 4 }) => (
  <div className="space-y-3" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-neutral-800 rounded animate-shimmer"
        style={{
          width: i === lines - 1 && lines > 1 ? '70%' : '100%',
          animationDelay: `${i * 100}ms`,
        }}
      />
    ))}
  </div>
)

export default SkeletonCard
