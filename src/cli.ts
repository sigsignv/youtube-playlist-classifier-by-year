import { Command } from 'commander'

async function main() {
    const program = new Command()

    program
        .name('ypp')
        .version('0.1.0')
        .description('A YouTube playlist manager')

    program.parse(process.argv)

    if (program.args.length === 0) {
        program.help()
    }
}

main()
