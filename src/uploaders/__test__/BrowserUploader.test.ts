import { uploadOne } from '../BrowserUploader'
import request from '../../Request'
import { UploadError, UploadErrorCode } from '../../UploadError'
import path from 'path'

jest.mock('../../Request')

const mockLogger = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  level: -1
}

test('uploadOne(): dispatches a request with the correct params', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    apiKey: '123',
    bundleUrl: 'http://mybundle.jim',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/a')
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/',
    expect.objectContaining({
      apiKey: '123',
      appVersion: '1.2.3',
      minifiedFile: expect.any(Object),
      minifiedUrl: 'http://mybundle.jim',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params (no bundle)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    apiKey: '123',
    bundleUrl: 'http://mybundle.jim',
    sourceMap: 'bundle.js.map',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/a')
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/',
    expect.objectContaining({
      apiKey: '123',
      appVersion: '1.2.3',
      minifiedFile: undefined,
      minifiedUrl: 'http://mybundle.jim',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): source map file could not be located', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockRejectedValue(new Error('network error'))
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      projectRoot: path.join(__dirname, 'fixtures/a')
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
  }
})

test('uploadOne(): failure (unexpected network error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('misc upload error')
  err.cause = new Error('network error')
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('misc upload error')
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An unexpected error occured.'), expect.any(Error), expect.any(Error))
  }
})

test('uploadOne(): failure (source map not found)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockRejectedValue(new Error('network error'))
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'not-found.js.map',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toMatch(/ENOENT/)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('There was an error attempting to find a source map at the following location. Is the path correct?'))
  }
})

test('uploadOne(): failure (bundle not found)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockRejectedValue(new Error('network error'))
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'not-found.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toMatch(/ENOENT/)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('There was an error attempting to find a bundle file at the following location. Is the path correct?'))
  }
})

test('uploadOne(): failure (empty bundle)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('network error')
  err.code = UploadErrorCode.EMPTY_FILE
  err.responseText = 'empty'
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.EMPTY_FILE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The uploaded source map was empty'), expect.any(Error))
  }
})

test('uploadOne(): failure (invalid api key)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('unauthed')
  err.code = UploadErrorCode.INVALID_API_KEY
  err.responseText = 'api key wrong'
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.INVALID_API_KEY)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The provided API key was invalid'), expect.any(Error))
  }
})

test('uploadOne(): failure (misc bad request)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('misc bad request')
  err.code = UploadErrorCode.MISC_BAD_REQUEST
  err.responseText = 'server no likey'
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.MISC_BAD_REQUEST)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request was rejected by the server as invalid.\n\n  responseText = server no likey'), expect.any(Error))
  }
})

test('uploadOne(): failure (duplicate)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('duplicate')
  err.code = UploadErrorCode.DUPLICATE
  err.responseText = 'duplicate'
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.DUPLICATE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A source map matching the same criteria has already been uploaded. If you want to replace it, use the "overwrite" flag'), expect.any(Error))
  }
})

test('uploadOne(): failure (server error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('server error')
  err.code = UploadErrorCode.SERVER_ERROR
  err.responseText = 'internal server error'
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.SERVER_ERROR)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A server side error occurred while processing the upload.\n\n  responseText = internal server error'), expect.any(Error))
  }
})

test('uploadOne(): failure (timeout)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new UploadError('timeout')
  err.code = UploadErrorCode.TIMEOUT
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.TIMEOUT)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request timed out'), expect.any(Error))
  }
})
