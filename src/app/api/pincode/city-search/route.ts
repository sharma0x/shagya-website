import { NextResponse } from 'next/server'
import { searchCity } from '@/lib/india-post'
import { getCached, setCache } from '@/lib/pincode-cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')?.trim()

    if (!city) {
      return NextResponse.json(
        { error: 'City query parameter is required' },
        { status: 400 }
      )
    }

    if (city.length < 2) {
      return NextResponse.json(
        { error: 'City name must be at least 2 characters' },
        { status: 400 }
      )
    }

    const cacheKey = `city:${city.toLowerCase()}`

    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json({ data: cached, cached: true })
    }

    const results = await searchCity(city)

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No post offices found for this city. Try a nearby city.' },
        { status: 404 }
      )
    }

    setCache(cacheKey, results)

    return NextResponse.json({ data: results })
  } catch (err) {
    console.error('City search failed:', err)
    return NextResponse.json(
      { error: 'Unable to search city. Please try again later.' },
      { status: 500 }
    )
  }
}
