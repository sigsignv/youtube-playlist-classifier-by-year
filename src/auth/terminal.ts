import { OAuth2Client } from 'google-auth-library'
import { createInterface } from 'node:readline/promises'

export async function getNewRefreshToken(client: OAuth2Client): Promise<string> {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/youtube'
        ],
    })
    console.log('Please access to authorize URL:', authUrl)

    const terminal = createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const code = await terminal.question('Enter code: ')
    terminal.close()

    const resp = await client.getToken(code)
    const token = resp.tokens.refresh_token
    if (!token) {
        throw new Error('Require refresh_token in Response')
    }

    return token
}
