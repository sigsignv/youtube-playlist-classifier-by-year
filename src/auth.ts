import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { createInterface } from 'node:readline/promises'
import { getConfig, setConfig } from './token.ts'

export async function getOAuth2Client(): Promise<OAuth2Client> {
    const token = await getConfig()
    const client = new google.auth.OAuth2(token.id, token.secret, 'urn:ietf:wg:oauth:2.0:oob')
    if (token.credentials) {
        client.credentials = token.credentials
        return client
    }

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube'],
    })
    console.log('Auth URL: ', url)

    const terminal = createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const answer = await terminal.question('Enter code: ')
    terminal.close()
    const response = await client.getToken(answer)

    token.credentials = response.tokens
    await setConfig(token)

    client.credentials = response.tokens
    return client
}
