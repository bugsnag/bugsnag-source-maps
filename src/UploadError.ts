export enum UploadErrorCode { UNKNOWN, DUPLICATE, TIMEOUT, MISC_BAD_REQUEST, EMPTY_FILE, INVALID_API_KEY, SERVER_ERROR }

export class UploadError extends Error {
  isRetryable = true
  code: UploadErrorCode = UploadErrorCode.UNKNOWN
  cause: Error | null = null
  responseText: string | null = null
}