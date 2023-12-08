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

type PlaylistItem = z.infer<typeof playlistItem>

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
