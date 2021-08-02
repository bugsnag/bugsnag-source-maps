import { uploadOne, uploadMultiple } from '../NodeUploader'
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
      minifiedUrl: 'bundle.js',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadOne(): dispatches a request with the correct params and detected appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    apiKey: '123',
    sourceMap: 'build/static/js/2.e5bb21a6.chunk.js.map',
    bundle: 'build/static/js/2.e5bb21a6.chunk.js',
    detectAppVersion: true,
    projectRoot: path.join(__dirname, 'fixtures/c')
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      appVersion: '1.2.3',
      minifiedFile: expect.any(Object),
      minifiedUrl: 'build/static/js/2.e5bb21a6.chunk.js',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadOne(): fails when unable to detect appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadOne({
      apiKey: '123',
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

test('uploadOne(): failure (unexpected network error)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('misc upload error')
  err.cause = new Error('network error')
  mockedRequest.mockRejectedValue(err)
  try {
    await uploadOne({
      apiKey: '123',
      bundle: 'bundle.js',
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
      bundle: 'bundle.js',
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
      bundle: 'not-found.js',
      sourceMap: 'bundle.js.map',
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
      bundle: 'bundle.js',
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

test('uploadOne(): custom endpoint (origin only)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    endpoint: 'https://bugsnag.my-company.com',
    apiKey: '123',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    projectRoot: path.join(__dirname, 'fixtures/a'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://bugsnag.my-company.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.any(Object),
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadOne(): custom endpoint (absolute)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    endpoint: 'https://bugsnag.my-company.com/source-map-custom',
    apiKey: '123',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    projectRoot: path.join(__dirname, 'fixtures/a'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://bugsnag.my-company.com/source-map-custom',
    expect.objectContaining({
      apiKey: '123',
      minifiedUrl: 'bundle.js',
      overwrite: false,
      sourceMap: expect.any(Object)
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadOne(): custom endpoint (invalid URL)', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadOne({
      endpoint: 'hljsdf',
      apiKey: '123',
      sourceMap: 'bundle.js.map',
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

test('uploadOne(): codeBundleId', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadOne({
    apiKey: '123',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    projectRoot: path.join(__dirname, 'fixtures/a'),
    logger: mockLogger,
    codeBundleId: 'r0001'
  })
  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.any(Object),
      overwrite: false,
      sourceMap: expect.any(Object),
      codeBundleId: 'r0001'
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadMultiple(): success', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    directory: 'dist',
    projectRoot: path.join(__dirname, 'fixtures/f'),
    logger: mockLogger,
    appVersion: '1.2.3'
  })
  expect(mockedRequest).toHaveBeenCalledTimes(3)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/a.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/a.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/a.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/b.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/b.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/b.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/index.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/index.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/index.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadMultiple(): success with detected appVersion', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    directory: 'build/static/js',
    projectRoot: path.join(__dirname, 'fixtures/c'),
    logger: mockLogger,
    detectAppVersion: true
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
      minifiedUrl: 'build/static/js/2.e5bb21a6.chunk.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
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
      minifiedUrl: 'build/static/js/3.1b8b4fc7.chunk.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
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
      minifiedUrl: 'build/static/js/main.286ac573.chunk.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
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
      minifiedUrl: 'build/static/js/runtime-main.ad66c902.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadMultiple(): success with codeBundleId', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    directory: 'build/static/js',
    projectRoot: path.join(__dirname, 'fixtures/c'),
    logger: mockLogger,
    codeBundleId: 'r00012'
  })
  expect(mockedRequest).toHaveBeenCalledTimes(4)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({ codeBundleId: 'r00012' }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({ codeBundleId: 'r00012'}),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({ codeBundleId: 'r00012' }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({ codeBundleId: 'r00012' }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadMultiple(): success using absolute path for "directory"', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()
  await uploadMultiple({
    apiKey: '123',
    directory: path.join(__dirname, 'fixtures/f/dist'),
    projectRoot: path.join(__dirname, 'fixtures/f'),
    logger: mockLogger,
    appVersion: '1.2.3'
  })
  expect(mockedRequest).toHaveBeenCalledTimes(3)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/a.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/a.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/a.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/b.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/b.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/b.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/sourcemap',
    expect.objectContaining({
      apiKey: '123',
      minifiedFile: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/index.js'),
        data: expect.any(String)
      }),
      sourceMap: expect.objectContaining({
        filepath: path.join(__dirname, 'fixtures/f/dist/index.js.map'),
        data: expect.any(String)
      }),
      overwrite: false,
      minifiedUrl: 'dist/index.js',
      appVersion: '1.2.3'
    }),
    {},
    { idleTimeout: undefined }
  )
})

test('uploadMultiple(): no source maps', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('timeout')
  err.code = NetworkErrorCode.TIMEOUT
  mockedRequest.mockRejectedValue(err)
  await uploadMultiple({
    apiKey: '123',
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
    directory: 'dist',
    projectRoot: path.join(__dirname, 'fixtures/g'),
    logger: mockLogger
  })
  expect(mockedRequest).toHaveBeenCalledTimes(3)
  expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('could not be found'))
})

test('uploadMultiple(): invalid source map', async () => {
  const mockedRequest  = request as jest.MockedFunction<typeof request>
  try {
    await uploadMultiple({
      apiKey: '123',
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
      directory: 'dist',
      projectRoot: path.join(__dirname, 'fixtures/f'),
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
      directory: 'dist',
      projectRoot: path.join(__dirname, 'fixtures/f'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(6)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as NetworkError).code).toBe(NetworkErrorCode.UNKNOWN)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An unexpected error occurred'), expect.any(Error), expect.any(Error))
  }
})

describe('input validation errors (when using as a JS library', () => {
  test.each([
    [ {}, 'apiKey is required and must be a string' ],
    [ { apiKey: 123 }, 'apiKey is required and must be a string' ],
    [ { apiKey: '123' }, 'sourceMap is required and must be a string' ],
    [ { apiKey: '123', sourceMap: 'm.map', appVersion: 1 }, 'appVersion must be a string' ],
    [ { apiKey: '123', sourceMap: 'm.map', logger: null }, 'logger must be an object' ],
    [ { apiKey: '123', sourceMap: 'm.map', overwrite: 'yes' }, 'overwrite must be true or false' ],
    [ { apiKey: '123', sourceMap: 'm.map', somethingDifferent: 'yes' }, 'Unrecognized option(s): somethingDifferent' ],
    [
      { apiKey: '123', sourceMap: 'm.map', somethingDifferent: 'yes', somethingElse: 'no' },
      'Unrecognized option(s): somethingDifferent, somethingElse'
    ],
  ])('uploadOne(): invalid input rejects with an error', (input, expectedError) => {
    // The following line is meant to be invalid, so convince the linter and the compiler we definitely want to do it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return expect(uploadOne(input)).rejects.toThrowError(expectedError)
  })
  test.each([
    [ {}, 'apiKey is required and must be a string' ],
    [ { apiKey: 123 }, 'apiKey is required and must be a string' ],
    [ { apiKey: '123' }, 'directory is required and must be a string' ],
    [ { apiKey: '123', directory: '.', appVersion: 1 }, 'appVersion must be a string' ],
    [ { apiKey: '123', directory: '.', somethingDifferent: 'yes' }, 'Unrecognized option(s): somethingDifferent' ],
    [
      { apiKey: '123', directory: '.', somethingDifferent: 'yes', somethingElse: 'no' },
      'Unrecognized option(s): somethingDifferent, somethingElse'
    ],
  ])('uploadMultiple(): invalid input rejects with an error', (input, expectedError) => {
    // The following line is meant to be invalid, so convince the linter and the compiler we definitely want to do it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return expect(uploadMultiple(input)).rejects.toThrowError(expectedError)
  })
})
