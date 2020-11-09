import { Logger } from '../../Logger'

export default function parseSourceMap (sourceMapContent: string, sourceMapPath: string, logger: Logger): string {
  try {
    return JSON.parse(sourceMapContent)
  } catch (e) {
    logger.error(`The source map was not valid JSON.\n\n  "${sourceMapPath}"`)
    throw e
  }
}