import commandLineArgs, { OptionDefinition } from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as browser from '../uploaders/BrowserUploader'
import logger from '../Logger'
import { LogLevel } from 'consola'
import { commonCommandDefs } from './CommandDefinitions'

export default async function uploadBrowser (argv: string[], opts: Record<string, unknown>): Promise<void> {
  const defs: OptionDefinition[] = [
    ...commonCommandDefs,
    ...browserCommandCommonDefs,
    ...browserCommandSingleDefs,
    ...browserCommandMultipleDefs
  ]
  let browserOpts
  try {
    browserOpts = commandLineArgs(defs, { argv, camelCase: true })
    if (opts.help) return browserUsage()
    if (browserOpts.quiet) logger.level = LogLevel.Success
    validateBrowserOpts(browserOpts)
  } catch (e) {
    process.exitCode = 1
    if (e.name === 'UNKNOWN_VALUE') {
      logger.error(`Invalid argument provided. ${e.message}`)

      // Check if the user provided an argument that allows a wildcard ('*') and
      // if so, warn them about wrapping the value in quotes
      const wildcardArgument = argv.find(arg => arg === '--bundle-url' || arg === '--base-url')

      if (wildcardArgument) {
        logger.info(`Values that contain a wildcard must be wrapped in quotes to prevent shell expansion, for example ${wildcardArgument} "*"`)
      }
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
    } else {
      // multiple mode
      await browser.uploadMultiple({
        apiKey: browserOpts.apiKey,
        baseUrl: browserOpts.baseUrl,
        directory: browserOpts.directory,
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

const browserCommandCommonDefs = [ { name: 'app-version', type: String } ]

const browserCommandSingleDefs = [
  {
    name: 'source-map',
    type: String,
    description: 'the path to the source map {bold required}',
    typeLabel: '{underline filepath}'
  },
  {
    name: 'bundle-url',
    type: String,
    description: 'the URL of the bundle file (may contain * wildcards) {bold required}',
    typeLabel: '{underline url}'
  },
  {
    name: 'bundle',
    type: String,
    description: 'the path to the bundle',
    typeLabel: '{underline filepath}'
  },
]
const browserCommandMultipleDefs = [
  {
    name: 'directory',
    type: String,
    description: 'the directory to start searching for source maps in, relative to the project root {bold required}',
    typeLabel: '{underline path}'
  },
  {
    name: 'base-url',
    type: String,
    description: 'the URL of the base directory that JS files are served from (may contain * wildcards) {bold required}',
    typeLabel: '{underline url}'
  },
]

function validateBrowserOpts (opts: Record<string, unknown>): void {
  if (!opts['apiKey']) throw new Error('--api-key is required')
  const anySingleSet = opts['sourceMap'] || opts['bundleUrl'] || opts['bundle']
  const anyMultipleSet = opts['baseUrl'] || opts['directory']
  if (anySingleSet && anyMultipleSet) {
    throw new Error('Incompatible options are set. Use either single mode options (--source-map, --bundle, --bundle-url) or multiple mode options (--directory, --base-url).')
  }
  if (!anySingleSet && !anyMultipleSet) throw new Error('Not enough options supplied')

  if (anySingleSet) {
    // single mode
    if (!opts['sourceMap']) throw new Error('--source-map is required')
    if (!opts['bundleUrl']) throw new Error('--bundle-url is required')
  } else {
    // multiple mode
    if (!opts['directory']) throw new Error('--directory is required')
    if (!opts['baseUrl']) throw new Error('--base-url is required')
  }
}
