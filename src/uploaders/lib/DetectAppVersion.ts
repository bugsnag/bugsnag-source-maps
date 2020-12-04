import readPkgUp from 'read-pkg-up'
import { Logger } from '../../Logger'

export default async function detectAppVersion (projectRoot: string, logger: Logger): Promise<string> {
  const pkg = await readPkgUp({ cwd: projectRoot })
  const version = pkg?.packageJson.version

  if (!version) {
    throw new Error(
      'Unable to automatically detect app version. Provide the "--app-version" argument or add a "version" key to your package.json file.'
    )
  }

  logger.debug(`Detected appVersion "${version}"`)

  return version
}
