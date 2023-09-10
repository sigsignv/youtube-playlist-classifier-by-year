import { readFile, writeFile } from 'node:fs/promises'

export async function readConfigFile(filepath: string): Promise<string> {
    return await readFile(filepath, {
        encoding: 'utf-8',
    })
}

export async function writeConfigFile(filepath: string, data: string): Promise<void> {
    return await writeFile(filepath, data, {
        encoding: 'utf-8',
        flag: 'w',
    } )
}
