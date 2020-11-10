import path from 'path'
import { promises as fs } from 'fs'
import stringifyFileAccessError from './StringifyFileAccessError'
import { Logger } from '../../Logger'

export default async function readBundleContent (bundlePath: string, basePath: string, sourceMapName: string, logger: Logger): Promise<[string, string]> {
  const fullBundlePath = path.resolve(basePath, bundlePath)
  logger.debug(`Reading bundle file "${bundlePath}"`)
  try {
    return [ await fs.readFile(fullBundlePath, 'utf-8'), fullBundlePath ]
  } catch (e) {
    logger.error(`The bundle "${bundlePath}" could not be found. ${stringifyFileAccessError(e)}\n\n  "${fullBundlePath}"`)
    throw e
  }
}