import { OAuth2Client } from "google-auth-library"
import { google } from 'googleapis'

type Video = {
    id: string
    title: string
    channelName: string
    playlistId: string
    publishedAt: string
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

    const videos: Video[] = []
    const items = response.data.items ?? []
    for (const item of items) {
        videos.push({
            id: item.snippet?.resourceId?.videoId ?? '',
            title: item.snippet?.title ?? '',
            channelName: item.snippet?.videoOwnerChannelTitle ?? '',
            playlistId: item.snippet?.playlistId ?? '',
            publishedAt: item.contentDetails?.videoPublishedAt ?? '',
        })
    }

    const nextPageToken = response.data.nextPageToken
    const nextVideos = nextPageToken ? await getVideos(client, playlistId, nextPageToken) : []

    return videos.concat(nextVideos)
}
