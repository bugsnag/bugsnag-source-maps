import commandLineArgs, { OptionDefinition } from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as node from '../uploaders/NodeUploader'
import logger from '../Logger'
import { LogLevel } from 'consola'
import { commonCommandDefs } from './CommandDefinitions'

export default async function uploadNode (argv: string[], opts: Record<string, unknown>): Promise<void> {
  const defs: OptionDefinition[] = [
    ...commonCommandDefs,
    ...nodeCommandCommonDefs,
    ...nodeCommandSingleDefs,
    ...nodeCommandMultipleDefs
  ]
  let nodeOpts
  try {
    nodeOpts = commandLineArgs(defs, { argv, camelCase: true })
    if (opts.help) return nodeUsage()
    if (nodeOpts.quiet) logger.level = LogLevel.Success
    validatenodeOpts(nodeOpts)
  } catch (e) {
    process.exitCode = 1
    if (e.name === 'UNKNOWN_VALUE') {
      logger.error(`Invalid argument provided. ${e.message}`)
    } else {
      logger.error(e.message)
    }
    return nodeUsage()
  }
  try {
    const overwrite = nodeOpts.overwrite && !nodeOpts['noOverwrite']
    if (nodeOpts.sourceMap) {
      // single mode
      await node.uploadOne({
        apiKey: nodeOpts.apiKey,
        sourceMap: nodeOpts.sourceMap,
        bundle: nodeOpts.bundle,
        projectRoot: nodeOpts.projectRoot,
        overwrite,
        appVersion: nodeOpts.appVersion,
        endpoint: nodeOpts.endpoint,
        detectAppVersion: nodeOpts.detectAppVersion,
        codeBundleId: nodeOpts.codeBundleId,
        logger
      })
    } else {
      // multiple mode
      await node.uploadMultiple({
        apiKey: nodeOpts.apiKey,
        directory: nodeOpts.directory,
        projectRoot: nodeOpts.projectRoot,
        overwrite,
        appVersion: nodeOpts.appVersion,
        endpoint: nodeOpts.endpoint,
        detectAppVersion: nodeOpts.detectAppVersion,
        codeBundleId: nodeOpts.codeBundleId,
        logger
      })
    }
  } catch (e) {
    process.exitCode = 1
  }
}

function nodeUsage (): void {
  console.log(
    commandLineUsage([
      { content: 'bugsnag-source-maps upload-node [...opts]' },
      {
        header: 'Options',
        optionList: [ ...commonCommandDefs, ...nodeCommandCommonDefs ]
      },
      {
        header: 'Single upload',
        content: 'Options for uploading a source map for a single bundle'
      },
      {
        optionList: [ ...nodeCommandSingleDefs ]
      },
      {
        header: 'Multiple upload',
        content: 'Options for recursing directory and upload multiple source maps'
      },
      {
        optionList: [ ...nodeCommandMultipleDefs ]
      }
    ])
  )
}

const nodeCommandCommonDefs = [
  {
    name: 'app-version',
    type: String
  },
  {
    name: 'detect-app-version',
    type: Boolean,
    description: 'detect the app version from the package.json file'
  }
]

const nodeCommandSingleDefs = [
  {
    name: 'source-map',
    type: String,
    description: 'the path to the source map {bold required}',
    typeLabel: '{underline filepath}'
  },
  {
    name: 'bundle',
    type: String,
    description: 'the path to the bundle {bold required}',
    typeLabel: '{underline filepath}'
  }
]
const nodeCommandMultipleDefs = [
  {
    name: 'directory',
    type: String,
    description: 'the directory to start searching for source maps in, relative to the project root {bold required}',
    typeLabel: '{underline path}'
  }
]

function validatenodeOpts (opts: Record<string, unknown>): void {
  if (!opts['apiKey']) {
    throw new Error('--api-key is required')
  }

  if (opts['appVersion'] && opts['detectAppVersion']) {
    throw new Error('--app-version and --detect-app-version cannot both be given')
  }

  if (opts['overwrite'] && opts['noOverwrite']) {
    throw new Error('--overwrite and --no-overwrite cannot both be given')
  }

  if (opts.codeBundleId) {
    if (opts.appVersion) throw new Error('--app-version and --code-bundle-id cannot both be given')
    if (opts.detectAppVersion) throw new Error('--detect-app-version and --code-bundle-id cannot both be given')
  }

  const anySingleSet = opts['sourceMap'] || opts['bundle']
  const anyMultipleSet = opts['directory']
  if (anySingleSet && anyMultipleSet) {
    throw new Error('Incompatible options are set. Use either single mode options (--source-map, --bundle) or multiple mode options (--directory).')
  }
  if (!anySingleSet && !anyMultipleSet) throw new Error('Not enough options supplied')

  if (anySingleSet) {
    // single mode
    if (!opts['sourceMap']) throw new Error('--source-map is required')
    if (!opts['bundle']) throw new Error('--bundle is required')
  }
}
