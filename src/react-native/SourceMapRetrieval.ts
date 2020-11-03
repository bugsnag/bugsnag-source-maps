export const enum SourceMapRetrievalType { Provided, Fetch }

// The user has provided a source map & bundle
interface ProvidedSourceMapBundlePair {
  readonly type: SourceMapRetrievalType.Provided
  readonly sourceMap: string
  readonly bundle: string
}

// We should fetch the source map & bundle from the RN bundle server
interface Fetch {
  readonly type: SourceMapRetrievalType.Fetch
  readonly url: string
  readonly entryPoint: string
}

export type SourceMapRetrieval = ProvidedSourceMapBundlePair | Fetch
