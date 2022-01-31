Feature: Browser source map upload one
  Scenario: Basic success case (webpack)
    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: Basic success case (babel)
    When I run the service "single-source-map-babel-browser" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/compiled.js.map
        --bundle dist/compiled.js
        --bundle-url "http://mybabelapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://mybabelapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-babel-browser"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-babel-browser"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: Basic success case (typescript)
    When I run the service "single-source-map-typescript" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/out.js.map
        --bundle dist/out.js
        --bundle-url "http://myapp.url/static/js/out.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/out.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-typescript"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-typescript"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: Detected app version
    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --detect-app-version
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "1.2.3"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: codeBundleId support
    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --code-bundle-id r0125
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "codeBundleId" equals "r0125"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: Overwrite enabled
    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
        --overwrite
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" equals "true"
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully

  Scenario: A request will be retried on a server failure (500 status code)
    When I set the HTTP status code for the next request to 500
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 2 sourcemap
    Then the last run docker command exited successfully
    And the Content-Type header is valid multipart form-data for all requests
    And the sourcemap payload field "apiKey" equals "123" for all requests
    And the sourcemap payload field "appVersion" equals "2.0.0" for all requests
    And the sourcemap payload field "overwrite" is null for all requests
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And I discard the oldest sourcemap
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"

  Scenario: A request will be retried up to 5 times on a server failure (500 status code)
    When I set the HTTP status code to 500
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 5 sourcemaps
    Then the last run docker command did not exit successfully
    And the last run docker command output "A server side error occurred while processing the upload."
    And the last run docker command output "HTTP status 500 received from upload API"
    And the Content-Type header is valid multipart form-data for all requests
    And the sourcemap payload field "apiKey" equals "123" for all requests
    And the sourcemap payload field "appVersion" equals "2.0.0" for all requests
    And the sourcemap payload field "overwrite" is null for all requests
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js" for all requests
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack" for all requests
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack" for all requests

  Scenario: A request will not be retried if the API key is invalid (401 status code)
    When I set the HTTP status code for the next request to 401
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The provided API key was invalid."
    And the last run docker command output "HTTP status 401 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if the source map is a duplicate (409 status code)
    When I set the HTTP status code for the next request to 409
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "A source map matching the same criteria has already been uploaded. If you want to replace it, use the \"overwrite\" flag."
    And the last run docker command output "HTTP status 409 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if the bundle or source map is empty (422 status code)
    When I set the HTTP status code for the next request to 422
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The uploaded source map was empty."
    And the last run docker command output "HTTP status 422 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried if request is bad (400 status code)
    When I set the HTTP status code for the next request to 400
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the last run docker command did not exit successfully
    And the last run docker command output "The request was rejected by the server as invalid."
    And the last run docker command output "HTTP status 400 received from upload API"
    And the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request can set a timeout using the --idle-timeout flag
    When I set the response delay to 5000 milliseconds
    And I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
        --idle-timeout 0.0008 # approx 50ms in minutes
      """
    Then the last run docker command did not exit successfully
    And the last run docker command output "The request timed out."
    When I wait to receive 5 sourcemaps
    And the Content-Type header is valid multipart form-data for all requests
    And the sourcemap payload field "apiKey" equals "123" for all requests
    And the sourcemap payload field "appVersion" equals "2.0.0" for all requests
    And the sourcemap payload field "overwrite" is null for all requests
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js" for all requests
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack" for all requests
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack" for all requests

  Scenario: Sources are added to the upload when devtool: nosources-source-map is used
    When I run the service "webpack-nosources" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 sourcemap
    Then the sourcemap payload field "apiKey" equals "123"
    And the sourcemap payload field "appVersion" equals "2.0.0"
    And the sourcemap payload field "overwrite" is null
    And the sourcemap payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the sourcemap payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the sourcemap payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the last run docker command exited successfully