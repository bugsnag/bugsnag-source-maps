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
      // TODO
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
    typeLabel: '{underline file}'
  },
  {
    name: 'bundle-url',
    type: String,
    description: 'the URL the bundle is served at (may contain * wildcards) {bold required}',
    typeLabel: '{underline url}'
  },
  {
    name: 'bundle',
    type: String,
    description: 'the path to the bundle',
    typeLabel: '{underline file}'
  },
]
const browserCommandMultipleDefs = [
  {
    name: 'directory',
    type: String,
    description: 'the directory to start searching for source maps in {bold required}',
    typeLabel: '{underline path}'
  },
  {
    name: 'base-url',
    type: String,
    description: 'the base URL that JS bundles are served from (may contain * wildcards) {bold required}',
    typeLabel: '{underline url}'
  },
]

function validateBrowserOpts (opts: Record<string, unknown>): void {
  if (!opts['apiKey']) throw new Error('--api-key is required')
  const anySingleSet = opts['sourceMap'] || opts['bundleUrl'] || opts['bundle']
  const anyMultipleSet = opts['baseUrl'] || opts['directory']
  if (anySingleSet && anyMultipleSet) {
    throw new Error('Incompatible options are set. Use either single mode options (--source-map, --bundle, --bundle-url) or multiple mode options (--directory,--base-url).')
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
