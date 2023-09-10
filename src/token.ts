import { dirname, resolve } from 'node:path'

export function getConfigPath(): string {
    return resolve(dirname(__dirname), './config.json')
}
