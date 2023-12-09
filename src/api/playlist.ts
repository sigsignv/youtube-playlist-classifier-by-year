import { youtube_v3 } from '@googleapis/youtube'
import { z } from 'zod'
import { YouTubeClient } from './factory'

const playlist = z.object({
    kind: z.literal('youtube#playlist'),
    id: z.string(),
    title: z.string(),
})
export type Playlist = z.infer<typeof playlist>

export type GetPlaylistsOptions = youtube_v3.Params$Resource$Playlists$List

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

export async function dropPlaylist(youtube: YouTubeClient, playlistId: string): Promise<void> {
    await youtube.playlists.delete({ id: playlistId })
}

export async function getPlaylists(youtube: YouTubeClient, options: GetPlaylistsOptions): Promise<Playlist[]> {
    const list: Playlist[] = []
    const params: GetPlaylistsOptions = {
        part: ['snippet'],
        maxResults: 50,
        ...options,
    }

    do {
        const resp = await youtube.playlists.list(params)
        for (const item of resp.data.items ?? []) {
            list.push(
                playlist.parse({
                    kind: item.kind,
                    id: item.id,
                    title: item.snippet?.title,
                }),
            )
        }
        params.pageToken = resp.data.nextPageToken ?? undefined
    } while (params.pageToken)

    return list
}

export async function getOwnPlaylists(youtube: YouTubeClient): Promise<Playlist[]> {
    return await getPlaylists(youtube, { mine: true })
}
