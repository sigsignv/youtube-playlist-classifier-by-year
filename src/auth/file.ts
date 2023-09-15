import { readFile } from 'node:fs/promises'
import { default as writeFileAtomic } from 'write-file-atomic'

export function readConfigFile(filepath: string): Promise<string> {
    return readFile(filepath, {
        encoding: 'utf-8',
    })
}

export function writeConfigFile(filepath: string, data: string): Promise<void> {
    return writeFileAtomic(filepath, data, {
        encoding: 'utf-8',
        fsync: true,
    })
}
