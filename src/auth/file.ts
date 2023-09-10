import { readFile } from 'node:fs/promises'
import { default as writeFileAtomic } from 'write-file-atomic'

export async function readConfigFile(filepath: string): Promise<string> {
    return await readFile(filepath, {
        encoding: 'utf-8',
    })
}

export async function writeConfigFile(filepath: string, data: string): Promise<void> {
    return await writeFileAtomic(filepath, data, {
        encoding: 'utf-8',
        fsync: true,
    })
}
