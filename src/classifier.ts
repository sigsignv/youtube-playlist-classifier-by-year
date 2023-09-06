import { isAfter, startOfMonth, startOfYear } from 'date-fns'
import { OAuth2Client } from "google-auth-library"
import { getOwnPlaylists } from "./playlist"

type YaerlyWatchLists = {
    [key: string]: string
}

function validateYear(year: string): boolean {
    if (typeof year !== 'string' || !(/^\d{4}$/.test(year))) {
        return false
    }

    const startAtYouTube = new Date('2005-02-14')
    if (isAfter(new Date(year), startOfYear(startAtYouTube))) {
        return true
    }

    return false
}

function validateMonth(month: string): boolean {
    if (typeof month !== 'string' || !(/^\d{4}-\d{2}$/.test(month))) {
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

export async function getYearlyWatchLists(client: OAuth2Client) {
    const re = /^WL ((?<year>\d{4})|(?<month>\d{4}-\d{2}))$/
    const yearlyWatchLists: YaerlyWatchLists = {}

    const ownPlaylists = await getOwnPlaylists(client)
    for (const list of ownPlaylists) {
        const period = getPeriod(list.title.match(re)?.groups)
        if (period) {
            yearlyWatchLists[period] = list.id
        }
    }

    return yearlyWatchLists
}
