import { URL } from 'url'

export const DEFAULT_UPLOAD_ORIGIN = 'https://upload.bugsnag.com'

export function buildEndpointUrl (origin: string, path: string): string {
  const url = new URL(origin)
  
  // if no path was given use the default
  if (url.pathname === '/') {
    url.pathname = path
  }

  return url.toString()
}
