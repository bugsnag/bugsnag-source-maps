import https from 'https'
import http from 'http'
import concat from 'concat-stream'
import url from 'url'
import FormData from 'form-data'
import { UploadError, UploadErrorCode } from './UploadError'
import File from './File'

export const enum PayloadType { Browser, ReactNative, Node }
type Payload = BrowserPayload | ReactNativePayload | NodePayload

interface BrowserPayload {
  type: PayloadType.Browser
  apiKey: string
  appVersion?: string
  minifiedUrl: string
  sourceMap: File
  minifiedFile?: File
  overwrite?: boolean
}

interface ReactNativePayload {
  type: PayloadType.ReactNative
  apiKey: string
}

interface NodePayload {
  type: PayloadType.Node
  apiKey: string
}

const MAX_ATTEMPTS = 5
const RETRY_INTERVAL_MS = parseInt(process.env.BUGSNAG_RETRY_INTERVAL_MS as string) || 1000
const TIMEOUT_MS = parseInt(process.env.BUGSNAG_TIMEOUT_MS as string) || 30000

export default async function request (endpoint: string, payload: Payload, requestOpts: http.RequestOptions): Promise<void> {
  let attempts = 0
  const go = async (): Promise<void> => {
    try {
      attempts++
      await send(endpoint, payload, requestOpts)
    } catch (err) {
      if (err && err.isRetryable !== false && attempts < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS))
        return await go()
      }
      throw err
    }
  }
  await go()
}

function createFormData (payload: Payload): FormData {
  const formData = new FormData()
  formData.append('apiKey', payload.apiKey)

  switch (payload.type) {
    case PayloadType.Browser:
      return appendBrowserFormData(formData, payload)

    case PayloadType.ReactNative:
      throw new Error('ReactNative is not implemented yet!')

    case PayloadType.Node:
      throw new Error('Node is not implemented yet!')
  }
}

function appendBrowserFormData(formData: FormData, payload: BrowserPayload): FormData {
  if (payload.appVersion) formData.append('appVersion', payload.appVersion)
  formData.append('minifiedUrl', payload.minifiedUrl)
  formData.append('sourceMap', payload.sourceMap.data, { filepath: payload.sourceMap.filepath})
  if (payload.minifiedFile) formData.append('minifiedFile', payload.minifiedFile.data, { filepath: payload.minifiedFile.filepath})
  if (payload.overwrite) formData.append('overwrite', payload.overwrite.toString())

  return formData
}

export async function send (endpoint: string, payload: Payload, requestOpts: http.RequestOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const formData = createFormData(payload)

    const parsedUrl = url.parse(endpoint)
    const req = (parsedUrl.protocol === 'https:' ? https : http).request({
      method: 'POST',
      hostname: parsedUrl.hostname,
      path: parsedUrl.path || '/',
      headers: formData.getHeaders(),
      port: parsedUrl.port || undefined,
      agent: requestOpts && requestOpts.agent
    }, res => {
      res.pipe(concat((bodyBuffer: Buffer) => {
        if (res.statusCode === 200) return resolve()
        const err = new UploadError(`HTTP status ${res.statusCode} received from upload API`)
        err.responseText = bodyBuffer.toString()
        if (!isRetryable(res.statusCode)) {
          err.isRetryable = false
        }
        if (res.statusCode && (res.statusCode >= 400 && res.statusCode < 500)) {
          switch (res.statusCode) {
            case 401:
              err.code = UploadErrorCode.INVALID_API_KEY
              break
            case 409:
              err.code = UploadErrorCode.DUPLICATE
              break
            case 422:
              err.code = UploadErrorCode.EMPTY_FILE
              break
            default:
              err.code = UploadErrorCode.MISC_BAD_REQUEST
          }
        } else {
          err.code = UploadErrorCode.SERVER_ERROR
        }
        return reject(err)
      }))
    })
    formData.pipe(req)
    req.on('error', e => {
      const err = new UploadError('Unknown connection error')
      err.cause = e
      err.code = UploadErrorCode.UNKNOWN
      reject(err)
    })
    req.setTimeout(TIMEOUT_MS, () => {
      const err = new UploadError('Connection timed out')
      err.code = UploadErrorCode.TIMEOUT
      reject(err)
      req.abort()
    })
  })
}

export function isRetryable (status?: number): boolean {
  return (
    !status || (
      status < 400 ||
      status > 499 ||
      [
        408, // timeout
        429 // too many requests
      ].indexOf(status) !== -1)
    )
}
