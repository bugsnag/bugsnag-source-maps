import { NetworkErrorCode, NetworkError } from '../../NetworkError'

function formatErrorLog (e: NetworkError): string {
  let str = ''
  switch (e.code) {
    case NetworkErrorCode.EMPTY_FILE:
      str += 'The uploaded source map was empty.'
      break
    case NetworkErrorCode.INVALID_API_KEY:
      str += 'The provided API key was invalid.'
      break
    case NetworkErrorCode.MISC_BAD_REQUEST:
      str += 'The request was rejected by the server as invalid.'
      str += `\n\n  responseText = ${e.responseText}`
      break
    case NetworkErrorCode.DUPLICATE:
      str += 'A source map matching the same criteria has already been uploaded. ' +
        'If you want to replace it, use the "overwrite" flag (or remove the "no-overwrite" flag).'
      break
    case NetworkErrorCode.SERVER_ERROR:
      str += 'A server side error occurred while processing the upload.'
      str += `\n\n  responseText = ${e.responseText}`
      break
    case NetworkErrorCode.TIMEOUT:
      str += 'The request timed out.'
      break
    default:
      str += 'An unexpected error occurred.'
  }
  str += `\n\n`
  return str
}

export default formatErrorLog
