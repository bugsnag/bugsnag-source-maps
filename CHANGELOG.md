# Changelog

## Unreleased

### Security

- Add dependency resolution for `semver` to fix ReDoS vulnerability [#92](https://github.com/bugsnag/bugsnag-source-maps/pull/92)

## 2.3.1 (2022-02-04)

### Fixed

- handle the webpack 5 default devtoolModuleFilenameTemplate format [#78](https://github.com/bugsnag/bugsnag-source-maps/pull/78)

## 2.3.0 (2021-08-05)

- Add `--idle-timeout` flag to control the HTTP request timeout ([see Node documentation](https://nodejs.org/api/http.html#http_request_settimeout_timeout_callback)) [#74](https://github.com/bugsnag/bugsnag-source-maps/pull/74)
- Increase the default HTTP request timeout to 10 minutes (from 5 minutes) [#74](https://github.com/bugsnag/bugsnag-source-maps/pull/74)

## 2.2.0 (2021-07-05)

### Added

- Support `--overwrite` and `--no-overwrite` everywhere [#66](https://github.com/bugsnag/bugsnag-source-maps/pull/66)

## 2.1.0 (2021-05-18)

### Added

- Add support for `codeBundleId` on node and browser uploads [#61](https://github.com/bugsnag/bugsnag-source-maps/pull/61)

### Changed

- Always use `/` as the path separator in the uploaded `minifiedUrl` for Node [#60](https://github.com/bugsnag/bugsnag-source-maps/pull/60)

### Fixed

- Strip the project root from source maps created on Windows [#60](https://github.com/bugsnag/bugsnag-source-maps/pull/60)

## 2.0.0 (2021-01-21)

## Breaking

- Default `overwrite=true` for React Native upload [#50](https://github.com/bugsnag/bugsnag-source-maps/pull/50)
- Remove `--overwrite` flag from React Native uploads command and add `--no-overwrite` [#50](https://github.com/bugsnag/bugsnag-source-maps/pull/50)

Note: using the `--overwrite` option with the `upload-react-native` command will now fail because the flag has been removed.

## 1.0.1 (2020-12-14)

## Changed

- Automatically set an appropriate path on the endpoint URL unless one is explicitly provided [#48](https://github.com/bugsnag/bugsnag-source-maps/pull/48)

## 1.0.0 (2020-12-10)

Initial release.
