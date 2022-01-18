import { Logger } from '../Logger';
import { UnsafeSourceMap } from '../SourceMap';
import { promises as fs } from 'fs'
import path from 'path'

export default async function addSources (sourceMapPath: string, sourceMap: unknown, projectRoot: string, logger: Logger): Promise<unknown> {
  logger.debug('Ensuring sourcesContent field is populated')
  if (!sourceMap || typeof sourceMap !== 'object') return sourceMap

  const maybeSourceMap: UnsafeSourceMap = sourceMap as UnsafeSourceMap

  if (maybeSourceMap.sections) {
    for (const section of maybeSourceMap.sections) {
      if (section.map) await addSourcesContent(sourceMapPath, section.map, projectRoot, logger)
    }
  } else {
    await addSourcesContent(sourceMapPath, maybeSourceMap, projectRoot, logger)
  }

  return maybeSourceMap
}

async function addSourcesContent (sourceMapPath: string, map: UnsafeSourceMap, projectRoot: string, logger: Logger) {
  if (map.sources?.length === map.sourcesContent?.length) {
    return map
  }

  const sourcesContent = []
  if (map.sources && map.sources.length) {
    const sources: string[] = map.sources
    for (const p of sources) {
      let source = null
      try {
        // don't look up sources for virtual webpack files
        if (!/^webpack:\/\/(.*)\/webpack/.test(p)) {
          const absoluteSourcePath = path.resolve(
            path.dirname(sourceMapPath),
            p.replace(/webpack:\/\/.*\/\.\//, `${projectRoot}/`)
          )
          source = await fs.readFile(absoluteSourcePath, 'utf-8')
        }
      } catch (e) {
        logger.warn(`No source found for "${p}" when searching relative to the source map "${sourceMapPath}"`)
      }
      sourcesContent.push(source)
    }
    map.sourcesContent = sourcesContent
  }
}
