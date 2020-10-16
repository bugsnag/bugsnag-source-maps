import run from '../cli'

afterEach(() => {
  jest.resetAllMocks()
})

test('cli prints help', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  let exitCode
  //@ts-expect-error never type can't work here
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => {
    exitCode = code
  })
  run(['/usr/bin/env/node', 'source-map-upload', '--help'])
  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps <command>'))
  expect(exitSpy).toHaveBeenCalled()
  expect(exitCode).toBe(0)
})

test('cli upload-node command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  run(['/usr/bin/env/node', 'source-map-upload', 'upload-node'])
  expect(logSpy).toHaveBeenCalledWith('TODO: uploadNode()')
})

test('cli upload-react-native command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  run(['/usr/bin/env/node', 'source-map-upload', 'upload-react-native'])
  expect(logSpy).toHaveBeenCalledWith('TODO: uploadReactNative()')
})

test('cli upload-browser command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  run(['/usr/bin/env/node', 'source-map-upload', 'upload-browser'])
  expect(logSpy).toHaveBeenCalledWith('TODO: uploadBrowser()')
})