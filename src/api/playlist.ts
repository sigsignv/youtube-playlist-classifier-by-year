import { youtube_v3 } from '@googleapis/youtube'
import { z } from 'zod'
import { YouTubeClient } from './factory'

const playlist = z.object({
    kind: z.literal('youtube#playlist'),
    id: z.string(),
    title: z.string(),
})

export type Playlist = z.infer<typeof playlist>

type GetPlaylistsOptions = youtube_v3.Params$Resource$Playlists$List

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
    })
}

export async function dropPlaylist(youtube: YouTubeClient, id: string): Promise<void> {
    await youtube.playlists.delete({ id })
}

export async function getPlaylistsByChannel(youtube: YouTubeClient, channelId: string): Promise<Playlist[]> {
    return await getPlaylists(youtube, { channelId })
}

export async function getPlaylistsById(youtube: YouTubeClient, playlistId: string | string[]): Promise<Playlist[]> {
    const id = typeof playlistId === 'string' ? [playlistId] : playlistId

    return await getPlaylists(youtube, { id })
}

export async function getOwnPlaylists(youtube: YouTubeClient): Promise<Playlist[]> {
    return await getPlaylists(youtube, { mine: true })
}

async function getPlaylists(youtube: YouTubeClient, options: GetPlaylistsOptions): Promise<Playlist[]> {
    const params: GetPlaylistsOptions = {
        part: ['snippet'],
        maxResults: 50,
        ...options,
    }

    const resp = await youtube.playlists.list(params)

    const items = resp.data.items ?? []
    let nextPageToken = resp.data.nextPageToken

    while (nextPageToken) {
        params.pageToken = nextPageToken

        const resp = await youtube.playlists.list(params)
        if (Array.isArray(resp.data.items)) {
            items.push(...resp.data.items)
        }
        nextPageToken = resp.data.nextPageToken
    }

    const list: Playlist[] = []
    for (const item of items) {
        list.push(
            playlist.parse({
                kind: item.kind,
                id: item.id,
                title: item.snippet?.title,
            }),
        )
    }

    return list
}
