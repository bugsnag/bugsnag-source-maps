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
    And I wait to receive 1 sourcemap
    Then the last run docker command exited successfully
    And the Content-Type header is valid multipart form-data
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "dev" equals "<dev>"
    And the sourcemap payload field "platform" equals "<platform>"
    And the sourcemap payload field "sourceMap" matches the expected source map for "<expected directory>"
    And the sourcemap payload field "bundle" matches the expected bundle for "<expected directory>"

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

  Scenario: A request will be retried on a server failure (500 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code for the next request to 500
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 2 sourcemaps
    Then the last run docker command exited successfully
    And the Content-Type header is valid multipart form-data for all requests
    And the sourcemap payload field "apiKey" equals "123" for all requests
    And the sourcemap payload field "appVersion" equals "2.0.0" for all requests
    And the sourcemap payload field "overwrite" equals "true" for all requests
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios" for all requests
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios" for all requests

  Scenario: A request will be retried up to 5 times on a server failure (500 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code to 500
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 5 sourcemaps
    Then the last run docker command did not exit successfully
    And the last run docker command output "A server side error occurred while processing the upload."
    And the last run docker command output "HTTP status 500 received from upload API"
    And the Content-Type header is valid multipart form-data for all requests
    And the sourcemap payload field "apiKey" equals "123" for all requests
    And the sourcemap payload field "appVersion" equals "2.0.0" for all requests
    And the sourcemap payload field "overwrite" equals "true" for all requests
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios" for all requests
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios" for all requests

  Scenario: A request will not be retried if the API key is invalid (401 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code for the next request to 401
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The provided API key was invalid."
    And the last run docker command output "HTTP status 401 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios"
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if the source map is a duplicate (409 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code for the next request to 409
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "A source map matching the same criteria has already been uploaded. If you want to replace it, remove the \"no-overwrite\" flag."
    And the last run docker command output "HTTP status 409 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios"
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if the bundle or source map is empty (422 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code for the next request to 422
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The uploaded source map was empty."
    And the last run docker command output "HTTP status 422 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios"
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if request is bad (400 status code)
    When I start the service "react-native-0-60-bundler"
    And I wait for 2 seconds
    And I set the HTTP status code for the next request to 400
    And I run the service "react-native-0-60-fetch" with the command
    """
    bugsnag-source-maps upload-react-native
      --api-key 123
      --app-version 2.0.0
      --endpoint http://maze-runner:9339
      --fetch
      --bundler-url http://react-native-0-60-bundler:9449
      --platform ios
    """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The request was rejected by the server as invalid."
    And the last run docker command output "HTTP status 400 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "sourceMap" matches the expected source map for "fetch-react-native-0-60-ios"
    And the sourcemap payload field "bundle" matches the expected bundle for "fetch-react-native-0-60-ios"
    And the Content-Type header is valid multipart form-data
