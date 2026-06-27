'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SkeletonImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  unoptimized?: boolean
  loading?: 'lazy' | 'eager'
}

export function SkeletonImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  priority,
  unoptimized,
  loading,
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Handle already-cached images: img.complete is true before onLoad fires
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [])

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          loaded ? 'pointer-events-none opacity-0' : 'skeleton',
        )}
        aria-hidden="true"
      />
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        loading={loading}
        className={cn(
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}
