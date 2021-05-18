# Changelog

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
