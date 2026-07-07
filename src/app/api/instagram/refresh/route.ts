import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(): Promise<NextResponse> {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const userId = process.env.INSTAGRAM_USER_ID

    if (!accessToken || !userId) {
      return NextResponse.json(
        {
          message:
            'Instagram API not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in env.',
        },
        { status: 400 },
      )
    }

    // Fetch latest media from Instagram Graph API
    const url = `https://graph.facebook.com/v22.0/${userId}/media?fields=id,media_url,thumbnail_url,permalink,caption,media_type&access_token=${accessToken}&limit=20`

    const res = await fetch(url)
    const body = await res.json()

    if (!body.data) {
      return NextResponse.json(
        { message: 'Failed to fetch from Instagram API', error: body },
        { status: 500 },
      )
    }

    const payload = await getPayload({ config })

    // Get existing posts to map by instagramId
    const existing = await payload.find({
      collection: 'instagram-posts',
      limit: 100,
    })
    const existingMap = new Map(existing.docs.map((d) => [d.instagramId, d]))

    let created = 0
    let updated = 0

    for (let i = 0; i < body.data.length; i++) {
      const post = body.data[i]
      const postData = {
        instagramId: post.id,
        mediaUrl: post.media_url || '',
        thumbnailUrl: post.thumbnail_url || post.media_url || '',
        permalink: post.permalink || '',
        caption: (post.caption || '').slice(0, 500),
        mediaType: post.media_type || 'IMAGE',
        sortOrder: i,
      }

      const existingDoc = existingMap.get(post.id)
      if (existingDoc) {
        await payload.update({
          collection: 'instagram-posts',
          id: existingDoc.id,
          data: postData,
        })
        updated++
      } else {
        await payload.create({
          collection: 'instagram-posts',
          data: postData,
        })
        created++
      }
    }

    return NextResponse.json({
      message: 'Instagram posts refreshed',
      created,
      updated,
      total: body.data.length,
    })
  } catch (error) {
    console.error('[API] Instagram refresh error:', error)
    return NextResponse.json(
      { message: 'Failed to refresh Instagram posts' },
      { status: 500 },
    )
  }
}
