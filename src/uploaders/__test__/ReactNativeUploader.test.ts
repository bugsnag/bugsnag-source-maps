import { promises as fs } from 'fs'
import { uploadOne, fetchAndUploadOne } from '../ReactNativeUploader'
import request, { fetch } from '../../Request'
import File from '../../File'
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

test('uploadOne(): dispatches a request with the correct params for Android with appVersion', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'android',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'android',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params for iOS with appVersion', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params for Android with appVersion and appVersionCode', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'android',
    appVersionCode: '3.2.1',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'android',
      appVersionCode: '3.2.1',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params for iOS with appVersion and appBundleVersion', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    appBundleVersion: '4.5.6',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appBundleVersion: '4.5.6',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params for Android with codeBundleId', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'android',
    appVersionCode: '3.2.1', // We provide this but it should be ignored!
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    codeBundleId: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'android',
      codeBundleId: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest.mock.calls[0][1]).toEqual(expect.not.objectContaining({ appVersionCode: '3.2.1' }))
})

test('uploadOne(): dispatches a request with the correct params for iOS with codeBundleId', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    appBundleVersion: '4.5.6', // We provide this but it should be ignored!
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    codeBundleId: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      codeBundleId: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
  expect(mockedRequest.mock.calls[0][1]).toEqual(expect.not.objectContaining({ appBundleVersion: '4.5.6' }))
})

test('uploadOne(): failure (unexpected network error) with cause', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new NetworkError('misc upload error')
  err.cause = new Error('network error')

  mockedRequest.mockRejectedValue(err)

  try {
    await uploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appBundleVersion: '4.5.6',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      codeBundleId: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
      logger: mockLogger
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('misc upload error')
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred.'),
      err,
      err.cause
    )
  }
})

test('uploadOne(): failure (unexpected network error) without cause', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  const err = new NetworkError('misc upload error')

  mockedRequest.mockRejectedValue(err)

  try {
    await uploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appBundleVersion: '4.5.6',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      codeBundleId: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
      logger: mockLogger
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('misc upload error')
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred.'),
      err
    )
  }
})

test('uploadOne(): failure (source map not found)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockRejectedValue(new Error('network error'))

  try {
    await uploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appBundleVersion: '4.5.6',
      sourceMap: 'does-not-exist.js.map',
      bundle: 'bundle.js',
      codeBundleId: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
      logger: mockLogger
    })
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toMatch(/ENOENT/)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringMatching(/No file exists at the provided path\./)
    )
  }
})

test('uploadOne(): custom endpoint (absolute)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await uploadOne({
    endpoint: 'https://bugsnag.my-company.com/source-map-custom',
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    appBundleVersion: '4.5.6',
    sourceMap: 'bundle.js.map',
    bundle: 'bundle.js',
    codeBundleId: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
    logger: mockLogger
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://bugsnag.my-company.com/source-map-custom',
    expect.objectContaining({ apiKey: '123' }),
    expect.objectContaining({})
  )
})

test('uploadOne(): custom endpoint (invalid URL)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  try {
    await uploadOne({
      endpoint: 'hljsdf',
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appBundleVersion: '4.5.6',
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
      codeBundleId: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
      logger: mockLogger
    })
    expect(mockedRequest).toHaveBeenCalledTimes(0)
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Invalid URL: hljsdf')
    expect(mockLogger.error).toHaveBeenCalledWith(e)
  }
})

test('fetchAndUploadOne(): dispatches a request with the correct params for Android with appVersion in Fetch mode', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'android',
    bundlerUrl: 'http://react-native-bundler:1234',
    bundlerEntryPoint: 'index.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
    logger: mockLogger,
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=false')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=false')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'android',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )

  expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining(
    'Success, uploaded index.js.map to '
  ))
})

test('fetchAndUploadOne(): dispatches a request with the correct params for iOS with appVersion in Fetch mode', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    bundlerUrl: 'http://react-native-bundler:1234',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
    logger: mockLogger,
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=ios&dev=false')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=ios&dev=false')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )

  expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining(
    'Success, uploaded index.js.map to '
  ))
})

test('fetchAndUploadOne(): dispatches a request with the correct params for Android with appVersion in Fetch mode (dev build)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: true,
    platform: 'android',
    bundlerUrl: 'http://react-native-bundler:1234',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('fetchAndUploadOne(): dispatches a request with the correct params for iOS with appVersion in Fetch mode (dev build)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: true,
    platform: 'ios',
    bundlerUrl: 'http://react-native-bundler:1234',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=ios&dev=true')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=ios&dev=true')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('fetchAndUploadOne(): dispatches a request with the correct params with custom entry point', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    bundlerUrl: 'http://react-native-bundler:1234',
    bundlerEntryPoint: 'cool-app.js',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
    logger: mockLogger,
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/cool-app.js.map?platform=ios&dev=false')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/cool-app.bundle?platform=ios&dev=false')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )

  expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining(
    'Success, uploaded cool-app.js.map to '
  ))
})

test('fetchAndUploadOne(): dispatches a request with the correct params with custom entry point with ".bundle" extension', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    bundlerUrl: 'http://react-native-bundler:1234',
    bundlerEntryPoint: 'cool-app.bundle',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
    logger: mockLogger,
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/cool-app.js.map?platform=ios&dev=false')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/cool-app.bundle?platform=ios&dev=false')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )

  expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining(
    'Success, uploaded cool-app.js.map to '
  ))
})

test('fetchAndUploadOne(): dispatches a request with the correct params with custom entry point with no ".js" extension', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))
  const bundle = await fs.readFile(path.resolve(directory, 'bundle.js'))

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockResolvedValueOnce(bundle.toString())

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  await fetchAndUploadOne({
    apiKey: '123',
    overwrite: true,
    dev: false,
    platform: 'ios',
    bundlerUrl: 'http://react-native-bundler:1234',
    bundlerEntryPoint: 'cool-app',
    appVersion: '1.2.3',
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios'),
    logger: mockLogger,
  })

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/cool-app.js.map?platform=ios&dev=false')
  expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/cool-app.bundle?platform=ios&dev=false')

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'https://upload.bugsnag.com/react-native-source-map',
    expect.objectContaining({
      apiKey: '123',
      overwrite: true,
      dev: false,
      platform: 'ios',
      appVersion: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )

  expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining(
    'Success, uploaded cool-app.js.map to '
  ))
})

test('fetchAndUploadOne(): Fetch mode failure to get source map (generic Error)', async () => {
  const err = new Error('misc error')

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred during the request to http://react-native-bundler:1234'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get source map (generic NetworkError)', async () => {
  const err = new NetworkError('misc error')

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred during the request to http://react-native-bundler:1234'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get source map (connection refused)', async () => {
  const err = new NetworkError('connection refused')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.CONNECTION_REFUSED

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Unable to connect to http://react-native-bundler:1234. Is the server running?'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get source map (server error)', async () => {
  const err = new NetworkError('broken')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.SERVER_ERROR

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Received an error from the server at http://react-native-bundler:1234. Does the entry point file 'index.js' exist?"),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get source map (timeout)', async () => {
  const err = new NetworkError('timeout')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.TIMEOUT

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('The request to http://react-native-bundler:1234 timed out.'),
      err
    )
  }
})

test('fethchAndUploadOne(): Fetch mode failure to get bundle (generic Error)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))

  const err = new Error('misc error')

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred during the request to http://react-native-bundler:1234'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get bundle (generic NetworkError)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))

  const err = new NetworkError('misc error')

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred during the request to http://react-native-bundler:1234'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get bundle (connection refused)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))

  const err = new NetworkError('connection refused')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.CONNECTION_REFUSED

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Unable to connect to http://react-native-bundler:1234. Is the server running?'),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get bundle (server error)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))

  const err = new NetworkError('broken')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.SERVER_ERROR

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Received an error from the server at http://react-native-bundler:1234. Does the entry point file 'index.js' exist?"),
      err
    )
  }
})

test('fetchAndUploadOne(): Fetch mode failure to get bundle (timeout)', async () => {
  const directory = path.join(__dirname, 'fixtures/react-native-android')
  const sourceMap = await fs.readFile(path.resolve(directory, 'bundle.js.map'))

  const err = new NetworkError('timeout')
  err.cause = new Error('network error')
  err.code = NetworkErrorCode.TIMEOUT

  const mockedFetch = fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockResolvedValueOnce(sourceMap.toString())
  mockedFetch.mockRejectedValue(err)

  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  try {
    await fetchAndUploadOne({
      endpoint: 'https://upload.bugsnag.com/react-native-source-map',
      apiKey: '123',
      overwrite: true,
      dev: true,
      platform: 'android',
      bundlerUrl: 'http://react-native-bundler:1234',
      appVersion: '1.2.3',
      projectRoot: path.join(__dirname, 'fixtures/react-native-android'),
      logger: mockLogger
    })
  } catch (e) {
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 'http://react-native-bundler:1234/index.js.map?platform=android&dev=true')
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 'http://react-native-bundler:1234/index.bundle?platform=android&dev=true')
    expect(mockedRequest).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('The request to http://react-native-bundler:1234 timed out.'),
      err
    )
  }
})
