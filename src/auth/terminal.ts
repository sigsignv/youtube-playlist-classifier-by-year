import { createInterface } from 'node:readline/promises'
import { OAuth2Client } from 'google-auth-library'

export async function getNewRefreshToken(client: OAuth2Client): Promise<string> {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube'],
    })
    console.log('Please access to authorize URL:', authUrl)

    const terminal = createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const code = await terminal.question('Enter code: ')
    terminal.close()

    const resp = await client.getToken(code)
    const refreshToken = resp.tokens.refresh_token
    if (!refreshToken) {
        throw new Error('[getNewRefreshToken] Require refresh_token in Response')
    }

    return refreshToken
}
