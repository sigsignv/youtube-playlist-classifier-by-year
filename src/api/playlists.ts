import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import { YouTubeClient } from './factory'

export interface PlaylistOptions {
    auth: OAuth2Client
}

const playlist = z.object({
    kind: z.string(),
    id: z.string(),
    title: z.string(),
    publishedAt: z.string(),
})

export type Playlist = z.infer<typeof playlist>

export async function createPlaylist(youtube: YouTubeClient, title: string): Promise<Playlist> {
    const resp = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: { title },
            status: {
                privacyStatus: 'private',
            },
        },
    })

    return playlist.parse({
        kind: resp.data.kind,
        id: resp.data.id,
        title: resp.data.snippet?.title,
        publishedAt: resp.data.snippet?.publishedAt,
    })
}

export async function dropPlaylist(youtube: YouTubeClient, id: string): Promise<void> {
    await youtube.playlists.delete({ id })
}
