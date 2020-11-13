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
    Then the last run docker command exited successfully
    And the request is valid multipart form-data
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
    | ios      | true  | --dev | single-source-map-react-native-0-63-ios-dev     |
    | ios      | false |       | single-source-map-react-native-0-60-ios         |
    | ios      | false |       | single-source-map-react-native-0-61-ios         |
    | ios      | false |       | single-source-map-react-native-0-62-ios         |
    | ios      | false |       | single-source-map-react-native-0-63-ios         |
    | android  | true  | --dev | single-source-map-react-native-0-60-android-dev |
    | android  | true  | --dev | single-source-map-react-native-0-61-android-dev |
    | android  | true  | --dev | single-source-map-react-native-0-62-android-dev |
    | android  | true  | --dev | single-source-map-react-native-0-63-android-dev |
    | android  | false |       | single-source-map-react-native-0-60-android     |
    | android  | false |       | single-source-map-react-native-0-61-android     |
    | android  | false |       | single-source-map-react-native-0-62-android     |
    | android  | false |       | single-source-map-react-native-0-63-android     |

  Scenario: A request will be retried on a server failure (500 status code)
    When I set the HTTP status code for the next request to 500
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 2 requests
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" equals "false" for all requests
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios" for all requests
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios" for all requests

  Scenario: A request will be retried up to 5 times on a server failure (500 status code)
    When I set the HTTP status code to 500
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 5 requests
    Then the last run docker command did not exit successfully
    And the last run docker command output  "A server side error occurred while processing the upload." to stdout
    And the last run docker command output  "HTTP status 500 received from upload API" to stdout
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" equals "false" for all requests
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios" for all requests
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios" for all requests

  Scenario: A request will not be retried if the API key is invalid (401 status code)
    When I set the HTTP status code for the next request to 401
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 1 request
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The provided API key was invalid." to stdout
    And the last run docker command output  "HTTP status 401 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "false"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios"
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios"
    And the request is valid multipart form-data

  Scenario: A request will not be retried if the source map is a duplicate (409 status code)
    When I set the HTTP status code for the next request to 409
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 1 request
    Then the last run docker command did not exit successfully
    And the last run docker command output  "A source map matching the same criteria has already been uploaded. If you want to replace it, use the \"overwrite\" flag." to stdout
    And the last run docker command output  "HTTP status 409 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "false"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios"
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios"
    And the request is valid multipart form-data

  Scenario: A request will not be retried if the bundle or source map is empty (422 status code)
    When I set the HTTP status code for the next request to 422
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 1 request
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The uploaded source map was empty." to stdout
    And the last run docker command output  "HTTP status 422 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "false"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios"
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios"
    And the request is valid multipart form-data

  Scenario: A request will not be retried if request is bad (400 status code)
    When I set the HTTP status code for the next request to 400
    And I run the service "single-source-map-react-native-0-60-ios" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --source-map build/source-map.json
      --bundle build/bundle.js
      --platform ios
    """
    And I wait to receive 1 request
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The request was rejected by the server as invalid." to stdout
    And the last run docker command output  "HTTP status 400 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "false"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-react-native-0-60-ios"
    And the payload field "bundle" matches the expected bundle for "single-source-map-react-native-0-60-ios"
    And the request is valid multipart form-data
