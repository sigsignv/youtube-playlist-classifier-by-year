import { youtube, youtube_v3 } from '@googleapis/youtube'
import { OAuth2Client } from 'google-auth-library'

type YouTubeClient = youtube_v3.Youtube

export function YouTubeFactory(auth: OAuth2Client): YouTubeClient {
    return youtube({
        auth: auth,
        version: 'v3',
    })
}
