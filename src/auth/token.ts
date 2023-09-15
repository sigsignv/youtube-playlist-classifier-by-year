export type Token = {
    CLIENT_ID: string
    CLIENT_SECRET: string
    REFRESH_TOKEN?: string
}

function isToken(token: unknown): token is Token {
    if (typeof token !== 'object' || token === null) {
        return false
    }
    if (!('CLIENT_ID' in token) || typeof token.CLIENT_ID !== 'string') {
        return false
    }
    if (!('CLIENT_SECRET' in token) || typeof token.CLIENT_SECRET !== 'string') {
        return false
    }

    return true
}

export function parseToken(json: string): Token {
    const token: unknown = JSON.parse(json)
    if (!isToken(token)) {
        throw new Error('[parseToken] Require CLIENT_ID / CLIENT_SECRET as string')
    }

    return token
}

export function dumpToken(token: Token): string {
    return JSON.stringify(token, null, 2)
}
