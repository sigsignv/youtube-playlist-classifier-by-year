import { google } from 'googleapis'
import { YouTubeClient } from '../auth/client'

const youtube = google.youtube({ version: 'v3' })

export type CreatePlaylistOptions = {
    auth: YouTubeClient
    privacyStatus?: 'private' | 'unlisted' | 'public'
}

export async function createPlaylist(title: string, options: CreatePlaylistOptions) {
    return await youtube.playlists.insert({
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
}
