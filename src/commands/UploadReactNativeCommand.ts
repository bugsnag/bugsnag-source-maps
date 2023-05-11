import commandLineArgs, { OptionDefinition } from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import logger from '../Logger'
import { LogLevels } from 'consola'
import { commonCommandDefs } from './CommandDefinitions'
import { uploadOne, fetchAndUploadOne } from '../uploaders/ReactNativeUploader'

export default async function uploadReactNative (argv: string[], opts: Record<string, unknown>): Promise<void> {
  if (opts.help) {
    return reactNativeUsage()
  }

  const defs: OptionDefinition[] = [
    ...commonCommandDefs,
    ...reactNativeCommonDefs,
    ...reactNativeProvideOpts,
    ...reactNativeFetchOpts,
  ]

  let reactNativeOpts

  try {
    reactNativeOpts = commandLineArgs(defs, { argv, camelCase: true })

    if (reactNativeOpts.quiet) {
      logger.level = LogLevels.success
    }

    validateReactNativeOpts(reactNativeOpts)
  } catch (e: any) {
    process.exitCode = 1

    if (e.name === 'UNKNOWN_VALUE' || e.name === 'UNKNOWN_OPTION') {
      logger.error(`Invalid argument provided. ${e.message}`)
    } else {
      logger.error(e.message)
    }

    return reactNativeUsage()
  }

  try {
    const overwrite = reactNativeOpts.overwrite && !reactNativeOpts['noOverwrite']
    if (reactNativeOpts.fetch) {
      await fetchAndUploadOne({
        apiKey: reactNativeOpts.apiKey,
        projectRoot: reactNativeOpts.projectRoot,
        overwrite,
        appVersion: reactNativeOpts.appVersion,
        codeBundleId: reactNativeOpts.codeBundleId,
        appBundleVersion: reactNativeOpts.appBundleVersion,
        appVersionCode: reactNativeOpts.appVersionCode,
        platform: reactNativeOpts.platform,
        dev: reactNativeOpts.dev,
        endpoint: reactNativeOpts.endpoint,
        bundlerUrl: reactNativeOpts.bundlerUrl,
        bundlerEntryPoint: reactNativeOpts.bundlerEntryPoint,
        idleTimeout: reactNativeOpts.idleTimeout,
        logger
      })
    } else {
      await uploadOne({
        apiKey: reactNativeOpts.apiKey,
        sourceMap: reactNativeOpts.sourceMap,
        bundle: reactNativeOpts.bundle,
        projectRoot: reactNativeOpts.projectRoot,
        overwrite,
        appVersion: reactNativeOpts.appVersion,
        codeBundleId: reactNativeOpts.codeBundleId,
        appBundleVersion: reactNativeOpts.appBundleVersion,
        appVersionCode: reactNativeOpts.appVersionCode,
        platform: reactNativeOpts.platform,
        dev: reactNativeOpts.dev,
        endpoint: reactNativeOpts.endpoint,
        idleTimeout: reactNativeOpts.idleTimeout,
        logger
      })
    }
  } catch (e) {
    process.exitCode = 1
  }
}

function reactNativeUsage(): void {
  console.log(
    commandLineUsage([
      { content: 'bugsnag-source-maps upload-react-native [...opts]' },
      {
        header: 'Options',
        optionList: [...commonCommandDefs, ...reactNativeCommonDefs]
      },
      {
        header: 'Provide souce map and bundle',
        content: 'Options for uploading a source map and bundle'
      },
      {
        optionList: [...reactNativeProvideOpts]
      },
      {
        header: 'Fetch source map and bundle',
        content: 'Options for fetching a source map and bundle from the React Native bundler'
      },
      {
        optionList: [...reactNativeFetchOpts]
      }
    ])
  )
}

const reactNativeCommonDefs = [
  {
    name: 'platform',
    type: String,
    description: 'the application platform, either "android" or "ios" {bold required}',
  },
  {
    name: 'app-version',
    type: String,
  },
  {
    name: 'app-version-code',
    type: String,
  },
  {
    name: 'app-bundle-version',
    type: String,
  },
  {
    name: 'dev',
    type: Boolean,
    description: 'indicates this is a debug build',
  }
]

const reactNativeProvideOpts = [
  {
    name: 'source-map',
    type: String,
    description: 'the path to the source map {bold required}',
    typeLabel: '{underline filepath}',
  },
  {
    name: 'bundle',
    type: String,
    description: 'the path to the bundle {bold required}',
    typeLabel: '{underline filepath}',
  },
]

const reactNativeFetchOpts = [
  {
    name: 'fetch',
    type: Boolean,
    description: 'enable fetch mode',
  },
  {
    name: 'bundler-url',
    type: String,
    description: 'the URL of the React Native bundle server (defaults to http://localhost:8081)',
    typeLabel: '{underline url}',
  },
  {
    name: 'bundler-entry-point',
    type: String,
    description: 'the entry point file of your React Native app (defaults to index.js)',
    typeLabel: '{underline filepath}',
  },
]

function validateReactNativeOpts (opts: Record<string, unknown>): void {
  if (!opts.apiKey || typeof opts.apiKey !== 'string') {
    throw new Error('--api-key is a required parameter')
  }

  if (opts['overwrite'] && opts['noOverwrite']) {
    throw new Error('--overwrite and --no-overwrite cannot both be given')
  }

  validatePlatform(opts)
  validateVersion(opts)
  validatePlatformOptions(opts)
  validateRetrieval(opts)
}

function validatePlatform(opts: Record<string, unknown>): void {
  if (!opts.platform) {
    throw new Error('--platform is a required parameter')
  }

  if (opts.platform !== 'ios' && opts.platform !== 'android') {
    throw new Error('--platform must be either "android" or "ios"')
  }
}

function validateVersion(opts: Record<string, unknown>): void {
  if (opts.codeBundleId) {
    if (opts.appVersion) {
      throw new Error('--app-version and --code-bundle-id cannot both be given')
    }

    if (opts.appBundleVersion) {
      throw new Error('--app-bundle-version and --code-bundle-id cannot both be given')
    }

    if (opts.appVersionCode) {
      throw new Error('--app-version-code and --code-bundle-id cannot both be given')
    }

    return
  }

  if (!opts.appVersion && !opts.appVersionCode && !opts.appBundleVersion) {
    throw new Error('--code-bundle-id or at least one of --app-version, --app-version-code or --app-bundle-version must be given')
  }
}

function validatePlatformOptions(opts: Record<string, unknown>): void {
  switch (opts.platform) {
    case 'ios': {
      if (opts.appVersionCode) throw new Error('--app-version-code cannot be given with --platform "ios"')
      break
    }
    case 'android': {
      if (opts.appBundleVersion) throw new Error('--app-bundle-version cannot be given with --platform "android"')
      break
    }
  }
}

function validateRetrieval(opts: Record<string, unknown>): void {
  if (!opts.fetch && !opts.sourceMap && !opts.bundle) {
    throw new Error('Not enough arguments provided. Either use --fetch mode, or provide both --source-map and --bundle.')
  }

  if (!opts.fetch) {
    if (!opts.sourceMap || typeof opts.sourceMap !== 'string') {
      throw new Error('--source-map is a required parameter')
    }

    if (!opts.bundle || typeof opts.bundle !== 'string') {
      throw new Error('--bundle is a required parameter')
    }
  } else {
    if (opts.bundle || opts.sourceMap) throw new Error('--bundle and --source-map cannot be given with --fetch')
  }
}
