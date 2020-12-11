export const DEFAULT_UPLOAD_ORIGIN = 'https://upload.bugsnag.com'

export function buildEndpointUrl (origin: string, path: string): string {
  const url = new URL(origin)
  // if more than a full origin was given, use the provided URL as-is
  if (url.pathname !== '/') return url.toString()
  return new URL(path, origin).toString()
}