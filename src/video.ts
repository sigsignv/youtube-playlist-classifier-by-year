import { OAuth2Client } from "google-auth-library"
import { google, youtube_v3 } from 'googleapis'

type Video = {
    id: string
    title: string
    channelName: string
    publishedAt: string
}

type FetchVideosResponse = {
    videos: Video[]
    nextPageToken?: string | null
}

type FetchVideosOptions = {
    playlistId: string
    pageToken?: string
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

async function fetchVideosFromPlaylist(client: OAuth2Client, options: FetchVideosOptions): Promise<FetchVideosResponse> {
    const youtube = google.youtube({ version: 'v3' })

    const resp = await youtube.playlistItems.list({
        part: ['contentDetails', 'snippet'],
        auth: client,
        playlistId: options.playlistId,
        maxResults: 50,
        pageToken: options.pageToken ?? ''
    })

    const videos = convertVideos(resp.data.items)
    const nextPageToken = resp.data.nextPageToken

    return { videos, nextPageToken }
}

export async function getVideosFromPlaylist(client: OAuth2Client, id: string): Promise<Video[]> {
    let resp = await fetchVideosFromPlaylist(client, { playlistId: id })
    let videos = resp.videos

    while (resp.nextPageToken) {
        resp = await fetchVideosFromPlaylist(client, {
            playlistId: id,
            pageToken: resp.nextPageToken,
        })
        videos = videos.concat(resp.videos)
    }

    return videos
}

export async function containsVideoInPlaylists(client: OAuth2Client, playlistIds: string[]): Promise<(videoId: string) => boolean> {
    const list = new Set()
    for (const playlistId of playlistIds) {
        const videos = await getVideosFromPlaylist(client, playlistId)
        for (const video of videos) {
            list.add(video.id)
        }
    }

    return (videoId: string): boolean => {
        return list.has(videoId)
    }
}

export async function addVideoIntoPlaylist(client: OAuth2Client, playlistId: string, videoId: string): Promise<boolean> {
    const youtube = google.youtube({ version: 'v3' })

    const resp = await youtube.playlistItems.insert({
        part: ['snippet'],
        auth: client,
        requestBody: {
            snippet: {
                playlistId: playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId,
                },
            },
        },
    })

    return resp.status === 200
}
