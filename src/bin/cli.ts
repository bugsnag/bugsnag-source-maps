import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import logger from '../Logger'
import uploadBrowser from '../commands/UploadBrowserCommand'
import uploadReactNative from '../commands/UploadReactNativeCommand'
import uploadNode from '../commands/UploadNodeCommand'

const topLevelDefs = [
  {
    name: 'command',
    defaultOption: true
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'show this message'
  },
  {
    name: 'version',
    type: Boolean,
    description: 'output the version of the CLI module'
  }
]

export default async function run (argv: string[]): Promise<void> {
  try {
    const opts = commandLineArgs(topLevelDefs, { argv, stopAtFirstUnknown: true })

    if (opts.version) {
      return console.log(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        `@bugsnag/source-maps v${require('../../package.json').version}`
      )
    }

    switch (opts.command) {
      case 'upload-browser':
        await uploadBrowser(opts._unknown || [], opts)
        break

      case 'upload-node':
        await uploadNode(opts._unknown || [], opts)
        break

      case 'upload-react-native':
        await uploadReactNative(opts._unknown || [], opts)
        break

      default:
        if (opts.help) return usage()
        if (opts.command) {
          logger.error(`Unrecognized command "${opts.command}".`)
        } else {
          logger.error(`Command expected, nothing provided.`)
        }
        usage()
    }
  } catch (e: any) {
    logger.error(`Invalid options. ${e.message}`)
    process.exitCode = 1
  }
}

function usage (): void {
  console.log(
    commandLineUsage([
      { content: 'bugsnag-source-maps <command>'},
      { header: 'Available commands', content: 'upload-browser\nupload-node\nupload-react-native' },
      { header: 'Options', optionList: topLevelDefs, hide: [ 'command' ] }
    ])
  )
}
