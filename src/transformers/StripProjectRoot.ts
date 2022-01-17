import { Logger } from '../Logger';
import { UnsafeSourceMap } from '../SourceMap'
import path from 'path'

export default async function stripProjectRoot (sourceMapPath: string, sourceMap: unknown, projectRoot: string, logger: Logger): Promise<unknown> {
  logger.debug('Stripping project root from sources')
  if (!sourceMap || typeof sourceMap !== 'object') return sourceMap

  const maybeSourceMap: UnsafeSourceMap = sourceMap as UnsafeSourceMap

  if (maybeSourceMap.sections) {
    for (const section of maybeSourceMap.sections) {
      if (section.map) strip(sourceMapPath, section.map, projectRoot)
    }
  } else {
    strip(sourceMapPath, maybeSourceMap, projectRoot)
  }

  return maybeSourceMap
}

function strip (sourceMapPath: string, map: UnsafeSourceMap, projectRoot: string): void {
  if (!map.sources) return
  map.sources = map.sources.map(s => {
    if (/^webpack:\/\/(.*)\/webpack/.test(s)) return s.replace(/^(webpack:\/\/)(.*)(\/webpack)/, '$1$3')
    const absoluteSourcePath = path.resolve(
      path.dirname(sourceMapPath),
      s.replace(/webpack:\/\/.*\/\.\//, `${projectRoot}/`)
    )
    return absoluteSourcePath.replace(projectRoot, '').replace(/^(\/|\\)/, '')
  })
}
