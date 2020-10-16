import yargs from 'yargs/yargs'
import { uploadBrowser, uploadNode, uploadReactNative } from '../'

export default function run (argv: string[]): void {
  const program = yargs(argv.slice(2))

  program
    .scriptName('bugsnag-source-maps')
    .options({})
    .command(
      'upload-node',
      'upload source maps for a Node app',
      {}
    )
    .command(
      'upload-browser',
      'upload source maps for a browser JS app',
      {}
    )
    .command(
      'upload-react-native',
      'upload source maps for a React Native app',
      {}
    )
    .help()
    .demandCommand()
    .wrap(program.terminalWidth())
  
  switch (program.argv._[0]) {
    case 'upload-node':
      uploadNode()
      break
    case 'upload-react-native':
      uploadReactNative()
      break
    case 'upload-browser':
      uploadBrowser()
      break
  }
}