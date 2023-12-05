import { OAuth2Client } from 'google-auth-library'
import { z } from 'zod'
import { YouTubeFactory } from './factory'

const privacyStatus = ['private', 'unlisted', 'public'] as const

type PrivacyStatus = (typeof privacyStatus)[number]

export interface PlaylistOptions {
    auth: OAuth2Client
    privacyStatus?: PrivacyStatus
}

const youTubePlaylist = z.object({
    id: z.string(),
    title: z.string(),
    privacyStatus: z.enum(privacyStatus),
    publishedAt: z.string(),
})

export type YouTubePlaylist = z.infer<typeof youTubePlaylist>

export async function createPlaylist(title: string, options: PlaylistOptions): Promise<YouTubePlaylist> {
    const youtube = YouTubeFactory(options.auth)

    const resp = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title: title,
            },
            status: {
                privacyStatus: options.privacyStatus ?? 'private',
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
        privacyStatus: resp.data.status?.privacyStatus,
        publishedAt: resp.data.snippet?.publishedAt,
    })
}

export async function dropPlaylist(id: string, options: PlaylistOptions): Promise<void> {
    const youtube = YouTubeFactory(options.auth)

    await youtube.playlists.delete({
        id: id,
    })
}
