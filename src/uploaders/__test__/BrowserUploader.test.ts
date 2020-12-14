import { uploadOne, uploadMultiple } from '../BrowserUploader'
import request from '../../Request'
import { NetworkError, NetworkErrorCode } from '../../NetworkError'
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
    'https://upload.bugsnag.com/sourcemap',
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
    'https://upload.bugsnag.com/sourcemap',
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

test('uploadOne(): failure (unexpected network error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('misc upload error')
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
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An unexpected error occurred.'), expect.any(Error), expect.any(Error))
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
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The source map "not-found.js.map" could not be found'))
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
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The bundle "not-found.js" could not be found'))
  }
})

test('uploadOne(): failure (sourcemap is invalid json)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim',
      sourceMap: 'invalid-source-map.js.map',
      projectRoot: path.join(__dirname, 'fixtures/b'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(0)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Unexpected token h in JSON at position 0')
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The source map was not valid JSON.'))
  }
})

test('uploadOne(): fails when unable to detect appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadOne({
      apiKey: '123',
      bundleUrl: 'http://mybundle.jim/',
      projectRoot: path.join(__dirname, 'fixtures/h'),
      sourceMap: 'build/static/js/2.e5bb21a6.chunk.js.map',
      bundle: 'build/static/js/2.e5bb21a6.chunk.js',
      detectAppVersion: true,
      logger: mockLogger
    })
    expect(mockedRequest).not.toHaveBeenCalled()
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Unable to automatically detect app version. Provide the "--app-version" argument or add a "version" key to your package.json file.')
    expect(mockLogger.error).toHaveBeenCalledWith('Unable to automatically detect app version. Provide the "--app-version" argument or add a "version" key to your package.json file.')
  }
})

test('uploadOne(): failure (empty bundle)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('network error')
  err.code = NetworkErrorCode.EMPTY_FILE
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.EMPTY_FILE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The uploaded source map was empty'), expect.any(Error))
  }
})

test('uploadOne(): failure (invalid api key)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('unauthed')
  err.code = NetworkErrorCode.INVALID_API_KEY
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.INVALID_API_KEY)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The provided API key was invalid'), expect.any(Error))
  }
})

test('uploadOne(): failure (misc bad request)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('misc bad request')
  err.code = NetworkErrorCode.MISC_BAD_REQUEST
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.MISC_BAD_REQUEST)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request was rejected by the server as invalid.\n\n  responseText = server no likey'), expect.any(Error))
  }
})

test('uploadOne(): failure (duplicate)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('duplicate')
  err.code = NetworkErrorCode.DUPLICATE
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.DUPLICATE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A source map matching the same criteria has already been uploaded. If you want to replace it, use the "overwrite" flag'), expect.any(Error))
  }
})

test('uploadOne(): failure (server error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('server error')
  err.code = NetworkErrorCode.SERVER_ERROR
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.SERVER_ERROR)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A server side error occurred while processing the upload.\n\n  responseText = internal server error'), expect.any(Error))
  }
})

test('uploadOne(): failure (timeout)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('timeout')
  err.code = NetworkErrorCode.TIMEOUT
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
    expect((e as NetworkError).code).toBe(NetworkErrorCode.TIMEOUT)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request timed out'), expect.any(Error))
  }
})

test('uploadOne(): custom endpoint (origin only)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    endpoint: 'https://bugsnag.my-company.com',
    apiKey: '123',
    sourceMap: 'bundle.js.map',
    bundleUrl: 'http://mybundle.jim',
    bundle: 'bundle.js',
    projectRoot: path.join(__dirname, 'fixtures/a'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://bugsnag.my-company.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedUrl: 'http://mybundle.jim',
      minifiedFile: expect.any(Object),
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): custom endpoint (absolute)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    endpoint: 'https://bugsnag.my-company.com/source-map-custom',
    apiKey: '123',
    sourceMap: 'bundle.js.map',
    bundleUrl: 'http://mybundle.jim',
    bundle: 'bundle.js',
    projectRoot: path.join(__dirname, 'fixtures/a'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://bugsnag.my-company.com/source-map-custom',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.any(Object),
      minifiedUrl: 'http://mybundle.jim',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): custom endpoint (invalid URL)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadOne({
      endpoint: 'hljsdf',
      apiKey: '123',
      sourceMap: 'bundle.js.map',
      bundleUrl: 'https://mybundle.jim',
      bundle: 'bundle.js',
      projectRoot: path.join(__dirname, 'fixtures/a'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(0)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Invalid URL: hljsdf')
    expect(mockLogger.error).toHaveBeenCalledWith(e)
  }
})

test('uploadMultiple(): success with detected appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    baseUrl: 'http://mybundle.jim/',
    directory: 'build',
    projectRoot: path.join(__dirname, 'fixtures/c'),
    detectAppVersion: true,
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(4)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/2.e5bb21a6.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/2.e5bb21a6.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/2.e5bb21a6.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/3.1b8b4fc7.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/3.1b8b4fc7.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/3.1b8b4fc7.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/main.286ac573.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/main.286ac573.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/main.286ac573.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/runtime-main.ad66c902.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/runtime-main.ad66c902.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/runtime-main.ad66c902.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
})

test('uploadMultiple(): success passing appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    baseUrl: 'http://mybundle.jim/',
    directory: 'build',
    projectRoot: path.join(__dirname, 'fixtures/h'),
    appVersion: '4.5.6',
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(4)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/2.e5bb21a6.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/2.e5bb21a6.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/2.e5bb21a6.chunk.js',
      appVersion: '4.5.6'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/3.1b8b4fc7.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/3.1b8b4fc7.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/3.1b8b4fc7.chunk.js',
      appVersion: '4.5.6'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/main.286ac573.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/main.286ac573.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/main.286ac573.chunk.js',
      appVersion: '4.5.6'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/runtime-main.ad66c902.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/h/build/static/js/runtime-main.ad66c902.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/runtime-main.ad66c902.js',
      appVersion: '4.5.6'
    }),
    expect.objectContaining({})
  )
})

test('uploadMultiple(): success using absolute path for "directory"', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    baseUrl: 'http://mybundle.jim/',
    directory: path.join(__dirname, 'fixtures/c/build'),
    projectRoot: path.join(__dirname, 'fixtures/c'),
    detectAppVersion: true,
    logger: mockLogger
  })

  expect(mockedRequest).toHaveBeenCalledTimes(4)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/2.e5bb21a6.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/2.e5bb21a6.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/2.e5bb21a6.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/3.1b8b4fc7.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/3.1b8b4fc7.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/3.1b8b4fc7.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/main.286ac573.chunk.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/main.286ac573.chunk.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/main.286ac573.chunk.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/runtime-main.ad66c902.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/c/build/static/js/runtime-main.ad66c902.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'http://mybundle.jim/static/js/runtime-main.ad66c902.js',
      appVersion: '1.2.3'
    }),
    expect.objectContaining({})
  )
})

test('uploadMultiple(): no source maps', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('timeout')
  err.code = NetworkErrorCode.TIMEOUT
  mockedRequest.mockRejectedValue(err)
  await uploadMultiple({
    apiKey: '123',
    baseUrl: 'http://mybundle.jim/',
    directory: '.',
    projectRoot: path.join(__dirname, 'fixtures/d'),
    logger: mockLogger
  })
  expect(mockLogger.warn).toHaveBeenCalledWith('No source maps found.')
})

test('uploadMultiple(): no bundles', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    baseUrl: 'http://mybundle.jim/',
    directory: 'build',
    projectRoot: path.join(__dirname, 'fixtures/e'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(4)
  expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('could not be found'))
})

test('uploadMultiple(): invalid source map', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadMultiple({
      apiKey: '123',
      baseUrl: 'http://mybundle.jim/',
      directory: '.',
      projectRoot: path.join(__dirname, 'fixtures/b'),
      logger: mockLogger
    })
    expect(mockedRequest).not.toHaveBeenCalled()
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Unexpected token h in JSON at position 0')
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The source map was not valid JSON.'))
  }
})

test('uploadMultiple(): fails when unable to detect appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadMultiple({
      apiKey: '123',
      baseUrl: 'http://mybundle.jim/',
      directory: 'build',
      projectRoot: path.join(__dirname, 'fixtures/h'),
      detectAppVersion: true,
      logger: mockLogger
    })
    expect(mockedRequest).not.toHaveBeenCalled()
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Unable to automatically detect app version. Provide the "--app-version" argument or add a "version" key to your package.json file.')
    expect(mockLogger.error).toHaveBeenCalledWith('Unable to automatically detect app version. Provide the "--app-version" argument or add a "version" key to your package.json file.')
  }
})

test('uploadMultiple(): failure (timeout)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('timeout')
  err.code = NetworkErrorCode.TIMEOUT
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadMultiple({
      apiKey: '123',
      baseUrl: 'http://mybundle.jim/',
      directory: 'build',
      projectRoot: path.join(__dirname, 'fixtures/c'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(3)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as NetworkError).code).toBe(NetworkErrorCode.TIMEOUT)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request timed out'), expect.any(Error))
  }
})

test('uploadMultiple(): failure (connection error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('misc error')
  err.code = NetworkErrorCode.UNKNOWN
  err.cause = new Error('the cause')
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadMultiple({
      apiKey: '123',
      baseUrl: 'http://mybundle.jim/',
      directory: 'build',
      projectRoot: path.join(__dirname, 'fixtures/c'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(6)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as NetworkError).code).toBe(NetworkErrorCode.UNKNOWN)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An unexpected error occurred'), expect.any(Error), expect.any(Error))
  }
})
