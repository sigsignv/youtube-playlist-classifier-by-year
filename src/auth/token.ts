import { z } from 'zod'

const Token = z.object({
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    REFRESH_TOKEN: z.string().optional()
})

export type Token = z.infer<typeof Token>

export function parseToken(json: string): Token {
    return Token.parse(JSON.parse(json))
}

export function dumpToken(token: Token): string {
    return JSON.stringify(token, null, 2)
}
