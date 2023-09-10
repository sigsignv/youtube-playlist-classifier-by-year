import { Credentials } from 'google-auth-library'

export type Token = {
    CLIENT_ID: string
    CLIENT_SECRET: string
    CREDENTIALS?: Credentials
}

export function parseToken(data: string): Token {
    const config: Token = JSON.parse(data)

    if (typeof config.CLIENT_ID !== 'string') {
        throw new Error('Require CLIENT_ID')
    }
    if (typeof config.CLIENT_SECRET !== 'string') {
        throw new Error('Require CLIENT_SECRET')
    }

    return config
}

export function dumpToken(token: Token): string {
    if (typeof token.CLIENT_ID !== 'string') {
        throw new Error('Require Token.CLIENT_ID as string')
    }
    if (typeof token.CLIENT_SECRET !== 'string') {
        throw new Error('Require Token.CLIENT_SECRET as string')
    }

    return JSON.stringify(token, null, 2)
}
