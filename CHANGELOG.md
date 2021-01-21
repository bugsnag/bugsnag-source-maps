# Changelog

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