import { Credentials } from 'google-auth-library'
import { dirname, resolve } from 'node:path'
import { readConfigFile, writeConfigFile } from './auth/file'

export type Token = {
    id: string
    secret: string
    credentials?: Credentials
}

function getConfigPath(): string {
    return resolve(dirname(__dirname), './config.json')
}

async function readConfig(filepath: string): Promise<Token> {
    const contents = await readConfigFile(filepath)
    const json = JSON.parse(contents)
    const token: Token = {
        id: json['CLIENT_ID'] ?? '',
        secret: json['CLIENT_SECRET'] ?? '',
    }
    const credentials = json['CREDENTIALS']
    if (credentials) {
        token.credentials = credentials
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
    return await writeConfigFile(filepath, contents)
}

export function getConfig(): Promise<Token> {
    const path = getConfigPath()
    return readConfig(path)
}

export function setConfig(token: Token): Promise<void> {
    const path = getConfigPath()
    return writeConfig(path, token)
}
