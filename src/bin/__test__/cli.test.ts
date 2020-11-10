import run from '../cli'
import logger from '../../Logger'
import * as browser from '../../uploaders/BrowserUploader'
import * as node from '../../uploaders/NodeUploader'
import * as reactNative from '../../uploaders/ReactNativeUploader'
import { LogLevel } from 'consola'

jest.mock('../../uploaders/BrowserUploader')
jest.mock('../../uploaders/NodeUploader')
jest.mock('../../uploaders/ReactNativeUploader')
jest.mock('../../Logger')

beforeEach(() => {
  process.exitCode = 0
})

test('cli: prints help', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  await run(['--help'])
  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps <command>'))
})

test('cli: version', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  await run(['--version'])
  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('@bugsnag/source-maps v'))
})

test('cli: duplicate option', async () => {
  await run(['--help', '--help'])
  expect(logger.error).toHaveBeenCalledWith('Invalid options. Singular option already set [help=true]')
})

test('cli: unrecognised command', async () => {
  await run(['xyz'])
  expect(logger.error).toHaveBeenCalledWith('Unrecognized command "xyz".')
})

test('cli: unrecognised command', async () => {
  await run(['--opt'])
  expect(logger.error).toHaveBeenCalledWith('Command expected, nothing provided.')
})

// NODE

test('cli: upload-node command', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  run(['upload-node', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps upload-node'))
})

test('cli: upload-node invalid option', async () => {
  await run(['upload-node', 'foo'])
  expect(logger.error).toHaveBeenCalledWith('Invalid argument provided. Unknown value: foo')
})

test('cli: upload-node exit code for failure', async () => {
  const mockedUpload = node.uploadOne as jest.MockedFunction<typeof node.uploadOne>
  mockedUpload.mockRejectedValue(new Error('fail'))
  await run(['upload-node', '--api-key', '123', '--source-map', 'bundle.js.map'])
  expect(process.exitCode).toBe(1)
})

test('cli: upload-node single mode', async () => {
  await run(['upload-node', '--api-key', '123', '--bundle', 'bundle.js', '--source-map', 'bundle.js.map'])
  expect(node.uploadOne).toHaveBeenCalledTimes(1)
  expect(node.uploadOne).toHaveBeenCalledWith(
    expect.objectContaining({ apiKey: '123', bundle: 'bundle.js', sourceMap: 'bundle.js.map' })
  )
})

test('cli: upload-node multiple mode', async () => {
  await run(['upload-node', '--api-key', '123', '--directory', 'dist'])
  expect(node.uploadMultiple).toHaveBeenCalledTimes(1)
  expect(node.uploadMultiple).toHaveBeenCalledWith(
    expect.objectContaining({ apiKey: '123', directory: 'dist' })
  )
})

test('cli: upload-node single mode missing opts', async () => {
  await run(['upload-node', '--api-key', '123', '--bundle', 'http://my.url/dist/bundle.js'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--source-map is required')

  process.exitCode = undefined

  await run(['upload-node', '--api-key', '123'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('Not enough options supplied')

  process.exitCode = undefined

  await run(['upload-node'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--api-key is required')
})

test('cli: upload-node incompatible opts', async () => {
  await run(['upload-node', '--api-key', '123', '--bundle', 'bundle.js', '--directory', 'dist'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Incompatible options are set.'))
})

test('cli: upload-node --quiet', async () => {
  await run(['upload-node', '--api-key', '123', '--bundle', 'bundle.js', '--source-map', 'bundle.js.map', '--quiet'])
  expect(node.uploadOne).toHaveBeenCalledTimes(1)
  expect(logger.level).toBe(LogLevel.Success)
})

// BROWSER

test('cli: upload-browser --help', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  await run(['upload-browser', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps upload-browser'))
})

test('cli: upload-browser invalid option', async () => {
  await run(['upload-browser', 'foo'])
  expect(logger.error).toHaveBeenCalledWith('Invalid argument provided. Unknown value: foo')
})

test('cli: upload-browser exit code for failure', async () => {
  const mockedUpload = browser.uploadOne as jest.MockedFunction<typeof browser.uploadOne>
  mockedUpload.mockRejectedValue(new Error('fail'))
  await run(['upload-browser', '--api-key', '123', '--bundle-url', 'http://my.url/dist/bundle.js', '--source-map', 'bundle.js.map'])
  expect(process.exitCode).toBe(1)
})

test('cli: upload-browser single mode', async () => {
  await run(['upload-browser', '--api-key', '123', '--bundle-url', 'http://my.url/dist/bundle.js', '--source-map', 'bundle.js.map'])
  expect(browser.uploadOne).toHaveBeenCalledTimes(1)
  expect(browser.uploadOne).toHaveBeenCalledWith(
    expect.objectContaining({ apiKey: '123', bundleUrl: 'http://my.url/dist/bundle.js', sourceMap: 'bundle.js.map' })
  )
})

test('cli: upload-browser single mode missing opts', async () => {
  await run(['upload-browser', '--api-key', '123', '--bundle-url', 'http://my.url/dist/bundle.js'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--source-map is required')

  process.exitCode = undefined

  await run(['upload-browser', '--api-key', '123', '--source-map', 'bundle.js.map'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--bundle-url is required')

  process.exitCode = undefined

  await run(['upload-browser', '--api-key', '123'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('Not enough options supplied')

  process.exitCode = undefined

  await run(['upload-browser'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--api-key is required')
})

test('cli: upload-browser multiple mode missing opts', async () => {
  await run(['upload-browser', '--api-key', '123', '--directory', 'dist'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--base-url is required')

  process.exitCode = undefined

  await run(['upload-browser', '--api-key', '123', '--base-url', 'http://my.url/dist'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--directory is required')
})

test('cli: upload-browser incompatible opts', async () => {
  await run(['upload-browser', '--api-key', '123', '--bundle-url', 'http://my.url/dist/bundle.js', '--directory', 'dist'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Incompatible options are set.'))
})

test('cli: upload-browser --quiet', async () => {
  await run(['upload-browser', '--api-key', '123', '--bundle-url', 'http://my.url/dist/bundle.js', '--source-map', 'bundle.js.map', '--quiet'])
  expect(browser.uploadOne).toHaveBeenCalledTimes(1)
  expect(logger.level).toBe(LogLevel.Success)
})

// REACT NATIVE

test('cli: upload-react-native --help', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  await run(['upload-react-native', '--help'])

  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps upload-react-native'))
  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success (ios)', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success (ios with app bundle version)', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--app-bundle-version', '1.2.3',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    appBundleVersion: '1.2.3',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success (android)', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'android',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'android',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success (android with app version code)', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'android',
    '--app-version', '1.0.2',
    '--app-version-code', '1.2.3',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'android',
    appVersionCode: '1.2.3',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2',
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success with custom endpoint', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
    '--endpoint', 'https://example.com',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    endpoint: 'https://example.com',
    platform: 'ios',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success with custom project root', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
    '--project-root', '/a/b/c',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    projectRoot: '/a/b/c',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success with "fetch" mode', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--fetch',
  ])

  expect(reactNative.fetchAndUploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success with "fetch" mode and custom URL', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--fetch',
    '--bundler-url', 'http://example.com:1100/rn-bundler'
  ])

  expect(reactNative.fetchAndUploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    bundlerUrl: 'http://example.com:1100/rn-bundler',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native success with "fetch" mode and custom entry point', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--fetch',
    '--bundler-entry-point', 'cool-app.js'
  ])

  expect(reactNative.fetchAndUploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    bundlerEntryPoint: 'cool-app.js',
    appVersion: '1.0.2'
  }))

  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native --quiet', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--quiet',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2'
  }))

  expect(logger.level).toBe(LogLevel.Success)
  expect(process.exitCode).toBe(0)
})

test('cli: upload-react-native invalid value', async () => {
  await run(['upload-react-native', 'abc'])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('Invalid argument provided. Unknown value: abc')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native invalid option', async () => {
  await run(['upload-react-native', '--abc'])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('Invalid argument provided. Unknown option: --abc')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native exit code for failure', async () => {
  (reactNative.uploadOne as jest.MockedFunction<typeof reactNative.uploadOne>).mockRejectedValueOnce(new Error('fail'))

  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).toHaveBeenCalledWith(expect.objectContaining({
    apiKey: '1234',
    platform: 'ios',
    bundle: 'some/file.js',
    sourceMap: 'some/file.js.map',
    appVersion: '1.0.2',
  }))

  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with no api key', async () => {
  await run([
    'upload-react-native',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--api-key is a required parameter')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with no platform', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--platform is a required parameter')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with invalid platform', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'abc',
    '--app-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--platform must be either "android" or "ios"')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with app version and code bundle ID', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--app-version', '1.0.2',
    '--code-bundle-id', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--app-version and --code-bundle-id cannot both be given')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with code bundle id and app bundle version', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--code-bundle-id', '1.0.2',
    '--app-bundle-version', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--app-bundle-version and --code-bundle-id cannot both be given')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails with code bundle id and app version code', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--code-bundle-id', '1.0.2',
    '--app-version-code', '1.0.2',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--app-version-code and --code-bundle-id cannot both be given')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails without app version or code bundle id', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--platform', 'ios',
    '--source-map', 'some/file.js.map',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('Either --app-version or --code-bundle-id must be given')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails when source map is missing', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--code-bundle-id', '1.0.2',
    '--platform', 'ios',
    '--bundle', 'some/file.js',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--source-map is a required parameter')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails when bundle is missing', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--code-bundle-id', '1.0.2',
    '--platform', 'ios',
    '--source-map', 'some/file.js.map',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--bundle is a required parameter')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails when app version code is given for ios', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--app-version', '1.0.2',
    '--platform', 'ios',
    '--app-version-code', '1.2.3',
    '--source-map', 'some/file.js.map',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--app-version-code cannot be given with --platform "ios"')
  expect(process.exitCode).toBe(1)
})

test('cli: upload-react-native fails when app bundle version is given for android', async () => {
  await run([
    'upload-react-native',
    '--api-key', '1234',
    '--app-version', '1.0.2',
    '--platform', 'android',
    '--app-bundle-version', '1.2.3',
    '--source-map', 'some/file.js.map',
  ])

  expect(reactNative.uploadOne).not.toHaveBeenCalled()
  expect(reactNative.fetchAndUploadOne).not.toHaveBeenCalled()
  expect(logger.error).toHaveBeenCalledWith('--app-bundle-version cannot be given with --platform "android"')
  expect(process.exitCode).toBe(1)
})
