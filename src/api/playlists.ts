import { google, youtube_v3 } from 'googleapis'

const youtube = google.youtube({ version: 'v3' })

type YouTubeAuth = Exclude<youtube_v3.Params$Resource$Playlists$List['auth'], undefined>
type PrivacyStatus = 'private' | 'unlisted' | 'public'

export interface PlaylistOptions {
    auth: YouTubeAuth
    privacyStatus?: PrivacyStatus
}

export interface YouTubePlaylist {
    id: string
    title: string
    privacyStatus: PrivacyStatus
    publishedAt: string
}

function isPrivacyStatus(status: string | null | undefined): status is PrivacyStatus {
    if (typeof status !== 'string') {
        return false
    }
    if (!['private', 'unlisted', 'public'].includes(status)) {
        return false
    }

    return true
}

function convertPlaylist(data: youtube_v3.Schema$Playlist): YouTubePlaylist {
    const id = data.id
    if (typeof id !== 'string') {
        throw new Error('[convertPlaylist] Require id as string')
    }
    const title = data.snippet?.title
    if (typeof title !== 'string') {
        throw new Error('[convertPlaylist] Require title as string')
    }
    const privacyStatus = data.status?.privacyStatus
    if (!isPrivacyStatus(privacyStatus)) {
        throw new Error('[convertPlaylist] Require privacyStatus as private, unlisted or public')
    }
    const publishedAt = data.snippet?.publishedAt
    if (typeof publishedAt !== 'string') {
        throw new Error('[convertPlaylist] Require publishedAt as string')
    }

    return { id, title, privacyStatus, publishedAt }
}

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

    return convertPlaylist(resp.data)
}

export async function dropPlaylist(id: string, options: PlaylistOptions): Promise<boolean> {
    const resp = await youtube.playlists.delete({
        auth: options.auth,
        id: id,
    })

    return resp.status === 204
}
