import { isAfter, startOfYear } from 'date-fns'
import { OAuth2Client } from "google-auth-library"
import { getOwnPlaylists } from "./playlist"

type YaerlyWatchLists = {
    [key: string]: string
}

export function validateYear(year: string): boolean {
    if (typeof year !== 'string') {
        return false
    }

    const startAtYouTube = new Date('2005-02-14')
    if (isAfter(new Date(year), startOfYear(startAtYouTube))) {
        return true
    }

    return false
}

export async function getYearlyWatchLists(client: OAuth2Client) {
    const yearlyWatchLists: YaerlyWatchLists = {}

    const ownPlaylists = await getOwnPlaylists(client)
    const regexp = /^WL ((?<year>\d{4})|(?<month>\d{4}-\d{2}))$/
    for (const list of ownPlaylists) {
        const result = list.title.match(regexp)
        if (!result) {
            continue
        }

        const year = result.groups?.year
        if (year && validateYear(year)) {
            yearlyWatchLists[year] = list.id
        }

        const month = result.groups?.month
        if (month) {
            yearlyWatchLists[month] = list.id
        }
    }

    return yearlyWatchLists
}
