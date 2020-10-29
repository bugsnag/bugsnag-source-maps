import run from '../cli'
import logger from '../../Logger'
import * as browser from '../../uploaders/BrowserUploader'
import { LogLevel } from 'consola'

jest.mock('../../uploaders/BrowserUploader')
jest.mock('../../Logger')

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

test('cli: upload-node command', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  run(['upload-node', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TODO'))
})

test('cli: upload-react-native command', async () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  await run(['upload-react-native', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TODO'))
})

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

  await run(['upload-browser', '--api-key', '123', '--source-map', 'bundle.js.map'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--bundle-url is required')

  await run(['upload-browser', '--api-key', '123'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('Not enough options supplied')

  await run(['upload-browser'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--api-key is required')
})

test('cli: upload-browser multiple mode', async () => {
  await run(['upload-browser', '--api-key', '123', '--base-url', 'http://my.url/dist', '--directory', 'dist'])
  // TODO
})

test('cli: upload-browser multiple mode missing opts', async () => {
  await run(['upload-browser', '--api-key', '123', '--directory', 'dist'])
  expect(process.exitCode).toBe(1)
  expect(logger.error).toHaveBeenCalledWith('--base-url is required')

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

test('cli: unrecognised command', async () => {
  await run(['xyz'])
  expect(logger.error).toHaveBeenCalledWith('Unrecognized command "xyz".')
})

test('cli: unrecognised command', async () => {
  await run(['--opt'])
  expect(logger.error).toHaveBeenCalledWith('Command expected, nothing provided.')
})