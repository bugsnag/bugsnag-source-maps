interface AppVersion {
  readonly type: VersionType.AppVersion
  readonly appVersion: string
}

interface CodeBundleId {
  readonly type: VersionType.CodeBundleId
  readonly codeBundleId: string
}

export const enum VersionType { AppVersion, CodeBundleId }
export type Version = AppVersion | CodeBundleId
