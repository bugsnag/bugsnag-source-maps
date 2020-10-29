import commandLineArgs, { OptionDefinition } from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as browser from '../uploaders/BrowserUploader'
import logger from '../Logger'
import { LogLevel } from 'consola'

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
    name: 'quiet',
    type: Boolean,
    description: 'less verbose logging'
  },
  {
    name: 'version',
    type: Boolean,
    description: 'output the version of the CLI module'
  }
]

export default async function run (argv: string[]): Promise<void> {
  const opts = commandLineArgs(topLevelDefs, { argv, stopAtFirstUnknown: true })

  if (opts.quiet) logger.level = LogLevel.Success

  switch (opts.command) {
    case 'upload-browser': {

      const defs: OptionDefinition[] = [
        ...commonCommandDefs,
        ...browserCommandCommonDefs,
        ...browserCommandSingleDefs,
        ...browserCommandMultipleDefs
      ]
      let browserOpts
      try {
        browserOpts = commandLineArgs(defs, { argv: opts._unknown || [], camelCase: true })
        if (opts.help) return browserUsage()
        validateBrowserOpts(browserOpts)
      } catch (e) {
        process.exitCode = 1
        if (e.name === 'UNKNOWN_VALUE') {
          logger.error(`Invalid argument provided. ${e.message}`)
        } else {
          logger.error(e.message)
        }
        return browserUsage()
      }
      try {
        if (browserOpts.sourceMap) {
          // single mode
          await browser.uploadOne({
            apiKey: browserOpts.apiKey,
            sourceMap: browserOpts.sourceMap,
            bundleUrl: browserOpts.bundleUrl,
            bundle: browserOpts.bundle,
            projectRoot: browserOpts.projectRoot,
            overwrite: browserOpts.overwrite,
            appVersion: browserOpts.appVersion,
            endpoint: browserOpts.endpoint,
            logger
          })
        }
      } catch (e) {
        process.exitCode = 1
      }
      break
    }
    case 'upload-node':
      console.log('TODO')
      break
    case 'upload-react-native':
      console.log('TODO')
      break
    default:
      if (opts.help) return usage()
      if (opts.command) {
        logger.error(`Unrecognized command "${opts.command}"`)
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

function browserUsage (): void {
  console.log(
    commandLineUsage([
      { content: 'bugsnag-source-maps upload-browser [...opts]' },
      {
        header: 'Options',
        optionList: [ ...commonCommandDefs, ...browserCommandCommonDefs ]
      },
      {
        header: 'Single upload',
        content: 'Options for uploading a source map for a single bundle'
      },
      {
        optionList: [ ...browserCommandSingleDefs ]
      },
      {
        header: 'Multiple upload',
        content: 'Options for recursing directory and upload multiple source maps'
      },
      {
        optionList: [ ...browserCommandMultipleDefs ]
      }
    ])
  )
}

const commonCommandDefs = [
  { name: 'api-key', type: String, description: 'your project\'s API key {bold required}' },
  { name: 'overwrite', type: Boolean, description: 'whether to replace exiting source maps uploaded with the same version' },
  { name: 'project-root', type: String, description: 'the top level directory of your project' },
  { name: 'endpoint', type: String, description: 'customize the endpoint for Bugsnag On-Premise' }
]

const browserCommandCommonDefs = [ { name: 'app-version', type: String } ]

const browserCommandSingleDefs = [
  { name: 'source-map', type: String, description: 'the path to the source map {bold required}', typeLabel: '{underline file}' },
  { name: 'bundle-url', type: String, description: 'the URL the bundle is served at (may contain * wildcards) {bold required}', typeLabel: '{underline url}' },
  { name: 'bundle', type: String, description: 'the path to the bundle', typeLabel: '{underline file}' },
]
const browserCommandMultipleDefs = [
  { name: 'directory', type: String, description: 'the directory to start searching for source maps in {bold required}', typeLabel: '{underline path}' },
  { name: 'base-url', type: String, description: 'the base URL that JS bundles are served from (may contain * wildcards) {bold required}', typeLabel: '{underline url}' },
]

function validateBrowserOpts (opts: Record<string, unknown>): void {
  if (!opts['apiKey']) throw new Error('--api-key is a required parameter')
  const anySingleSet = opts['sourceMap'] || opts['bundleUrl'] || opts['bundle']
  const anyMultipleSet = opts['baseUrl'] || opts['directory']
  if (anySingleSet && anyMultipleSet) {
    throw new Error('Incompatible options are set. Use either single mode options (--source-map, --bundle, --bundle-url) or multiple mode options (--directory,--base-url).')
  }
  if (!anySingleSet && !anyMultipleSet) throw new Error('Not enough options supplied')

  if (anySingleSet) {
    // single mode
    if (!opts['sourceMap']) throw new Error('--sourcemap is required')
    if (!opts['bundleUrl']) throw new Error('--bundle-url is required')
  } else {
    // multiple mode
    if (!opts['directory']) throw new Error('--directory is required')
    if (!opts['base-url']) throw new Error('--base-url is required')
  }
}
