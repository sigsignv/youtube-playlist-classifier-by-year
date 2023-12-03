import { dirname, resolve } from 'node:path'
import { getYouTubeClient } from "./auth/client"

async function main() {
    const client = await getYouTubeClient(resolve(dirname(__dirname), './config.json'))
    console.log(client)
}

main()
