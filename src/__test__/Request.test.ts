import request, { PayloadType, send, isRetryable, fetch } from '../Request'
import { NetworkErrorCode } from '../NetworkError'
import http from 'http'
import { AddressInfo } from 'net'
import multiparty from 'multiparty'
import File from '../File'

// Allow 10x the request timeout time per-test
jest.setTimeout(+(process.env.BUGSNAG_TIMEOUT_MS as string) * 10)

let server: http.Server
afterEach(() => server?.close())

test('request: isRetryable()', () => {
  expect(isRetryable(undefined)).toBe(true)
  expect(isRetryable(100)).toBe(true)
  expect(isRetryable(400)).toBe(false)
  expect(isRetryable(404)).toBe(false)
  expect(isRetryable(408)).toBe(true)
  expect(isRetryable(429)).toBe(true)
  expect(isRetryable(500)).toBe(true)
})

test('request: send() successful upload', async () => {
  const received: {
    fields: Record<string, string[]>
    files: Record<string, multiparty.File[]>
  }[] = []
  server = http.createServer(async (req, res) => {
    await new Promise((resolve) => {
      const form = new multiparty.Form()
      form.parse(req, function(err, fields, files) {
        received.push({ fields, files })
        res.end('OK')
        resolve()
      });
    })
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  await send(`http://localhost:${port}`, {
    type: PayloadType.Browser,
    apiKey: '123',
    minifiedUrl: 'http://example.url',
    sourceMap: new File('dist/app.js.map', '{}'),
    minifiedFile: new File('dist/app.js', 'console.log("hello")')
  }, {})

  expect(received.length).toBe(1)

  expect(received[0].fields.apiKey[0]).toBe('123')

  expect(received[0].fields.minifiedUrl[0]).toBe('http://example.url')

  expect(received[0].files.sourceMap[0].originalFilename).toBe('dist/app.js.map')
  expect(received[0].files.sourceMap[0].headers['content-type']).toBe('application/json')

  expect(received[0].files.minifiedFile[0].originalFilename).toBe('dist/app.js')
  expect(received[0].files.minifiedFile[0].headers['content-type']).toBe('application/javascript')
})

test('request: send() successful React Native upload', async () => {
  const received: {
    fields: Record<string, string[]>
    files: Record<string, multiparty.File[]>
  }[] = []
  server = http.createServer(async (req, res) => {
    await new Promise((resolve) => {
      const form = new multiparty.Form()
      form.parse(req, function(err, fields, files) {
        received.push({ fields, files })
        res.end('OK')
        resolve()
      });
    })
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  await send(`http://localhost:${port}`, {
    type: PayloadType.ReactNative,
    apiKey: '123',
    platform: 'ios',
    appVersion: '1.0.0.0.0.1',
    appVersionCode: '0.0.0.1.2.1.0',
    codeBundleId: '123.123.123',
    appBundleVersion: '321.321.321',
    overwrite: false,
    dev: false,
    sourceMap: new File('dist/app.js.map', '{}'),
    bundle: new File('dist/app.js', 'console.log("hello")')
  }, {})

  expect(received.length).toBe(1)

  expect(received[0].fields).toEqual({
    apiKey: ['123'],
    platform: ['ios'],
    appVersion: ['1.0.0.0.0.1'],
    appVersionCode: ['0.0.0.1.2.1.0'],
    codeBundleId: ['123.123.123'],
    appBundleVersion: ['321.321.321'],
    overwrite: ['false'],
    dev: ['false'],
  })

  expect(received[0].files.sourceMap[0].originalFilename).toBe('dist/app.js.map')
  expect(received[0].files.sourceMap[0].headers['content-type']).toBe('application/json')

  expect(received[0].files.bundle[0].originalFilename).toBe('dist/app.js')
  expect(received[0].files.bundle[0].headers['content-type']).toBe('application/javascript')
})

test('request: send() successful upload (with overwrite, appVersion)', async () => {
  const received: {
    fields: Record<string, string[]>
    files: Record<string, multiparty.File[]>
  }[] = []
  server = http.createServer(async (req, res) => {
    await new Promise((resolve) => {
      const form = new multiparty.Form()
      form.parse(req, function(err, fields, files) {
        received.push({ fields, files })
        res.end('OK')
        resolve()
      });
    })
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  await send(`http://localhost:${port}`, {
    type: PayloadType.Browser,
    apiKey: '123',
    appVersion: '1.2.3',
    minifiedUrl: 'http://example.url',
    sourceMap: new File('dist/app.js.map', '{}'),
    overwrite: true
  }, {})

  expect(received.length).toBe(1)

  expect(received[0].fields.apiKey[0]).toBe('123')

  expect(received[0].fields.appVersion[0]).toBe('1.2.3')

  expect(received[0].fields.overwrite[0]).toBe('true')

  expect(received[0].fields.minifiedUrl[0]).toBe('http://example.url')

  expect(received[0].files.sourceMap[0].originalFilename).toBe('dist/app.js.map')
  expect(received[0].files.sourceMap[0].headers['content-type']).toBe('application/json')
})

test('request: send() unsuccessful upload (invalid, no retry)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 400
    res.end('invalid')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.MISC_BAD_REQUEST)
  }
})

test('request: send() unsuccessful upload (invalid, empty file)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 422
    res.end('empty file')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.EMPTY_FILE)
  }
})

test('request: send() unsuccessful upload (misc 40x code)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 404
    res.end('not found')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.MISC_BAD_REQUEST)
  }
})

test('request: send() unsuccessful upload (unauthed, no retry)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 401
    res.end('unauthenticated')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.INVALID_API_KEY)
  }
})

test('request: send() unsuccessful upload (retryable status)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 500
    res.end('server error')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(true)
    expect(e.code).toBe(NetworkErrorCode.SERVER_ERROR)
    expect(e.responseText).toBe('server error')
  }
})

test('request: send() unsuccessful upload (timeout)', async () => {
  server = http.createServer(async () => {
    // intentionally hang
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(true)
    expect(e.code).toBe(NetworkErrorCode.TIMEOUT)
  }
})

test('request: send() unsuccessful upload (duplicate)', async () => {
  server = http.createServer(async (req, res) => {
    res.statusCode = 409
    res.end('duplicate')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await send(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.DUPLICATE)
  }
})

test('request: request() multiple attempts at retryable errors', async () => {
  let requestsReceived = 0
  server = http.createServer(async () => {
    // intentionally hang
    requestsReceived += 1
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  try {
    await request(`http://localhost:${port}`, {
      type: PayloadType.Browser,
      apiKey: '123',
      minifiedUrl: 'http://example.url',
      sourceMap: new File('dist/app.js.map', '{}'),
      minifiedFile: new File('dist/app.js', 'console.log("hello")')
    }, {})
  } catch (e) {
    expect(requestsReceived).toBe(5)
    expect(e.code).toBe(NetworkErrorCode.TIMEOUT)
  }
})

test('request: request() multiple attempts, eventually succeeds', async () => {
  let requestsReceived = 0
  server = http.createServer(async (req, res) => {
    // intentionally hang
    requestsReceived += 1
    if (requestsReceived > 3) res.end('OK')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port
  await request(`http://localhost:${port}`, {
    type: PayloadType.Browser,
    apiKey: '123',
    minifiedUrl: 'http://example.url',
    sourceMap: new File('dist/app.js.map', '{}'),
    minifiedFile: new File('dist/app.js', 'console.log("hello")')
  }, {})

  expect(requestsReceived).toBe(4)
})

test('request: request() React Native payload, multiple attempts, eventually succeeds', async () => {
  let requestsReceived = 0
  server = http.createServer(async (req, res) => {
    // intentionally hang
    requestsReceived += 1
    if (requestsReceived > 3) res.end('OK')
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port
  await request(`http://localhost:${port}`, {
    type: PayloadType.ReactNative,
    apiKey: '123',
    platform: 'ios',
    appVersion: '1.0.0.0.0.1',
    appVersionCode: '0.0.0.1.2.1.0',
    overwrite: false,
    dev: false,
    sourceMap: new File('dist/app.js.map', '{}'),
    bundle: new File('dist/app.js', 'console.log("hello")')
  }, {})

  expect(requestsReceived).toBe(4)
})

test('request: send() successful Node upload', async () => {
  const received: {
    fields: Record<string, string[]>
    files: Record<string, multiparty.File[]>
  }[] = []
  server = http.createServer(async (req, res) => {
    await new Promise((resolve) => {
      const form = new multiparty.Form()
      form.parse(req, function(err, fields, files) {
        received.push({ fields, files })
        res.end('OK')
        resolve()
      });
    })
  })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port

  await send(`http://localhost:${port}`, {
    type: PayloadType.Node,
    apiKey: '123',
    appVersion: '1.2.3',
    sourceMap: new File('dist/app.js.map', '{}'),
    minifiedFile: new File('dist/app.js', 'console.log("hello")'),
    minifiedUrl: 'dist/app.js'
  }, {})

  expect(received.length).toBe(1)

  expect(received[0].fields).toEqual({
    apiKey: ['123'],
    appVersion: ['1.2.3'],
    minifiedUrl: ['dist/app.js']
  })

  expect(received[0].files.sourceMap[0].originalFilename).toBe('dist/app.js.map')
  expect(received[0].files.sourceMap[0].headers['content-type']).toBe('application/json')

  expect(received[0].files.minifiedFile[0].originalFilename).toBe('dist/app.js')
  expect(received[0].files.minifiedFile[0].headers['content-type']).toBe('application/javascript')
})

test('request: fetch() successful request', async () => {
  server = http.createServer((req, res) => { res.end('OK') })

  await new Promise((resolve) => server.listen(() => resolve()))

  const port = (server.address() as AddressInfo).port
  const response = await fetch(`http://localhost:${port}`)

  expect(response).toBe('OK')
})

test('request: fetch() unsuccessful (bad request)', async () => {
  server = http.createServer((req, res) => {
    res.statusCode = 400
    res.end('invalid')
  })

  await new Promise((resolve) => server.listen(() => resolve()))
  const port = (server.address() as AddressInfo).port

  try {
    const response = await fetch(`http://localhost:${port}`)
    expect(response).toBe('abc')
  } catch (e) {
    expect(e.isRetryable).toBe(false)
    expect(e.code).toBe(NetworkErrorCode.MISC_BAD_REQUEST)
  }
})

test('request: fetch() unsuccessful (server error)', async () => {
  server = http.createServer((req, res) => {
    res.statusCode = 500
    res.end('invalid')
  })

  await new Promise((resolve) => server.listen(() => resolve()))
  const port = (server.address() as AddressInfo).port

  try {
    const response = await fetch(`http://localhost:${port}`)
    expect(response).toBe('abc')
  } catch (e) {
    expect(e.isRetryable).toBe(true)
    expect(e.code).toBe(NetworkErrorCode.SERVER_ERROR)
  }
})

test('request: fetch() unsuccessful (timeout)', async () => {
  server = http.createServer(async () => {
    // intentionally hang
  })

  await new Promise((resolve) => server.listen(() => resolve()))
  const port = (server.address() as AddressInfo).port

  try {
    const response = await fetch(`http://localhost:${port}`)
    expect(response).toBe('abc')
  } catch (e) {
    expect(e.isRetryable).toBe(true)
    expect(e.code).toBe(NetworkErrorCode.TIMEOUT)
  }
})
