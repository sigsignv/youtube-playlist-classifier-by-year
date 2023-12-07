import { z } from 'zod'
import { YouTubeClient } from './factory'

const playlist = z.object({
    kind: z.string(),
    id: z.string(),
    title: z.string(),
    publishedAt: z.string(),
})

export type Playlist = z.infer<typeof playlist>

export type Playlists = {
    nextPageToken?: string
    items: Playlist[]
}

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

export async function getOwnPlaylists(youtube: YouTubeClient, pageToken?: string): Promise<Playlists> {
    const resp = await youtube.playlists.list({
        part: ['snippet'],
        maxResults: 50,
        mine: true,
        pageToken: pageToken ?? '',
    })

    if (!Array.isArray(resp.data.items)) {
        return { items: [] }
    }

    const list: Playlist[] = []
    for (const item of resp.data.items) {
        list.push(
            playlist.parse({
                kind: item.kind,
                id: item.id,
                title: item.snippet?.title,
                publishedAt: item.snippet?.publishedAt,
            }),
        )
    }

    return {
        nextPageToken: resp.data.nextPageToken ?? undefined,
        items: list,
    }
}
