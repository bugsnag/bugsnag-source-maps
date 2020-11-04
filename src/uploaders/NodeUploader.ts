import { promises as fs } from 'fs'
import path from 'path'
import http from 'http'
import readPkgUp from 'read-pkg-up'
import glob from 'glob'

import { Logger, noopLogger } from '../Logger'
import request, { PayloadType } from '../Request'
import AddSources from '../transformers/AddSources'
import StripProjectRoot from '../transformers/StripProjectRoot'
import formatErrorLog from './lib/FormatErrorLog'
import stringifyFileAccessError from './lib/StringifyFileAccessError'

interface UploadSingleOpts {
  apiKey: string
  sourceMap: string
  bundle: string
  appVersion?: string
  overwrite?: boolean
  projectRoot?: string
  endpoint?: string
  requestOpts?: http.RequestOptions
  logger?: Logger
}

export async function uploadOne ({
  apiKey,
  bundle,
  sourceMap,
  appVersion,
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadSingleOpts): Promise<void> {
  logger.info(`Uploading node source map for "${bundle}"`)

  const [ sourceMapContent, fullSourceMapPath ] = await readSourceMap(sourceMap, projectRoot, logger)
  const [ bundleContent, fullBundlePath ] = await readBundleContent(bundle, projectRoot, sourceMap, logger)

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
      appVersion,
      minifiedUrl: bundle,
      minifiedFile: { filepath: fullBundlePath, data: bundleContent },
      sourceMap: { filepath: fullSourceMapPath, data: JSON.stringify(transformedSourceMap) },
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
  directory,
  appVersion,
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadMultipleOpts): Promise<void> {
  logger.info(`Uploading node source maps for "${directory}"`)
  logger.debug(`Searching for source maps "${directory}"`)
  const absoluteSearchPath = path.join(projectRoot, directory)
  const sourceMaps: string[] = await new Promise((resolve, reject) => {
    glob('**/*.map', { ignore: '**/*.css.map', cwd: absoluteSearchPath }, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })

  logger.debug(`Found ${sourceMaps.length} source map:`)
  logger.debug(`  ${sourceMaps.join(', ')}`)

  if (!appVersion) {
    appVersion = await detectAppVersion(projectRoot, logger)
  }

  let n = 0
  if (sourceMaps.length === 0) {
    logger.warn('No source maps found.')
    return
  }

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
      // ignore error – it's already logged out
    }

    const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

    logger.debug(`Initiating upload "${endpoint}"`)
    const start = new Date().getTime()
    try {
      await request(endpoint, {
        type: PayloadType.Browser,
        apiKey,
        appVersion,
        minifiedUrl: path.relative(projectRoot, path.resolve(absoluteSearchPath, bundlePath)),
        minifiedFile: (bundleContent && fullBundlePath) ? { filepath: fullBundlePath, data: bundleContent } : undefined,
        sourceMap: { filepath: fullSourceMapPath, data: JSON.stringify(transformedSourceMap) },
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

async function detectAppVersion (projectRoot: string, logger: Logger): Promise<string | undefined> {
  const pkg = await readPkgUp({ cwd: projectRoot })
  const version = pkg?.packageJson.version
  if (version) logger.debug(`Detected appVersion "${version}"`)
  return version ? version : undefined
}

async function applyTransformations(fullSourceMapPath: string, sourceMapJson: unknown, projectRoot: string, logger: Logger): Promise<unknown> {
  logger.info('Applying transformations to source map')
  try {
    return await Promise.resolve(sourceMapJson)
      .then(json => AddSources(fullSourceMapPath, json, projectRoot, logger))
      .then(json => StripProjectRoot(fullSourceMapPath, json, projectRoot, logger))
  } catch (e) {
    logger.error('Error applying transforms to source map', e)
    throw e
  }
}

async function readSourceMap (sourceMapPath: string, basePath: string, logger: Logger): Promise<[string, string]> {
  logger.debug(`Reading source map "${sourceMapPath}"`)
  const fullSourceMapPath = path.resolve(basePath, sourceMapPath)
  try {
    return [ await fs.readFile(fullSourceMapPath, 'utf-8'), fullSourceMapPath ]
  } catch (e) {
    logger.error(`The source map "${sourceMapPath}" could not be found. ${stringifyFileAccessError(e)}\n\n  "${fullSourceMapPath}"`)
    throw e
  }
}

function parseSourceMap (sourceMapContent: string, sourceMapPath: string, logger: Logger) {
  try {
    return JSON.parse(sourceMapContent)
  } catch (e) {
    logger.error(`The source map was not valid JSON.\n\n  "${sourceMapPath}"`)
    throw e
  }
}

async function readBundleContent (bundlePath: string, basePath: string, sourceMapName: string, logger: Logger): Promise<[string, string]> {
  const fullBundlePath = path.resolve(basePath, bundlePath)
  logger.debug(`Reading bundle file "${bundlePath}"`)
  try {
    return [ await fs.readFile(fullBundlePath, 'utf-8'), fullBundlePath ]
  } catch (e) {
    logger.error(`The bundle "${bundlePath}" could not be found. ${stringifyFileAccessError(e)}\n\n  "${fullBundlePath}"`)
    throw e
  }
}