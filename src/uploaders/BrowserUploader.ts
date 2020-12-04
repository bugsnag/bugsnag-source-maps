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
import detectAppVersion from './lib/DetectAppVersion'

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
  requestOpts?: http.RequestOptions
  logger?: Logger
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
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadSingleOpts): Promise<void> {
  logger.info(`Preparing upload of browser source map for "${bundleUrl}"`)

  const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, projectRoot, logger)

  let bundleContent
  let fullBundlePath
  if (bundle) {
    [ bundleContent, fullBundlePath ] = await readBundleContent(bundle, projectRoot, sourceMap, logger)
  }

  const sourceMapJson = parseSourceMap(sourceMapContent, sourceMap, logger)
  const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

  if (!appVersion) {
    appVersion = await detectAppVersion(projectRoot, logger)
  }

  logger.debug(`Initiating upload "${endpoint}"`)
  const start = new Date().getTime()
  try {
    await request(endpoint, {
      type: PayloadType.Browser,
      apiKey,
      appVersion: codeBundleId ? undefined : appVersion,
      codeBundleId,
      minifiedUrl: bundleUrl,
      minifiedFile: (bundleContent && fullBundlePath) ? new File(fullBundlePath, bundleContent) : undefined,
      sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
      overwrite: overwrite
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

interface UploadMultipleOpts {
  apiKey: string
  baseUrl: string
  directory: string
  appVersion?: string
  overwrite?: boolean
  projectRoot?: string
  endpoint?: string
  requestOpts?: http.RequestOptions
  logger?: Logger
}

export async function uploadMultiple ({
  apiKey,
  baseUrl,
  directory,
  appVersion,
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadMultipleOpts): Promise<void> {
  logger.info(`Preparing upload of browser source maps for "${baseUrl}"`)
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

  logger.debug(`Found ${sourceMaps.length} source map:`)
  logger.debug(`  ${sourceMaps.join(', ')}`)

  if (!appVersion) {
    appVersion = await detectAppVersion(projectRoot, logger)
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

    logger.debug(`Initiating upload "${endpoint}"`)
    const start = new Date().getTime()
    try {
      await request(endpoint, {
        type: PayloadType.Browser,
        apiKey,
        appVersion,
        minifiedUrl: `${baseUrl.replace(/\/$/, '')}/${bundlePath}`,
        minifiedFile: (bundleContent && fullBundlePath) ? new File(fullBundlePath, bundleContent) : undefined,
        sourceMap: new File(fullSourceMapPath, JSON.stringify(transformedSourceMap)),
        overwrite: overwrite
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
}
