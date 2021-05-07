import path from 'path'
import http from 'http'
import glob from 'glob'

import { Logger, noopLogger } from '../Logger'
import File from '../File'
import request, { PayloadType } from '../Request'
import formatErrorLog from './lib/FormatErrorLog'
import applyTransformations from './lib/ApplyTransformations'
import readBundleContent from './lib/ReadBundleContent'
import readSourceMap from './lib/ReadSourceMap'
import parseSourceMap from './lib/ParseSourceMap'
import _detectAppVersion from './lib/DetectAppVersion'
import {
  validateRequiredStrings,
  validateOptionalStrings,
  validateBooleans,
  validateObjects,
  validateNoUnknownArgs
} from './lib/InputValidators'

import { DEFAULT_UPLOAD_ORIGIN, buildEndpointUrl } from './lib/EndpointUrl'
const UPLOAD_PATH = '/sourcemap'

interface UploadSingleOpts {
  apiKey: string
  sourceMap: string
  bundleUrl: string
  bundle?: string
  appVersion?: string
  codeBundleId?: string
  overwrite?: boolean
  projectRoot?: string
  endpoint?: string
  detectAppVersion?: boolean,
  requestOpts?: http.RequestOptions
  logger?: Logger
}

function validateOneOpts (opts: Record<string, unknown>, unknownArgs: Record<string, unknown>) {
  validateRequiredStrings(opts, [ 'apiKey', 'sourceMap', 'bundleUrl', 'projectRoot', 'endpoint' ])
  validateOptionalStrings(opts, [ 'bundle', 'appVersion', 'codeBundleId' ])
  validateBooleans(opts, [ 'overwrite', 'detectAppVersion' ])
  validateObjects(opts, [ 'requestOpts', 'logger' ])
  validateNoUnknownArgs(unknownArgs)
}

export async function uploadOne ({
  apiKey,
  bundleUrl,
  bundle,
  sourceMap,
  appVersion,
  codeBundleId,
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = DEFAULT_UPLOAD_ORIGIN,
  detectAppVersion = false,
  requestOpts = {},
  logger = noopLogger,
  ...unknownArgs
}: UploadSingleOpts): Promise<void> {
  validateOneOpts({
    apiKey,
    bundleUrl,
    bundle,
    sourceMap,
    appVersion,
    codeBundleId,
    overwrite,
    projectRoot,
    endpoint,
    detectAppVersion,
    requestOpts,
    logger
  }, unknownArgs as Record<string, unknown>)

  logger.info(`Preparing upload of browser source map for "${bundleUrl}"`)

  let url
  try {
    url = buildEndpointUrl(endpoint, UPLOAD_PATH)
  } catch (e) {
    logger.error(e)
    throw e
  }

  const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, projectRoot, logger)

  let bundleContent
  let fullBundlePath
  if (bundle) {
    [ bundleContent, fullBundlePath ] = await readBundleContent(bundle, projectRoot, sourceMap, logger)
  }

  const sourceMapJson = parseSourceMap(sourceMapContent, sourceMap, logger)
  const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

  if (detectAppVersion) {
    try {
      appVersion = await _detectAppVersion(projectRoot, logger)
    } catch (e) {
      logger.error(e.message)
      throw e
    }
  }

  logger.debug(`Initiating upload to "${url}"`)
  const start = new Date().getTime()
  try {
    await request(url, {
      type: PayloadType.Browser,
      apiKey,
      appVersion: codeBundleId ? undefined : appVersion,
      codeBundleId,
      minifiedUrl: bundleUrl,
      minifiedFile: (bundleContent && fullBundlePath) ? new File(fullBundlePath, bundleContent) : undefined,
      sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
      overwrite: overwrite
    }, requestOpts)

    const uploadedFiles = (bundleContent && fullBundlePath) ? `${sourceMap} and ${bundle}` : sourceMap

    logger.success(`Success, uploaded ${uploadedFiles} to ${url} in ${(new Date()).getTime() - start}ms`)
  } catch (e) {
    if (e.cause) {
      logger.error(formatErrorLog(e), e, e.cause)
    } else {
      logger.error(formatErrorLog(e), e)
    }
    throw e
  }
}

interface UploadMultipleOpts {
  apiKey: string
  baseUrl: string
  directory: string
  appVersion?: string
  codeBundleId?: string,
  overwrite?: boolean
  projectRoot?: string
  endpoint?: string
  detectAppVersion?: boolean,
  requestOpts?: http.RequestOptions
  logger?: Logger
}


function validateMultipleOpts (opts: Record<string, unknown>, unknownArgs: Record<string, unknown>) {
  validateRequiredStrings(opts, [ 'apiKey', 'baseUrl', 'directory', 'projectRoot', 'endpoint' ])
  validateOptionalStrings(opts, [ 'appVersion', 'codeBundleId' ])
  validateBooleans(opts, [ 'overwrite', 'detectAppVersion' ])
  validateObjects(opts, [ 'requestOpts', 'logger' ])
  validateNoUnknownArgs(unknownArgs)
}

export async function uploadMultiple ({
  apiKey,
  baseUrl,
  directory,
  appVersion,
  codeBundleId,
  overwrite = false,
  detectAppVersion = false,
  projectRoot = process.cwd(),
  endpoint = DEFAULT_UPLOAD_ORIGIN,
  requestOpts = {},
  logger = noopLogger,
  ...unknownArgs
}: UploadMultipleOpts): Promise<void> {
  validateMultipleOpts({
    apiKey,
    baseUrl,
    directory,
    appVersion,
    codeBundleId,
    overwrite,
    projectRoot,
    endpoint,
    detectAppVersion,
    requestOpts,
    logger
  }, unknownArgs as Record<string, unknown>)

  logger.info(`Preparing upload of browser source maps for "${baseUrl}"`)

  let url
  try {
    url = buildEndpointUrl(endpoint, UPLOAD_PATH)
  } catch (e) {
    logger.error(e)
    throw e
  }

  logger.debug(`Searching for source maps "${directory}"`)
  const absoluteSearchPath = path.resolve(projectRoot, directory)
  const sourceMaps: string[] = await new Promise((resolve, reject) => {
    glob('**/*.map', { ignore: '**/*.css.map', cwd: absoluteSearchPath }, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })

  if (sourceMaps.length === 0) {
    logger.warn('No source maps found.')
    return
  }

  logger.debug(`Found ${sourceMaps.length} source map(s):`)
  logger.debug(`  ${sourceMaps.join(', ')}`)

  if (detectAppVersion) {
    try {
      appVersion = await _detectAppVersion(projectRoot, logger)
    } catch (e) {
      logger.error(e.message)
      throw e
    }
  }

  let n = 0
  for (const sourceMap of sourceMaps) {
    n++
    logger.info(`${n} of ${sourceMaps.length}`)

    const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, absoluteSearchPath, logger)
    const sourceMapJson = parseSourceMap(sourceMapContent, fullSourceMapPath, logger)

    const bundlePath = sourceMap.replace(/\.map$/, '')
    let bundleContent, fullBundlePath
    try {
      [ bundleContent, fullBundlePath ] = await readBundleContent(bundlePath, absoluteSearchPath, sourceMap, logger)
    } catch (e) {
      // bundle file is optional – ignore and carry on with the error logged out
    }

    const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

    logger.debug(`Initiating upload to "${url}"`)
    const start = new Date().getTime()
    try {
      await request(url, {
        type: PayloadType.Browser,
        apiKey,
        appVersion,
        codeBundleId,
        minifiedUrl: `${baseUrl.replace(/\/$/, '')}/${bundlePath}`,
        minifiedFile: (bundleContent && fullBundlePath) ? new File(fullBundlePath, bundleContent) : undefined,
        sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
        overwrite: overwrite
      }, requestOpts)

      const uploadedFiles = (bundleContent && fullBundlePath) ? `${sourceMap} and ${bundlePath}` : sourceMap

      logger.success(`Success, uploaded ${uploadedFiles} to ${url} in ${(new Date()).getTime() - start}ms`)
    } catch (e) {
      if (e.cause) {
        logger.error(formatErrorLog(e), e, e.cause)
      } else {
        logger.error(formatErrorLog(e), e)
      }
      throw e
    }
  }
}
