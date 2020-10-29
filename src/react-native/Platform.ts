interface AndroidOptions {
  readonly type: Platform.Android
  readonly appVersionCode?: string
}

interface IosOptions {
  readonly type: Platform.Ios
  readonly appBundleVersion?: string
}

export const enum Platform { Android = 'android', Ios = 'ios' }
export type PlatformOptions = AndroidOptions | IosOptions
