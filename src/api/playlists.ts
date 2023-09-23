import { google, youtube_v3 } from 'googleapis'
import { z } from 'zod'

const youtube = google.youtube({ version: 'v3' })

const privacyStatus = [
    'private',
    'unlisted',
    'public'
] as const

type YouTubeAuth = Exclude<youtube_v3.Params$Resource$Playlists$List['auth'], undefined>
type PrivacyStatus = typeof privacyStatus[number]

export interface PlaylistOptions {
    auth: YouTubeAuth
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
    const resp = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        auth: options.auth,
        requestBody: {
            snippet: {
                title: title,
            },
            status: {
                privacyStatus: options.privacyStatus ?? 'private'
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

export async function dropPlaylist(id: string, options: PlaylistOptions): Promise<boolean> {
    const resp = await youtube.playlists.delete({
        auth: options.auth,
        id: id,
    })

    return resp.status === 204
}
