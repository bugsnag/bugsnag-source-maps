export interface UnsafeSourceMap {
  version?: number
  sources?: string[]
  names?: string[]
  sourcesContent?: (string | null)[]
  sections?: { map?: UnsafeSourceMap }[]
}