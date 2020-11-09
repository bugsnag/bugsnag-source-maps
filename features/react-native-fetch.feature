Feature: React native source map fetch mode
  Scenario Outline: Basic success case
    When I start the service "react-native-<version>-bundler"
    And I wait for 2 seconds
    And I run the service "react-native-<version>-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-<version>-bundler:9449
      --platform <platform>
      <flags>
    """
    And I wait to receive 1 request
    Then the exit code is successful
    And the Content-Type header is valid multipart form-data
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "false"
    And the payload field "dev" equals "<dev>"
    And the payload field "platform" equals "<platform>"
    # TODO(PLAT-5396) transforms are not applied so the source maps won't match
    # And the payload field "sourceMap" matches the expected source map for "<TODO>"
    And the payload field "bundle" matches the expected bundle for "<expected directory>"

  Examples:
    | platform | dev   | flags | version | expected directory                  |
    | ios      | true  | --dev | 0-60    | fetch-react-native-0-60-ios-dev     |
    | ios      | true  | --dev | 0-61    | fetch-react-native-0-61-ios-dev     |
    | ios      | true  | --dev | 0-62    | fetch-react-native-0-62-ios-dev     |
    | ios      | true  | --dev | 0-63    | fetch-react-native-0-63-ios-dev     |
    | ios      | false |       | 0-60    | fetch-react-native-0-60-ios         |
    | ios      | false |       | 0-61    | fetch-react-native-0-61-ios         |
    | ios      | false |       | 0-62    | fetch-react-native-0-62-ios         |
    | ios      | false |       | 0-63    | fetch-react-native-0-63-ios         |
    | android  | true  | --dev | 0-60    | fetch-react-native-0-60-android-dev |
    | android  | true  | --dev | 0-61    | fetch-react-native-0-61-android-dev |
    | android  | true  | --dev | 0-62    | fetch-react-native-0-62-android-dev |
    | android  | true  | --dev | 0-63    | fetch-react-native-0-63-android-dev |
    | android  | false |       | 0-60    | fetch-react-native-0-60-android     |
    | android  | false |       | 0-61    | fetch-react-native-0-61-android     |
    | android  | false |       | 0-62    | fetch-react-native-0-62-android     |
    | android  | false |       | 0-63    | fetch-react-native-0-63-android     |
