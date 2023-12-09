import { format, isAfter, startOfMonth, startOfYear, subMonths } from 'date-fns'
import { OAuth2Client } from 'google-auth-library'
import { YouTubeFactory } from './api/factory'
import { createPlaylist, getPlaylists } from './api/playlist'
import { addVideoIntoPlaylist, containsVideoInPlaylists, getVideosFromPlaylist } from './video'

type YaerlyWatchLists = {
    [key: string]: string
}

function validateYear(year: string): boolean {
    if (typeof year !== 'string' || !/^\d{4}$/.test(year)) {
        return false
    }

    const startAtYouTube = new Date('2005-02-14')
    if (isAfter(new Date(year), startOfYear(startAtYouTube))) {
        return true
    }

    return false
}

function validateMonth(month: string): boolean {
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
        return false
    }

    const startAtYouTube = new Date('2005-02-14')
    if (isAfter(new Date(month), startOfMonth(startAtYouTube))) {
        return true
    }

    return false
}

function getPeriod(groups?: { [key: string]: string } | null): string | null {
    const year = groups?.year
    if (year && validateYear(year)) {
        return year
    }

    const month = groups?.month
    if (month && validateMonth(month)) {
        return month
    }

    return null
}

export async function getYearlyWatchLists(client: OAuth2Client): Promise<YaerlyWatchLists> {
    const re = /^WL ((?<year>\d{4})|(?<month>\d{4}-\d{2}))$/
    const yearlyWatchLists: YaerlyWatchLists = {}

    const youtube = YouTubeFactory(client)

    const ownPlaylists = await getPlaylists(youtube, { mine: true })
    for (const list of ownPlaylists) {
        const period = getPeriod(list.title.match(re)?.groups)
        if (period) {
            yearlyWatchLists[period] = list.id
        }
    }

    return yearlyWatchLists
}

async function addVideoWithPeriod(
    client: OAuth2Client,
    lists: YaerlyWatchLists,
    period: string,
    videoId: string,
): Promise<boolean> {
    const youtube = YouTubeFactory(client)

    let playlistId = lists[period]
    if (!playlistId) {
        const playlist = await createPlaylist(youtube, `WL ${period}`)
        playlistId = playlist.id
        lists[period] = playlist.id
        console.log('Create Playlist: ', playlist.title)
    }
    return await addVideoIntoPlaylist(client, playlistId, videoId)
}

export async function groupVideosByYear(client: OAuth2Client, playlistId: string): Promise<void> {
    const yearlyWatchLists = await getYearlyWatchLists(client)
    const containsVideos = await containsVideoInPlaylists(client, Object.values(yearlyWatchLists))

    const lists = await getVideosFromPlaylist(client, playlistId)
    const videos = lists.filter((video) => !containsVideos(video.id))

    const sixMonthAgo = startOfMonth(subMonths(new Date(), 6))
    for (const video of videos) {
        const date = new Date(video.publishedAt)
        if (isAfter(date, sixMonthAgo)) {
            const period = format(date, 'yyyy-MM')
            await addVideoWithPeriod(client, yearlyWatchLists, period, video.id)
        } else {
            const period = format(date, 'yyyy')
            await addVideoWithPeriod(client, yearlyWatchLists, period, video.id)
        }
    }
}
