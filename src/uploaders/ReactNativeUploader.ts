import path from 'path'
import { promises as fs } from 'fs'

import File from '../File'
import request, { PayloadType } from '../Request'
import formatErrorLog from './FormatErrorLog'
import { Logger } from '../Logger'
import AddSources from '../transformers/AddSources'
import StripProjectRoot from '../transformers/StripProjectRoot'

export const enum Platform { Android = 'android', Ios = 'ios' }
export const enum VersionType { AppVersion, CodeBundleId }
export const enum SourceMapRetrievalType { Provided, Fetch }

interface AndroidOptions {
  readonly type: Platform.Android
  readonly appVersionCode?: string
}

interface IosOptions {
  readonly type: Platform.Ios
  readonly appBundleVersion?: string
}

interface AppVersion {
  readonly type: VersionType.AppVersion
  readonly appVersion: string
}

interface CodeBundleId {
  readonly type: VersionType.CodeBundleId
  readonly codeBundleId: string
}

// The user has provided a source map & bundle
interface ProvidedSourceMapBundlePair {
  readonly type: SourceMapRetrievalType.Provided
  readonly sourceMap: string
  readonly bundle: string
}

// We should fetch the source map & bundle from the RN bundle server
interface Fetch {
  readonly type: SourceMapRetrievalType.Fetch
}

type PlatformOptions = AndroidOptions | IosOptions
type Version = AppVersion | CodeBundleId
type SourceMapRetrieval = ProvidedSourceMapBundlePair | Fetch

interface ReactNativeUploadOptions {
  readonly apiKey: string
  readonly platformOptions: PlatformOptions
  readonly dev: boolean
  readonly overwrite: boolean
  readonly endpoint: string
  readonly projectRoot: string
  readonly version: Version
  readonly retrieval: SourceMapRetrieval
}

interface SourceMapBundlePair {
  readonly sourceMap: File
  readonly bundle: File
}

type PayloadVersionFields
  = { codeBundleId: string }
  | { appVersion: string, appVersionCode?: string, appBundleVersion?: string }

class ReactNativeUploader {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  async uploadOne(options: ReactNativeUploadOptions): Promise<void> {
    const { sourceMap, bundle } = await this.getSourceMapAndBundle(
      options.projectRoot,
      options.retrieval
    )

    this.logger.debug(`Initiating upload "${options.endpoint}"`)

    const start = new Date().getTime()

    await this.upload(
      options.endpoint,
      options.apiKey,
      options.version,
      options.platformOptions,
      options.overwrite,
      options.dev,
      sourceMap,
      bundle
    )

    const timeTaken = new Date().getTime() - start

    this.logger.success(`Success, uploaded to ${options.endpoint} in ${timeTaken}ms`)
  }

  private async getSourceMapAndBundle(
    projectRoot: string,
    retrieval: SourceMapRetrieval
  ): Promise<SourceMapBundlePair> {
    switch (retrieval.type) {
      case SourceMapRetrievalType.Fetch:
        throw new Error('SourceMapRetrievalType.Fetch is not implemented!')

      case SourceMapRetrievalType.Provided:
        return {
          sourceMap: await this.readSourceMap(projectRoot, retrieval.sourceMap),
          bundle: await this.readBundle(projectRoot, retrieval.bundle)
        }
    }
  }

  private async readSourceMap(
    projectRoot: string,
    sourceMapFilePath: string
  ): Promise<File> {
    const fullPath = path.resolve(projectRoot, sourceMapFilePath)
    this.logger.debug(`Reading source map "${sourceMapFilePath}"`)

    let sourceMap

    try {
      sourceMap = await fs.readFile(fullPath, 'utf-8')
    } catch (e) {
      this.logger.error(`There was an error attempting to find a source map at the following location. Is the path correct?\n\n  "${fullPath}"`)
      throw e
    }

    let parsedSourceMap

    try {
      parsedSourceMap = JSON.parse(sourceMap)
    } catch (e) {
      this.logger.error(`The provided source map was not valid JSON. Is this the correct file?\n\n  "${fullPath}"`)
      throw e
    }

    let transformedSourceMap
    this.logger.info('Applying transformations to source map')

    try {
      transformedSourceMap = await Promise.resolve(parsedSourceMap)
        .then(json => AddSources(fullPath, json, projectRoot, this.logger))
        .then(json => StripProjectRoot(fullPath, json, projectRoot, this.logger))
    } catch (e) {
      this.logger.error('Error applying transforms to source map', e)
      throw e
    }

    return new File(fullPath, JSON.stringify(transformedSourceMap))
  }

  private async readBundle(
    projectRoot: string,
    bundle: string
  ): Promise<File> {
    const fullPath = path.resolve(projectRoot, bundle)
    this.logger.debug(`Reading bundle file "${bundle}"`)

    try {
      return new File(fullPath, await fs.readFile(fullPath, 'utf-8'))
    } catch (e) {
      this.logger.error(`There was an error attempting to find a bundle file at the following location. Is the path correct?\n\n  "${fullPath}"`)
      throw e
    }
  }

  private async upload(
    endpoint: string,
    apiKey: string,
    version: Version,
    platformOptions: PlatformOptions,
    overwrite: boolean,
    dev: boolean,
    sourceMap: File,
    bundle: File
  ): Promise<void> {
    try {
      await request(endpoint, {
        type: PayloadType.ReactNative,
        apiKey,
        overwrite,
        dev,
        sourceMap,
        bundle,
        platform: platformOptions.type,
        ...this.marshallVersionOptions(version, platformOptions)
      }, {})
    } catch (e) {
      if (e.cause) {
        this.logger.error(formatErrorLog(e), e, e.cause)
      } else {
        this.logger.error(formatErrorLog(e), e)
      }

      throw e
    }
  }

  private marshallVersionOptions(
    version: Version,
    platformOptions: PlatformOptions
  ): PayloadVersionFields {
    switch (version.type) {
      case VersionType.AppVersion: {
        // Currently appVersionCode/appBundleVersion are only for when appVersion
        // is given and are not allowed when codeBundleId is given
        const versionOptions: PayloadVersionFields = { appVersion: version.appVersion }

        switch (platformOptions.type) {
          case Platform.Android:
            versionOptions.appVersionCode = platformOptions.appVersionCode
            break

          case Platform.Ios:
            versionOptions.appBundleVersion = platformOptions.appBundleVersion
            break
        }

        return versionOptions
      }

      case VersionType.CodeBundleId:
        return { codeBundleId: version.codeBundleId }
    }
  }
}

export default ReactNativeUploader
