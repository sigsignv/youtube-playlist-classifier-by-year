import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

type Playlist = {
    id: string
    title: string
}

export async function getPlaylists(client: OAuth2Client, pageToken: string = ''): Promise<Playlist[]> {
    const youtube = google.youtube({ version: 'v3' })

    const response = await youtube.playlists.list({
        part: ['id', 'snippet'],
        auth: client,
        fields: 'items(id,snippet(title))',
        maxResults: 50,
        mine: true,
        pageToken: pageToken,
    })

    const playlists: Playlist[] = []
    const items = response.data?.items ?? []
    for (const item of items) {
        playlists.push({
            id: item.id ?? '',
            title: item.snippet?.title ?? ''
        })
    }

    const nextPageToken = response?.data?.nextPageToken
    if (nextPageToken) {
        playlists.concat(await getPlaylists(client, nextPageToken))
    }

    return playlists
}

export async function createPlaylist(client: OAuth2Client, title: string): Promise<Playlist> {
    const youtube = google.youtube({ version: 'v3' })

    const response = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        auth: client,
        fields: 'id,snippet(title)',
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
        id: response.data?.id ?? '',
        title: response.data?.snippet?.title ?? '',
    }

    return playlist
}
