import * as Yargs from 'yargs'
import yargs from 'yargs/yargs'
import * as browser from '../uploaders/BrowserUploader'
import logger from '../Logger'

const commonOpts: Record<string, Yargs.Options> = {
  apiKey: {
    describe: 'your project\'s API key',
    type: 'string',
    demandOption: true
  },
  overwrite: {
    describe: 'whether to replace existing source maps uploaded with the same version',
    default: false,
    type: 'boolean'
  },
  projectRoot: {
    describe: 'the root of your project',
    default: process.cwd(),
    type: 'string'
  },
  verbose: {
    describe: 'show detailed logs',
    default: false,
    type: 'boolean'
  }
}

export default function run (argv: string[]): void {
  const program = yargs()

  program
    .scriptName('bugsnag-source-maps')
    .command(
      'upload-node',
      'upload source maps for a Node app',
      {}
    )
    .command(
      'upload-browser',
      'upload source maps for a browser JS app',
      yargs => {
        return yargs
          .options({
            ...commonOpts,
            appVersion: {
              describe: 'the version of the app the source map applies to',
              type: 'string'
            },
            bundleUrl: {
              describe: 'the URL of the bundle this source map is for is served at (may contain * wildcards)',
              group: 'Single upload'
            },
            bundle: {
              describe: 'the path to the bundle',
              type: 'string',
              group: 'Single upload'
            },
            sourceMap: {
              describe: 'the path to the source map',
              type: 'string',
              group: 'Single upload'
            },
            directory: {
              describe: 'the path generated sources and source maps',
              type: 'string',
              group: 'Bulk upload'
            },
            baseUrl: {
              describe: 'the base URL your bundles are served from (may contain * wildcards)',
              type: 'string',
              group: 'Bulk upload'
            }
          })
          .conflicts('bundle', ['baseUrl', 'directory'])
          .conflicts('baseUrl', ['bundleUrl', 'bundle', 'sourceMap'])
      },
      async (argv) => {
        logger.trace('cli: upload-browser', argv)
        if (argv.bundleUrl && argv.sourceMap) {
          try {
            await browser.uploadOne({
              apiKey: argv.apiKey as string,
              bundleUrl: argv.bundleUrl as string,
              sourceMap: argv.sourceMap as string,
              bundle: argv.bundle as string,
              appVersion: argv.appVersion as string,
              projectRoot: argv.projectRoot as string,
              overwrite: argv.overwrite as boolean | undefined,
              endpoint: argv.endpoint as string | undefined,
              logger: logger
            })
          } catch (e) {
            process.exitCode = 1
          }
        } else if (argv.directory && argv.baseUrl) {
          logger.info(`Uploading browser source map for ${argv.bundleUrl}`)
        } else {
          return program.showHelp()
        }
      }
    )
    .command(
      'upload-react-native',
      'upload source maps for a React Native app',
      {}
    )
    .help()
    .demandCommand()
    .wrap(program.terminalWidth())
    .parse(argv.slice(2))
}