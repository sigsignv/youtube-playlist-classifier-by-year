import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { getNewCredentials } from './auth/terminal'
import { getConfig, setConfig } from './token'

export async function getOAuth2Client(): Promise<OAuth2Client> {
    const token = await getConfig()
    const client = new google.auth.OAuth2(token.id, token.secret, 'urn:ietf:wg:oauth:2.0:oob')
    if (token.credentials) {
        client.credentials = token.credentials
        return client
    }

    token.credentials = await getNewCredentials(client)
    await setConfig(token)

    client.credentials = token.credentials
    return client
}
