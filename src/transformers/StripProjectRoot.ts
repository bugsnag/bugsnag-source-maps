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
    // leave sources for virtual webpack files untouched
    if (/^webpack:\/\/(.*)\/webpack/.test(s)) return s

    // If the source path is a webpack path and we are running on Windows,
    // we normalize the path separators to URI format
    const isWebPackOnWindows = s.indexOf('webpack') > -1 && process.platform === 'win32'

    const absoluteSourcePath = path.resolve(
      path.dirname(sourceMapPath),
      s.replace(/webpack:\/\/.*\/\.\//, `${projectRoot}/`)
    )

    const strippedSourcePath = absoluteSourcePath.replace(projectRoot, '').replace(/^(\/|\\)/, '')
    return isWebPackOnWindows ? strippedSourcePath.replace(/\\/g, '/') : strippedSourcePath
  })
}
