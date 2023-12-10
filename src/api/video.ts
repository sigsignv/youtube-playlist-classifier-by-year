import { z } from 'zod'
import { YouTubeClient } from './factory'

const video = z.object({
    kind: z.string(),
    id: z.string(),
    title: z.string(),
})
export type Video = z.infer<typeof video>

export async function getVideoInfo(youtube: YouTubeClient, videoIds: string[]) {
    const list: Video[] = []

    const resp = await youtube.videos.list({
        part: ['snippet'],
        id: videoIds,
    })

    for (const item of resp.data.items ?? []) {
        list.push(
            video.parse({
                kind: item.kind,
                id: item.id,
                title: item.snippet?.title,
            }),
        )
    }

    return list
}
