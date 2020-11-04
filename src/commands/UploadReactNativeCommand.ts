import commandLineArgs, { OptionDefinition } from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import logger from '../Logger'
import { LogLevel } from 'consola'
import { commonCommandDefs } from './CommandDefinitions'
import ReactNativeUploader, { ReactNativeUploadOptions } from '../uploaders/ReactNativeUploader'
import { Platform, PlatformOptions } from '../react-native/Platform'
import { Version, VersionType } from '../react-native/Version'
import { SourceMapRetrieval, SourceMapRetrievalType } from '../react-native/SourceMapRetrieval'

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
    const rawOpts = commandLineArgs(defs, { argv, camelCase: true })

    if (rawOpts.quiet) {
      logger.level = LogLevel.Success
    }

    reactNativeOpts = validateReactNativeOpts(rawOpts)
  } catch (e) {
    process.exitCode = 1

    if (e.name === 'UNKNOWN_VALUE' || e.name === 'UNKNOWN_OPTION') {
      logger.error(`Invalid argument provided. ${e.message}`)
    } else {
      logger.error(e.message)
    }

    return reactNativeUsage()
  }

  try {
    const uploader = new ReactNativeUploader(logger)
    await uploader.uploadOne(reactNativeOpts)
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
    name: 'code-bundle-id',
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
  },
]

const reactNativeProvideOpts = [
  {
    name: 'source-map',
    type: String,
    description: 'the path to the source map {bold required}',
    typeLabel: '{underline file}',
  },
  {
    name: 'bundle',
    type: String,
    description: 'the path to the bundle {bold required}',
    typeLabel: '{underline file}',
  },
]

const reactNativeFetchOpts = [
  {
    name: 'fetch',
    type: Boolean,
    description: 'enable fetch mode {bold required}',
  },
  {
    name: 'bundler-url',
    type: String,
    description: 'the URL of the React Native bundle server',
    typeLabel: '{underline url}',
  },
  {
    name: 'bundler-entry-point',
    type: String,
    description: 'the entry point of your React Native app',
    typeLabel: '{underline file}',
  },
]

function validateReactNativeOpts (opts: Record<string, unknown>): ReactNativeUploadOptions {
  if (!opts.apiKey || typeof opts.apiKey !== 'string') {
    throw new Error('--api-key is a required parameter')
  }

  const platform = marshallPlatform(opts)
  const version = marshallVersion(platform, opts)
  const platformOptions = marshallPlatformOptions(platform, version, opts)
  const retrieval = marshallRetrieval(opts)

  let endpoint = 'https://upload.bugsnag.com/react-native-source-map'
  if (opts.endpoint && typeof opts.endpoint === 'string') {
    endpoint = opts.endpoint
  }

  let projectRoot = process.cwd()
  if (opts.projectRoot && typeof opts.projectRoot === 'string') {
    projectRoot = opts.projectRoot
  }

  return {
    apiKey: opts.apiKey,
    dev: !!opts.dev,
    overwrite: !!opts.overwrite,
    endpoint,
    projectRoot,
    platformOptions,
    version,
    retrieval,
  }
}

function marshallPlatform(opts: Record<string, unknown>): Platform {
  if (!opts.platform) {
    throw new Error('--platform is a required parameter')
  }

  if (opts.platform === 'ios') {
    return Platform.Ios
  }

  if (opts.platform === 'android') {
    return Platform.Android
  }

  throw new Error('--platform must be either "android" or "ios"')
}

function marshallVersion(platform: Platform, opts: Record<string, unknown>): Version {
  if (opts.appVersion) {
    if (opts.codeBundleId) {
      throw new Error('--app-version and --code-bundle-id cannot both be given')
    }

    if (typeof opts.appVersion !== 'string') {
      throw new Error('--app-version must be a string')
    }

    return {
      type: VersionType.AppVersion,
      appVersion: opts.appVersion,
    }
  }

  if (opts.codeBundleId) {
    if (opts.appBundleVersion) {
      throw new Error('--app-bundle-version and --code-bundle-id cannot both be given')
    }

    if (opts.appVersionCode) {
      throw new Error('--app-version-code and --code-bundle-id cannot both be given')
    }

    if (typeof opts.codeBundleId !== 'string') {
      throw new Error('--code-bundle-id must be a string')
    }

    return {
      type: VersionType.CodeBundleId,
      codeBundleId: opts.codeBundleId,
    }
  }

  throw new Error('Either --app-version or --code-bundle-id must be given')
}

function marshallPlatformOptions(platform: Platform, version: Version, opts: Record<string, unknown>): PlatformOptions {
  switch (platform) {
    case Platform.Ios: {
      if (opts.appVersionCode) {
        throw new Error('--app-version-code cannot be given with --platform "ios"')
      }

      let appBundleVersion

      if (opts.appBundleVersion && typeof opts.appBundleVersion === 'string') {
        appBundleVersion = opts.appBundleVersion
      }

      return { type: platform, appBundleVersion }
    }

    case Platform.Android: {
      if (opts.appBundleVersion) {
        throw new Error('--app-bundle-version cannot be given with --platform "android"')
      }

      let appVersionCode

      if (opts.appVersionCode && typeof opts.appVersionCode === 'string') {
        appVersionCode = opts.appVersionCode
      }

      return { type: platform, appVersionCode }
    }
  }
}

function marshallRetrieval(opts: Record<string, unknown>): SourceMapRetrieval {
  if (opts.fetch) {
    let url = 'http://localhost:8081'

    if (opts.bundlerUrl && typeof opts.bundlerUrl === 'string') {
      url = opts.bundlerUrl
    }

    let entryPoint = 'index.js'

    if (opts.bundlerEntryPoint && typeof opts.bundlerEntryPoint === 'string') {
      entryPoint = opts.bundlerEntryPoint
    }

    return {
      type: SourceMapRetrievalType.Fetch,
      url,
      entryPoint,
    }
  }

  if (!opts.sourceMap || typeof opts.sourceMap !== 'string') {
    throw new Error('--source-map is a required parameter')
  }

  if (!opts.bundle || typeof opts.bundle !== 'string') {
    throw new Error('--bundle is a required parameter')
  }

  return {
    type: SourceMapRetrievalType.Provided,
    sourceMap: opts.sourceMap,
    bundle: opts.bundle,
  }
}
