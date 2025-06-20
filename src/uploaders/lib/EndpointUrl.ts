export const DEFAULT_UPLOAD_ORIGIN = 'https://upload.bugsnag.com'

/** Hub keys start with five 0s */
export const HUB_PREFIX        = '00000'
export const HUB_UPLOAD_ORIGIN = 'https://upload.insighthub.smartbear.com'

/**
 * If the caller hasn’t specified a custom --endpoint and the apiKey looks like
 * an InsightHub key, silently flip the origin to the Hub uploader.
 */
export function selectUploadOrigin (apiKey: string,
                                    endpoint: string | undefined): string {
  if ((endpoint === undefined || endpoint === DEFAULT_UPLOAD_ORIGIN) &&
      apiKey.startsWith(HUB_PREFIX)) {
    return HUB_UPLOAD_ORIGIN
  }
  return endpoint ?? DEFAULT_UPLOAD_ORIGIN
}

export function buildEndpointUrl (origin: string, path: string): string {
  const url = new URL(origin)
  if (url.pathname === '/') { url.pathname = path }
  return url.toString()
}