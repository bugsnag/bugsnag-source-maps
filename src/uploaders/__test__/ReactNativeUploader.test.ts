import ReactNativeUploader from '../ReactNativeUploader'
import { Platform } from '../../react-native/Platform'
import { VersionType } from '../../react-native/Version'
import { SourceMapRetrievalType } from '../../react-native/SourceMapRetrieval'
import request from '../../Request'
import File from '../../File'
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

test('uploadOne(): dispatches a request with the correct params for Android with appVersion', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: { type: Platform.Android },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.AppVersion,
      appVersion: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
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

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: { type: Platform.Ios },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.AppVersion,
      appVersion: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
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

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: {
      type: Platform.Android,
      appVersionCode: '3.2.1',
    },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.AppVersion,
      appVersion: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
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

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: {
      type: Platform.Ios,
      appBundleVersion: '4.5.6',
    },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.AppVersion,
      appVersion: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
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

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: {
      type: Platform.Android,
      appVersionCode: '3.2.1', // We provide this but it should be ignored!
    },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.CodeBundleId,
      codeBundleId: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-android')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
      dev: false,
      platform: 'android',
      codeBundleId: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): dispatches a request with the correct params for iOS with codeBundleId', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockResolvedValue()

  const uploader = new ReactNativeUploader(mockLogger)

  await uploader.uploadOne({
    endpoint: 'example.com',
    apiKey: '123',
    overwrite: false,
    dev: false,
    platformOptions: {
      type: Platform.Ios,
      appBundleVersion: '4.5.6', // We provide this but it should be ignored!
    },
    retrieval: {
      type: SourceMapRetrievalType.Provided,
      sourceMap: 'bundle.js.map',
      bundle: 'bundle.js',
    },
    version: {
      type: VersionType.CodeBundleId,
      codeBundleId: '1.2.3',
    },
    projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
  })

  expect(mockedRequest).toHaveBeenCalledTimes(1)
  expect(mockedRequest).toHaveBeenCalledWith(
    'example.com',
    expect.objectContaining({
      apiKey: '123',
      overwrite: false,
      dev: false,
      platform: 'ios',
      codeBundleId: '1.2.3',
      sourceMap: expect.any(File),
      bundle: expect.any(File),
    }),
    expect.objectContaining({})
  )
})

test('uploadOne(): failure (unexpected network error) with cause', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('misc upload error')
  err.cause = new Error('network error')

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
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
  const err = new UploadError('misc upload error')

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
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

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'does-not-exist.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toMatch(/ENOENT/)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('There was an error attempting to find a source map at the following location. Is the path correct?')
    )
  }
})

test('uploadOne(): failure (bundle not found)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  mockedRequest.mockRejectedValue(new Error('network error'))

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'does-not-exist.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toMatch(/ENOENT/)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('There was an error attempting to find a bundle file at the following location. Is the path correct?')
    )
  }
})

test('uploadOne(): failure (sourcemap is invalid json)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>
  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'invalid-source-map.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/b')
    })

    expect(mockedRequest).not.toHaveBeenCalled()
  } catch (e) {
    expect(e).toBeTruthy()
    expect(e.message).toBe('Unexpected token h in JSON at position 0')
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The provided source map was not valid JSON.'))
  }
})

test('uploadOne(): failure (empty bundle)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('network error')
  err.code = UploadErrorCode.EMPTY_FILE
  err.responseText = 'empty'

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.EMPTY_FILE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The uploaded source map was empty'), expect.any(Error))
  }
})

test('uploadOne(): failure (invalid api key)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('unauthed')
  err.code = UploadErrorCode.INVALID_API_KEY
  err.responseText = 'api key wrong'

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.INVALID_API_KEY)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The provided API key was invalid'), expect.any(Error))
  }
})

test('uploadOne(): failure (misc bad request)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('misc bad request')
  err.code = UploadErrorCode.MISC_BAD_REQUEST
  err.responseText = 'server no likey'

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.MISC_BAD_REQUEST)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request was rejected by the server as invalid.\n\n  responseText = server no likey'), expect.any(Error))
  }
})

test('uploadOne(): failure (duplicate)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('duplicate')
  err.code = UploadErrorCode.DUPLICATE
  err.responseText = 'duplicate'

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.DUPLICATE)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A source map matching the same criteria has already been uploaded. If you want to replace it, use the "overwrite" flag'), expect.any(Error))
  }
})

test('uploadOne(): failure (server error)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('server error')
  err.code = UploadErrorCode.SERVER_ERROR
  err.responseText = 'internal server error'

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.SERVER_ERROR)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('A server side error occurred while processing the upload.\n\n  responseText = internal server error'), expect.any(Error))
  }
})

test('uploadOne(): failure (timeout)', async () => {
  const mockedRequest = request as jest.MockedFunction<typeof request>

  const err = new UploadError('timeout')
  err.code = UploadErrorCode.TIMEOUT

  mockedRequest.mockRejectedValue(err)

  const uploader = new ReactNativeUploader(mockLogger)

  try {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Ios,
        appBundleVersion: '4.5.6',
      },
      retrieval: {
        type: SourceMapRetrievalType.Provided,
        sourceMap: 'bundle.js.map',
        bundle: 'bundle.js',
      },
      version: {
        type: VersionType.CodeBundleId,
        codeBundleId: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-ios')
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  } catch (e) {
    expect(e).toBeTruthy()
    expect((e as UploadError).code).toBe(UploadErrorCode.TIMEOUT)
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('The request timed out'), expect.any(Error))
  }
})

test('uploadOne(): throws when given unimplemented "fetch" mode', async () => {
  const uploader = new ReactNativeUploader(mockLogger)

  expect(async () => {
    await uploader.uploadOne({
      endpoint: 'example.com',
      apiKey: '123',
      overwrite: false,
      dev: false,
      platformOptions: {
        type: Platform.Android,
        appVersionCode: '3.2.1',
      },
      retrieval: { type: SourceMapRetrievalType.Fetch },
      version: {
        type: VersionType.AppVersion,
        appVersion: '1.2.3',
      },
      projectRoot: path.join(__dirname, 'fixtures/react-native-android')
    })
  }).rejects.toThrow()
})
