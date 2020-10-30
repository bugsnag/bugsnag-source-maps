import { promises as fs } from 'fs'
import path from 'path'
import http from 'http'
import readPkgUp from 'read-pkg-up'

import { Logger, noopLogger } from '../Logger'
import request, { PayloadType } from '../Request'
import AddSources from '../transformers/AddSources'
import StripProjectRoot from '../transformers/StripProjectRoot'
import formatErrorLog from './FormatErrorLog'

interface UploadOpts {
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
}: UploadOpts): Promise<void> {
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
  let transformedSourceMap
  try {
    transformedSourceMap = await Promise.resolve(sourceMapJson)
      .then(json => AddSources(fullSourceMapPath, json, projectRoot, logger))
      .then(json => StripProjectRoot(fullSourceMapPath, json, projectRoot, logger))
  } catch (e) {
    logger.error('Error applying transforms to source map', e)
    throw e
  }

  if (!appVersion) {
    appVersion = await detectAppVersion(projectRoot)
    if (appVersion) logger.debug(`Detected appVersion "${appVersion}"`)
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

async function detectAppVersion (projectRoot: string): Promise<string | undefined> {
  const pkg = await readPkgUp({ cwd: projectRoot })
  const version = pkg?.packageJson.version
  return version ? version : undefined
}
