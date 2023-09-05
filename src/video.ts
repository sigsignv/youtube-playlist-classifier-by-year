import { OAuth2Client } from "google-auth-library"
import { google, youtube_v3 } from 'googleapis'

type Video = {
    id: string
    title: string
    channelName: string
    publishedAt: string
}

function convertVideos(items?: youtube_v3.Schema$PlaylistItem[]): Video[] {
    if (!Array.isArray(items) || items.length === 0) {
        return []
    }

    const videos: Video[] = []
    for (const item of items) {
        const id = item.snippet?.resourceId?.videoId
        const title = item.snippet?.title
        const channelName = item.snippet?.videoOwnerChannelTitle
        const publishedAt = item.contentDetails?.videoPublishedAt
        if (
            typeof id === 'string' &&
            typeof title === 'string' &&
            typeof channelName === 'string' &&
            typeof publishedAt === 'string'
        ) {
            videos.push({ id, title, channelName, publishedAt })
        }
    }

    return videos
}

export async function getVideos(client: OAuth2Client, playlistId: string, pageToken: string = ''): Promise<Video[]> {
    const youtube = google.youtube({ version: 'v3' })

    const response = await youtube.playlistItems.list({
        part: ['contentDetails', 'snippet'],
        auth: client,
        playlistId: playlistId,
        maxResults: 50,
        pageToken: pageToken,
    })

    const videos = convertVideos(response.data.items)

    const nextPageToken = response.data.nextPageToken
    const nextVideos = nextPageToken ? await getVideos(client, playlistId, nextPageToken) : []

    return videos.concat(nextVideos)
}
