import run from '../cli'

test('cli prints help', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn())
  run(['--help'])
  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps <command>'))
})

test('cli upload-node command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  run(['upload-node', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TODO'))
})

test('cli upload-react-native command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  run(['upload-react-native', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TODO'))
})

test('cli upload-browser command', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})
  run(['upload-browser', '--help'])
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bugsnag-source-maps upload-browser'))
})