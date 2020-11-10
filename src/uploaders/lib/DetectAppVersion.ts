import readPkgUp from 'read-pkg-up'
import { Logger } from '../../Logger'

export default async function detectAppVersion (projectRoot: string, logger: Logger): Promise<string | undefined> {
  const pkg = await readPkgUp({ cwd: projectRoot })
  const version = pkg?.packageJson.version
  if (version) logger.debug(`Detected appVersion "${version}"`)
  return version ? version : undefined
}