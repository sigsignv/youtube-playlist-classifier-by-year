import { OAuth2Client } from 'google-auth-library'
import { getOAuth2Client as getOAuth2ClientNew } from './auth/client'
import { getConfigPath } from './token'

export async function getOAuth2Client(): Promise<OAuth2Client> {
    return await getOAuth2ClientNew(getConfigPath())
}
