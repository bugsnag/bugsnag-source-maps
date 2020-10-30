import { UploadErrorCode, UploadError } from '../UploadError'

function formatErrorLog (e: UploadError): string {
  let str = ''
  switch (e.code) {
    case UploadErrorCode.EMPTY_FILE:
      str += 'The uploaded source map was empty.'
      break
    case UploadErrorCode.INVALID_API_KEY:
      str += 'The provided API key was invalid.'
      break
    case UploadErrorCode.MISC_BAD_REQUEST:
      str += 'The request was rejected by the server as invalid.'
      str += `\n\n  responseText = ${e.responseText}`
      break
    case UploadErrorCode.DUPLICATE:
      str += 'A source map matching the same criteria has already been uploaded. If you want to replace it, use the "overwrite" flag.'
      break
    case UploadErrorCode.SERVER_ERROR:
      str += 'A server side error occurred while processing the upload.'
      str += `\n\n  responseText = ${e.responseText}`
      break
    case UploadErrorCode.TIMEOUT:
      str += 'The request timed out.'
      break
    default:
      str += 'An unexpected error occured.'
  }
  str += `\n\n`
  return str
}

export default formatErrorLog
