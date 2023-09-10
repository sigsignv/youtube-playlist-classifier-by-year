import { OAuth2Client } from 'google-auth-library'
import { getYouTubeClient } from './auth/client'
import { getConfigPath } from './token'

export async function getOAuth2Client(): Promise<OAuth2Client> {
    return await getYouTubeClient(getConfigPath())
}
