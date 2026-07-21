'use client'

import Image from 'next/image'
import { useState } from 'react'

const LOCAL_SRC = '/brand/saarstahl-logo.jpg'
const REMOTE_FALLBACK =
  'https://www.vocatium.de/fileadmin/Profile/saarstahl-ag-28818/logo/2026_Logo_saarstahl_grau_gruen_rgb.jpg'

// Intrinsic logo aspect ratio is 650 x 213.
const RATIO = 650 / 213

export function BrandLogo({
  height = 40,
  className = '',
}: {
  height?: number
  className?: string
}) {
  const [src, setSrc] = useState(LOCAL_SRC)
  const width = Math.round(height * RATIO)

  return (
    <Image
      src={src}
      alt="Saarstahl - We are Pure Steel+"
      width={width}
      height={height}
      priority
      className={`object-contain ${className}`}
      onError={() => {
        if (src !== REMOTE_FALLBACK) setSrc(REMOTE_FALLBACK)
      }}
    />
  )
}
