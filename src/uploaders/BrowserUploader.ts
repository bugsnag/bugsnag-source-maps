import { promises as fs } from 'fs'
import path from 'path'
import http from 'http'
import readPkgUp from 'read-pkg-up'
import glob from 'glob'

import { Logger, noopLogger } from '../Logger'
import request, { PayloadType } from '../Request'
import AddSources from '../transformers/AddSources'
import StripProjectRoot from '../transformers/StripProjectRoot'
import formatErrorLog from './FormatErrorLog'

interface UploadSingleOpts {
  apiKey: string
  sourceMap: string
  bundleUrl: string
  bundle?: string
  appVersion?: string
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
  overwrite = false,
  projectRoot = process.cwd(),
  endpoint = 'https://upload.bugsnag.com/',
  requestOpts = {},
  logger = noopLogger
}: UploadSingleOpts): Promise<void> {
  logger.info(`Uploading browser source map for "${bundleUrl}"`)

  logger.debug(`Reading source map "${sourceMap}"`)
  const fullSourceMapPath = path.resolve(projectRoot, sourceMap)
  let sourceMapContent
  try {
    sourceMapContent = await fs.readFile(fullSourceMapPath, 'utf-8')
  } catch (e) {
    logger.error(`There was an error attempting to find a source map at the following location. Is the path correct?\n\n  "${fullSourceMapPath}"`)
    throw e
  }

  let bundleContent
  let fullBundlePath
  if (bundle) {
    fullBundlePath = path.resolve(projectRoot, bundle)
    logger.debug(`Reading bundle file "${bundle}"`)
    try {
      bundleContent = await fs.readFile(fullBundlePath, 'utf-8')
    } catch (e) {
      logger.error(`There was an error attempting to find a bundle file at the following location. Is the path correct?\n\n  "${fullBundlePath}"`)
      throw e
    }
  }

  let sourceMapJson
  try {
    sourceMapJson = JSON.parse(sourceMapContent)
  } catch (e) {
    logger.error(`The provided source map was not valid JSON. Is this the correct file?\n\n  "${fullSourceMapPath}"`)
    throw e
  }

  logger.info('Applying transformations to source map')
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
      minifiedUrl: bundleUrl,
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
  logger.info(`Uploading browser source maps for "${baseUrl}"`)
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
    logger.debug(`Reading source map "${sourceMap}"`)
    const fullSourceMapPath = path.resolve(absoluteSearchPath, sourceMap)
    let sourceMapContent
    try {
      sourceMapContent = await fs.readFile(fullSourceMapPath, 'utf-8')
    } catch (e) {
      logger.error(`There was an error attempting to find a source map at the following location.\n\n  "${fullSourceMapPath}"`)
      throw e
    }

    let sourceMapJson
    try {
      sourceMapJson = JSON.parse(sourceMapContent)
    } catch (e) {
      logger.error(`The following source map was not valid JSON.\n\n  "${fullSourceMapPath}"`)
      throw e
    }

    const bundlePath = sourceMap.replace(/\.map$/, '')

    let bundleContent
    const fullBundlePath = path.resolve(absoluteSearchPath, bundlePath)
    logger.debug(`Reading bundle file "${bundlePath}"`)
    try {
      bundleContent = await fs.readFile(fullBundlePath, 'utf-8')
    } catch (e) {
      logger.warn(`A bundle file could not be found for "${sourceMap}" at the following location.\n\n  "${fullBundlePath}"`)
    }

    logger.info('Applying transformations to source map')
    const transformedSourceMap = await applyTransformations(fullSourceMapPath, sourceMapJson, projectRoot, logger)

    logger.debug(`Initiating upload "${endpoint}"`)
    const start = new Date().getTime()
    try {
      await request(endpoint, {
        type: PayloadType.Browser,
        apiKey,
        appVersion,
        minifiedUrl: `${baseUrl.replace(/\/$/, '')}/${bundlePath}`,
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
  try {
    return await Promise.resolve(sourceMapJson)
      .then(json => AddSources(fullSourceMapPath, json, projectRoot, logger))
      .then(json => StripProjectRoot(fullSourceMapPath, json, projectRoot, logger))
  } catch (e) {
    logger.error('Error applying transforms to source map', e)
    throw e
  }
}
