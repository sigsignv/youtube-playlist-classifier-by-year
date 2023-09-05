import { OAuth2Client } from 'google-auth-library'
import { google, youtube_v3 } from 'googleapis'

type Playlist = {
    id: string
    title: string
}

function convertPlaylist(items?: youtube_v3.Schema$Playlist[]): Playlist[] {
    if (!Array.isArray(items) || items.length === 0) {
        return []
    }

    const lists = []
    for (const item of items) {
        const id = item.id
        const title = item.snippet?.title
        if (typeof id === 'string' && typeof title === 'string') {
            lists.push({id, title})
        }
    }

    return lists
}

export async function getPlaylists(client: OAuth2Client, pageToken: string = ''): Promise<Playlist[]> {
    const youtube = google.youtube({ version: 'v3' })

    const response = await youtube.playlists.list({
        part: ['snippet'],
        auth: client,
        maxResults: 50,
        mine: true,
        pageToken: pageToken,
    })

    const playlists: Playlist[] = convertPlaylist(response.data.items)

    const nextPageToken = response.data.nextPageToken
    const nextPlaylists = nextPageToken ? await getPlaylists(client, nextPageToken) : []

    return playlists.concat(nextPlaylists)
}

export async function createPlaylist(client: OAuth2Client, title: string): Promise<Playlist> {
    const youtube = google.youtube({ version: 'v3' })

    const response = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        auth: client,
        requestBody: {
            snippet: {
                title: title,
            },
            status: {
                privacyStatus: 'private',
            },
        },
    })

    const playlist: Playlist = {
        id: response.data.id ?? '',
        title: response.data.snippet?.title ?? '',
    }

    return playlist
}
