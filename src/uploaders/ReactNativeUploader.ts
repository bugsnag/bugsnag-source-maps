import http from 'http'
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
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadSingleOpts): Promise<void> {
  logger.info(`Uploading React Native source map (${dev ? 'dev' : 'release'} / ${platform})`)

  const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, projectRoot, logger)
  const [ bundleContent, fullBundlePath ] = await readBundleContent(bundle, projectRoot, sourceMap, logger)

  const sourceMapJson = parseSourceMap(sourceMapContent, sourceMap, logger)
  const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

  const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform)

  logger.debug(`Initiating upload "${endpoint}"`)
  const start = new Date().getTime()
  try {
    await request(endpoint, {
      type: PayloadType.ReactNative,
      apiKey,
      sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
      bundle: new File(fullBundlePath, bundleContent),
      platform,
      dev,
      ...marshalledVersions,
      overwrite
    }, requestOpts)
    logger.success(`Success, uploaded ${sourceMap} to ${endpoint} in ${(new Date()).getTime() - start}ms`)
  } catch (e) {
    if (e.cause) {
      logger.error(formatErrorLog(e), e, e.cause)
    } else {
      logger.error(formatErrorLog(e), e)
    }
    throw e
  }
}

interface FetchUploadOpts extends CommonUploadOpts {
  bundlerUrl?: string
  bundlerEntryPoint?: string
}

export async function fetchAndUploadOne ({
  apiKey,
  platform,
  dev = false,
  appVersion,
  codeBundleId,
  appVersionCode,
  appBundleVersion,
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  bundlerUrl = 'http://localhost:8081',
  bundlerEntryPoint = 'index.js',
  logger = noopLogger
}: FetchUploadOpts): Promise<void> {
  logger.info(`Fetching and uploading React Native source map (${dev ? 'dev' : 'release'} / ${platform})`)

  const queryString = qs.stringify({ platform, dev })
  const entryPoint = bundlerEntryPoint.replace(/\.js$/, '')

  const sourceMapUrl = `${bundlerUrl}/${entryPoint}.js.map?${queryString}`
  const bundleUrl = `${bundlerUrl}/${entryPoint}.bundle?${queryString}`

  let sourceMap: string
  let bundle

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

  const sourceMapJson = parseSourceMap(sourceMap, sourceMapUrl, logger)
  const transformedSourceMap = await applyTransformations(sourceMapUrl, sourceMapJson, projectRoot, logger)

  const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform)

  logger.debug(`Initiating upload "${endpoint}"`)
  const start = new Date().getTime()
  try {
    await request(endpoint, {
      type: PayloadType.ReactNative,
      apiKey,
      sourceMap: new File(sourceMapUrl, JSON.stringify(transformedSourceMap)),
      bundle: new File(bundleUrl, bundle),
      platform,
      dev,
      ...marshalledVersions,
      overwrite
    }, requestOpts)
    logger.success(`Success, uploaded ${sourceMap} to ${endpoint} in ${(new Date()).getTime() - start}ms`)
  } catch (e) {
    if (e.cause) {
      logger.error(formatErrorLog(e), e, e.cause)
    } else {
      logger.error(formatErrorLog(e), e)
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
    return `An unexpected error occurred.\n\n`
  }

  switch (err.code) {
    case NetworkErrorCode.CONNECTION_REFUSED:
      return `Unable to connect to ${url}. Is the server running?\n\n`

    case NetworkErrorCode.SERVER_ERROR:
      return `Recieved an error from the server. Does the entry point file '${entryPoint}' exist?\n\n`

    case NetworkErrorCode.TIMEOUT:
      return `The request timed out.\n\n`

    default:
      return `An unexpected error occurred.\n\n`
  }
}