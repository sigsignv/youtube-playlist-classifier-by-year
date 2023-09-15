export type Token = {
    CLIENT_ID: string
    CLIENT_SECRET: string
    REFRESH_TOKEN?: string
}

function isToken(token: unknown): token is Token {
    if (typeof token !== 'object' || token === null) {
        return false
    }
    if (!('CLIENT_ID' in token)) {
        return false
    }
    if (!('CLIENT_SECRET' in token)) {
        return false
    }

    return true
}

export function parseToken(json: string): Token {
    const config: unknown = JSON.parse(json)

    if (!isToken(config)) {
        throw new Error('[parseToken] Require CLIENT_ID / CLIENT_SECRET')
    }
    if (typeof config.CLIENT_ID !== 'string') {
        throw new Error('[parseToken] Require CLIENT_ID')
    }
    if (typeof config.CLIENT_SECRET !== 'string') {
        throw new Error('[parseToken] Require CLIENT_SECRET')
    }

    return config
}

export function dumpToken(token: Token): string {
    if (typeof token.CLIENT_ID !== 'string') {
        throw new Error('[dumpToken] Require Token.CLIENT_ID as string')
    }
    if (typeof token.CLIENT_SECRET !== 'string') {
        throw new Error('[dumpToken] Require Token.CLIENT_SECRET as string')
    }

    return JSON.stringify(token, null, 2)
}
