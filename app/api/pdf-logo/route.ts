import { NextResponse } from 'next/server'

// Exact Saarstahl / Montan-Stiftung logo requested for the PDF exports.
const LOGO_SOURCE_URL =
  'https://www.montan-stiftung-saar.de/imperia/md/content/montanstiftung/fotos/dhfittosize_1200_450_thumbnail_7bbfc00e568ad278febf4bc8cf14ae19_slider-sag.png'

/**
 * Same-origin proxy for the external logo image.
 *
 * jsPDF / html2canvas cannot reliably read the external PNG directly because of
 * browser CORS restrictions. Fetching it server-side and re-serving the bytes
 * from our own origin avoids tainted-canvas / CORS failures on the client.
 */
export async function GET() {
  try {
    const upstream = await fetch(LOGO_SOURCE_URL, {
      // Cache the upstream fetch so we do not hit the origin on every export.
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch logo (upstream status ${upstream.status})` },
        { status: 502 },
      )
    }

    const contentType = upstream.headers.get('content-type') || 'image/png'
    const bytes = await upstream.arrayBuffer()

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Allow the browser and CDN to cache the proxied image.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    })
  } catch (error) {
    console.error('[v0] pdf-logo route failed to fetch logo:', error)
    return NextResponse.json({ error: 'Logo could not be retrieved' }, { status: 500 })
  }
}
