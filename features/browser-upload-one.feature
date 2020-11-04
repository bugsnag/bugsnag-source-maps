Feature: Browser source map upload one
  Scenario: Basic success case
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
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the exit code is successful

  Scenario: Auto detecting app version
    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --source-map dist/main.js.map
        --bundle dist/main.js
        --bundle-url "http://myapp.url/static/js/main.js"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "1.2.3"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the exit code is successful

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
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "true"
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the exit code is successful

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
    And I wait to receive 2 requests
    Then the exit code is successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And I discard the oldest request
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

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
    And I wait to receive 5 requests
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And I discard the oldest request
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And I discard the oldest request
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

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
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
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
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
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
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
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
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
