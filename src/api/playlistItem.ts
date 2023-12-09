import { youtube_v3 } from '@googleapis/youtube'
import { z } from 'zod'
import { YouTubeClient } from './factory'

const playlistItem = z.object({
    kind: z.literal('youtube#playlistItem'),
    id: z.string(),
    title: z.string(),
    publishedAt: z.string().datetime(),
    channelId: z.string(),
    playlistId: z.string(),
})
export type PlaylistItem = z.infer<typeof playlistItem>

export type GetPlaylistItemsOptions = youtube_v3.Params$Resource$Playlistitems$List

export async function addPlaylistItem(
    youtube: YouTubeClient,
    playlistId: string,
    videoId: string,
): Promise<PlaylistItem> {
    const resp = await youtube.playlistItems.insert({
        part: ['contentDetails', 'snippet'],
        requestBody: {
            snippet: {
                playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId,
                },
            },
        },
    })

    return playlistItem.parse({
        kind: resp.data.kind,
        id: resp.data.contentDetails?.videoId,
        title: resp.data.snippet?.title,
        publishedAt: resp.data.contentDetails?.videoPublishedAt,
        channelId: resp.data.snippet?.videoOwnerChannelId,
        playlistId: resp.data.snippet?.playlistId,
    })
}

export async function deletePlaylistItem(youtube: YouTubeClient, playlistItemId: string): Promise<void> {
    await youtube.playlistItems.delete({ id: playlistItemId })
}

export async function getPlaylistItems(
    youtube: YouTubeClient,
    options: GetPlaylistItemsOptions,
): Promise<PlaylistItem[]> {
    const list: PlaylistItem[] = []
    const params: GetPlaylistItemsOptions = {
        part: ['contentDetails', 'snippet'],
        maxResults: 50,
        ...options,
    }

    do {
        const resp = await youtube.playlistItems.list(params)
        for (const item of resp.data.items ?? []) {
            list.push(
                playlistItem.parse({
                    kind: item.kind,
                    id: item.contentDetails?.videoId,
                    title: item.snippet?.title,
                    publishedAt: item.contentDetails?.videoPublishedAt,
                    channelId: item.snippet?.videoOwnerChannelId,
                    playlistId: item.snippet?.playlistId,
                }),
            )
        }
        params.pageToken = resp.data.nextPageToken ?? undefined
    } while (params.pageToken)

    return list
}
