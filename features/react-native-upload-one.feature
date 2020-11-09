Feature: React native source map upload one
  Scenario Outline: Basic success case
    When I run the service "<service>" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
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
    And the payload field "sourceMap" matches the expected source map for "<service>"
    And the payload field "bundle" matches the expected bundle for "<service>"

  Examples:
    | platform | dev   | flags | service                                         |
    | ios      | true  | --dev | single-source-map-react-native-0-60-ios-dev     |
    | ios      | true  | --dev | single-source-map-react-native-0-61-ios-dev     |
    | ios      | true  | --dev | single-source-map-react-native-0-62-ios-dev     |
    | ios      | false |       | single-source-map-react-native-0-60-ios         |
    | ios      | false |       | single-source-map-react-native-0-61-ios         |
    | ios      | false |       | single-source-map-react-native-0-62-ios         |
    | android  | true  | --dev | single-source-map-react-native-0-60-android-dev |
    | android  | true  | --dev | single-source-map-react-native-0-61-android-dev |
    | android  | true  | --dev | single-source-map-react-native-0-62-android-dev |
    | android  | false |       | single-source-map-react-native-0-60-android     |
    | android  | false |       | single-source-map-react-native-0-61-android     |
    | android  | false |       | single-source-map-react-native-0-62-android     |
