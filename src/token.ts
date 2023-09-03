import { Credentials } from 'google-auth-library'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export type Token = {
    id: string
    secret: string
    credentials: Credentials | null
}

function getConfigPath(): string {
    return resolve(dirname(__dirname), './config.json')
}

async function readConfig(filepath: string): Promise<Token> {
    const contents = await readFile(filepath, { encoding: 'utf-8' })
    const json = JSON.parse(contents)
    const token: Token = {
        id: json['CLIENT_ID'] ?? '',
        secret: json['CLIENT_SECRET'] ?? '',
        credentials: json['CREDENTIALS'] ?? null
    }
    return token
}

async function writeConfig(filepath: string, token: Token): Promise<void> {
    const json = {
        CLIENT_ID: token.id,
        CLIENT_SECRET: token.secret,
        CREDENTIALS: token.credentials,
    }
    const contents = JSON.stringify(json, null, 2)
    return await writeFile(filepath, contents, {
        encoding: 'utf-8',
        flag: 'w',
    })
}

export function getConfig(): Promise<Token> {
    const path = getConfigPath()
    return readConfig(path)
}

export function setConfig(token: Token): Promise<void> {
    const path = getConfigPath()
    return writeConfig(path, token)
}
