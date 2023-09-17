import { google, youtube_v3 } from 'googleapis'

const youtube = google.youtube({ version: 'v3' })

type YouTubeAuth = Exclude<youtube_v3.Params$Resource$Playlists$List['auth'], undefined>
type PrivacyStatus = 'private' | 'unlisted' | 'public'

export interface PlaylistOptions {
    auth: YouTubeAuth
    privacyStatus?: PrivacyStatus
}

export async function createPlaylist(title: string, options: PlaylistOptions) {
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

    if (resp.status !== 200) {
        throw new Error(`[createPlaylist] Unexpected error: ${resp.statusText}`)
    }

    const kind = 'youtube#playlist'
    if (resp.data.kind !== kind) {
        throw new Error(`[createPlaylist] Should be response as '${kind}'`)
    }

    return resp
}

export async function dropPlaylist(id: string, options: PlaylistOptions): Promise<boolean> {
    const resp = await youtube.playlists.delete({
        auth: options.auth,
        id: id,
    })

    return resp.status === 204
}
