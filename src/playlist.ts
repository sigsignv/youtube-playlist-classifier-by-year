import { OAuth2Client } from 'google-auth-library'
import { google, youtube_v3 } from 'googleapis'

type Playlist = {
    id: string
    title: string
}

type FetchPlaylistResponse = {
    lists: Playlist[]
    nextPageToken?: string | null
}

type FetchPlaylistOptions = {
    pageToken?: string
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

async function fetchOwnPlaylists(client: OAuth2Client, options?: FetchPlaylistOptions): Promise<FetchPlaylistResponse> {
    const youtube = google.youtube({ version: 'v3' })

    const resp = await youtube.playlists.list({
        part: ['snippet'],
        auth: client,
        maxResults: 50,
        mine: true,
        pageToken: options?.pageToken ?? ''
    })

    const lists = convertPlaylist(resp.data.items)
    const nextPageToken = resp.data.nextPageToken

    return { lists, nextPageToken }
}

export async function getOwnPlaylists(client: OAuth2Client): Promise<Playlist[]> {
    let resp = await fetchOwnPlaylists(client)
    let lists = resp.lists

    while (resp.nextPageToken) {
        resp = await fetchOwnPlaylists(client, { pageToken: resp.nextPageToken })
        lists = lists.concat(resp.lists)
    }

    return lists
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
