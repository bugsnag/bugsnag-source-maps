import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import logger from '../Logger'
import uploadBrowser from '../commands/UploadBrowserCommand'

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
  const opts = commandLineArgs(topLevelDefs, { argv, stopAtFirstUnknown: true })

  switch (opts.command) {
    case 'upload-browser':
      await uploadBrowser(opts._unknown || [], opts)
      break
    case 'upload-node':
      console.log('TODO')
      break
    case 'upload-react-native':
      console.log('TODO')
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
