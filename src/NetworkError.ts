export enum NetworkErrorCode {
  UNKNOWN,
  DUPLICATE,
  TIMEOUT,
  MISC_BAD_REQUEST,
  EMPTY_FILE,
  INVALID_API_KEY,
  SERVER_ERROR,
  CONNECTION_REFUSED,
  NOT_FOUND,
}

export class NetworkError extends Error {
  isRetryable = true
  code: NetworkErrorCode = NetworkErrorCode.UNKNOWN
  cause: Error | null = null
  responseText: string | null = null
}
