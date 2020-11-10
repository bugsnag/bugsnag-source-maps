import { Logger } from '../../Logger'
import AddSources from '../../transformers/AddSources'
import StripProjectRoot from '../../transformers/StripProjectRoot'

export default async function applyTransformations(fullSourceMapPath: string, sourceMapJson: unknown, projectRoot: string, logger: Logger): Promise<unknown> {
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