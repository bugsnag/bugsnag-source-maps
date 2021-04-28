import http from 'http'
import path from 'path'
import qs from 'querystring'

import { Logger, noopLogger } from '../Logger'
import File from '../File'
import request, { fetch, PayloadType } from '../Request'
import formatErrorLog from './lib/FormatErrorLog'
import applyTransformations from './lib/ApplyTransformations'
import readBundleContent from './lib/ReadBundleContent'
import readSourceMap from './lib/ReadSourceMap'
import parseSourceMap from './lib/ParseSourceMap'
import { NetworkError, NetworkErrorCode } from '../NetworkError'
import {
  validateRequiredStrings,
  validateOptionalStrings,
  validateBooleans,
  validateObjects,
  validateNoUnknownArgs
} from './lib/InputValidators'

import { DEFAULT_UPLOAD_ORIGIN, buildEndpointUrl } from './lib/EndpointUrl'
const UPLOAD_PATH = '/react-native-source-map'

interface CommonUploadOpts {
  apiKey: string
  platform: 'ios' | 'android'
  dev: boolean
  appVersion?: string
  codeBundleId?: string
  appVersionCode?: string
  appBundleVersion?: string
  overwrite?: boolean
  projectRoot?: string
  endpoint?: string
  requestOpts?: http.RequestOptions
  logger?: Logger
}

interface UploadSingleOpts extends CommonUploadOpts {
  sourceMap: string
  bundle: string
}

function validateOneOpts (opts: Record<string, unknown>, unknownArgs: Record<string, unknown>) {
  validateRequiredStrings(opts, [ 'apiKey', 'sourceMap', 'projectRoot', 'endpoint', 'platform' ])
  validateOptionalStrings(opts, [ 'bundle', 'appVersion', 'codeBundleId', 'appVersionCode', 'appBundleVersion' ])
  validateBooleans(opts, [ 'overwrite', 'dev' ])
  validateObjects(opts, [ 'requestOpts', 'logger' ])
  validateNoUnknownArgs(unknownArgs)
}

export async function uploadOne ({
  apiKey,
  sourceMap,
  bundle,
  platform,
  dev = false,
  appVersion,
  codeBundleId,
  appVersionCode,
  appBundleVersion,
  overwrite = true,
  projectRoot = process.cwd(),
  endpoint = DEFAULT_UPLOAD_ORIGIN,
  requestOpts = {},
  logger = noopLogger,
  ...unknownArgs
}: UploadSingleOpts): Promise<void> {
  validateOneOpts({
    apiKey,
    sourceMap,
    bundle,
    platform,
    dev,
    appVersion,
    codeBundleId,
    appVersionCode,
    appBundleVersion,
    overwrite,
    projectRoot,
    endpoint,
    requestOpts,
    logger
  }, unknownArgs as Record<string, unknown>)

  logger.info(`Preparing upload of React Native source map (${dev ? 'dev' : 'release'} / ${platform})`)

  let url
  try {
    url = buildEndpointUrl(endpoint, UPLOAD_PATH)
  } catch (e) {
    logger.error(e)
    throw e
  }

  const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, projectRoot, logger)
  const [ bundleContent, fullBundlePath ] = await readBundleContent(bundle, projectRoot, sourceMap, logger)

  const sourceMapJson = parseSourceMap(sourceMapContent, sourceMap, logger)
  const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

  const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform)

  logger.debug(`Initiating upload to "${url}"`)
  const start = new Date().getTime()
  try {
    await request(url, {
      type: PayloadType.ReactNative,
      apiKey,
      sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
      bundle: new File(fullBundlePath, bundleContent),
      platform,
      dev,
      ...marshalledVersions,
      overwrite
    }, requestOpts)
    logger.success(`Success, uploaded ${sourceMap} and ${bundle} to ${url} in ${(new Date()).getTime() - start}ms`)
  } catch (e) {
    if (e.cause) {
      logger.error(formatErrorLog(e, true), e, e.cause)
    } else {
      logger.error(formatErrorLog(e, true), e)
    }
    throw e
  }
}

interface FetchUploadOpts extends CommonUploadOpts {
  bundlerUrl?: string
  bundlerEntryPoint?: string
}

function validateFetchOpts (opts: Record<string, unknown>, unknownArgs: Record<string, unknown>) {
  validateRequiredStrings(opts, [ 'apiKey', 'projectRoot', 'endpoint', 'platform', 'bundlerUrl', 'bundlerEntryPoint' ])
  validateOptionalStrings(opts, [ 'bundle', 'appVersion', 'codeBundleId', 'appVersionCode', 'appBundleVersion' ])
  validateBooleans(opts, [ 'overwrite', 'dev' ])
  validateObjects(opts, [ 'requestOpts', 'logger' ])
  validateNoUnknownArgs(unknownArgs)
}

export async function fetchAndUploadOne ({
  apiKey,
  platform,
  dev = false,
  appVersion,
  codeBundleId,
  appVersionCode,
  appBundleVersion,
  overwrite = true,
  projectRoot = process.cwd(),
  endpoint = DEFAULT_UPLOAD_ORIGIN,
  requestOpts = {},
  bundlerUrl = 'http://localhost:8081',
  bundlerEntryPoint = 'index.js',
  logger = noopLogger,
  ...unknownArgs
}: FetchUploadOpts): Promise<void> {
  validateFetchOpts({
    apiKey,
    platform,
    dev,
    appVersion,
    codeBundleId,
    appVersionCode,
    appBundleVersion,
    overwrite,
    projectRoot,
    endpoint,
    requestOpts,
    bundlerUrl,
    bundlerEntryPoint,
    logger
  }, unknownArgs as Record<string, unknown>)

  logger.info(`Fetching React Native source map (${dev ? 'dev' : 'release'} / ${platform})`)

  let url
  try {
    url = buildEndpointUrl(endpoint, UPLOAD_PATH)
  } catch (e) {
    logger.error(e)
    throw e
  }

  const queryString = qs.stringify({ platform, dev })
  const entryPoint = bundlerEntryPoint.replace(/\.(js|bundle)$/, '')

  const sourceMapUrl = `${bundlerUrl}/${entryPoint}.js.map?${queryString}`
  const bundleUrl = `${bundlerUrl}/${entryPoint}.bundle?${queryString}`

  let sourceMap: string
  let bundle: string

  try {
    logger.debug(`Fetching source map from ${sourceMapUrl}`)
    sourceMap = await fetch(sourceMapUrl)
  } catch (e) {
    logger.error(
      formatFetchError(e, bundlerUrl, bundlerEntryPoint), e
    )
    throw e
  }

  try {
    logger.debug(`Fetching bundle from ${bundleUrl}`)
    bundle = await fetch(bundleUrl)
  } catch (e) {
    logger.error(
      formatFetchError(e, bundlerUrl, bundlerEntryPoint), e
    )
    throw e
  }

  const sourceMapPath = path.resolve(projectRoot, bundlerEntryPoint)

  const sourceMapJson = parseSourceMap(sourceMap, sourceMapPath, logger)
  const transformedSourceMap = await applyTransformations(sourceMapPath, sourceMapJson, projectRoot, logger)

  const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform)

  logger.debug(`Initiating upload to "${url}"`)
  const start = new Date().getTime()
  try {
    await request(url, {
      type: PayloadType.ReactNative,
      apiKey,
      sourceMap: new File(sourceMapUrl, JSON.stringify(transformedSourceMap)),
      bundle: new File(bundleUrl, bundle),
      platform,
      dev,
      ...marshalledVersions,
      overwrite
    }, requestOpts)
    logger.success(`Success, uploaded ${entryPoint}.js.map to ${url} in ${(new Date()).getTime() - start}ms`)
  } catch (e) {
    if (e.cause) {
      logger.error(formatErrorLog(e, true), e, e.cause)
    } else {
      logger.error(formatErrorLog(e, true), e)
    }
    throw e
  }
}

interface VersionOpts {
  appVersion?: string
  codeBundleId?: string
  appBundleVersion?: string
  appVersionCode?: string
}

function marshallVersionOptions ({ appVersion, codeBundleId, appVersionCode, appBundleVersion }: VersionOpts, platform: string): VersionOpts {
  if (codeBundleId) return { codeBundleId }
  switch (platform) {
    case 'android':
      return { appVersion, appVersionCode }
    case 'ios':
      return { appVersion, appBundleVersion }
    default:
      return { appVersion }
  }
}

function formatFetchError(err: Error, url: string, entryPoint: string): string {
  if (!(err instanceof NetworkError)) {
    return `An unexpected error occurred during the request to ${url}.\n\n`
  }

  switch (err.code) {
    case NetworkErrorCode.CONNECTION_REFUSED:
      return `Unable to connect to ${url}. Is the server running?\n\n`

    case NetworkErrorCode.SERVER_ERROR:
      return `Received an error from the server at ${url}. Does the entry point file '${entryPoint}' exist?\n\n`

    case NetworkErrorCode.TIMEOUT:
      return `The request to ${url} timed out.\n\n`

    default:
      return `An unexpected error occurred during the request to ${url}.\n\n`
  }
}
