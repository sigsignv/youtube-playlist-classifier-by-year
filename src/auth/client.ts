import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { env } from 'node:process'
import { readConfigFile, writeConfigFile } from './file'
import { getNewCredentials } from './terminal'
import { dumpToken, parseToken } from './token'

const OAuth2 = google.auth.OAuth2
const RedirectUri = 'urn:ietf:wg:oauth:2.0:oob'

function getClientFromEnv(): OAuth2Client | null {
    const id = env.YOUTUBE_CLIENT_ID
    const secret = env.YOUTUBE_CLIENT_SECRET
    const token = env.YOUTUBE_REFRESH_TOKEN

    if (!id || !secret || !token) {
        return null
    }

    const client = new OAuth2(id, secret, RedirectUri)
    client.setCredentials({
        refresh_token: token
    })

    return client
}

async function getClientFromFile(filepath: string): Promise<OAuth2Client> {
    const token = parseToken(await readConfigFile(filepath))

    const client = new OAuth2(token.CLIENT_ID, token.CLIENT_SECRET, RedirectUri)
    if (!token.CREDENTIALS) {
        token.CREDENTIALS = await getNewCredentials(client)
        await writeConfigFile(filepath, dumpToken(token))
    }
    client.setCredentials(token.CREDENTIALS)

    return client
}

export async function getOAuth2Client(filepath: string): Promise<OAuth2Client> {
    return getClientFromEnv() ?? getClientFromFile(filepath)
}
