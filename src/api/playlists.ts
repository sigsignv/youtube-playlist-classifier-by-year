import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import { YouTubeClient } from './factory'

export interface PlaylistOptions {
    auth: OAuth2Client
}

const youTubePlaylist = z.object({
    id: z.string(),
    title: z.string(),
    publishedAt: z.string(),
})

export type YouTubePlaylist = z.infer<typeof youTubePlaylist>

export async function createPlaylist(youtube: YouTubeClient, title: string): Promise<YouTubePlaylist> {
    const resp = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: { title },
            status: {
                privacyStatus: 'private',
            },
        },
    })

    const kind = 'youtube#playlist'
    if (resp.data.kind !== kind) {
        throw new Error(`[createPlaylist] Should be response as '${kind}'`)
    }

    return youTubePlaylist.parse({
        id: resp.data.id,
        title: resp.data.snippet?.title,
        publishedAt: resp.data.snippet?.publishedAt,
    })
}

export async function dropPlaylist(youtube: YouTubeClient, id: string): Promise<void> {
    await youtube.playlists.delete({ id })
}
