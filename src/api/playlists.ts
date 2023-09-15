import { google } from 'googleapis'
import { YouTubeClient } from '../auth/client'

const youtube = google.youtube({ version: 'v3' })

export type CreatePlaylistOptions = {
    auth: YouTubeClient
    privacyStatus?: 'private' | 'unlisted' | 'public'
}

export async function createPlaylist(title: string, options: CreatePlaylistOptions) {
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
