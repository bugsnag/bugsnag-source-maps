Feature: Browser source map upload multiple
  Scenario: Basic success case
    When I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 3 requests
    Then the exit code is successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: Auto detecting app version
    When I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 3 requests
    Then the exit code is successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "4.5.6"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "4.5.6"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "4.5.6"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: Overwrite enabled
    When I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
        --overwrite
      """
    And I wait to receive 3 requests
    Then the exit code is successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "true"
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "true"
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "true"
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will be retried on a server failure (500 status code)
    When I set the HTTP status code for the next request to 500
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 4 requests
    Then the exit code is successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will be retried up to 5 times on a server failure (500 status code)
    When I set the HTTP status code to 500
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 5 requests
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data
    When I discard the oldest request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried and further requests will not be made if the API key is invalid (401 status code)
    When I set the HTTP status code for the next request to 401
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried and further requests will not be made if the source map is a duplicate (409 status code)
    When I set the HTTP status code for the next request to 409
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried and further requests will not be made if the bundle or source map is empty (422 status code)
    When I set the HTTP status code for the next request to 422
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

  Scenario: A request will not be retried and further requests will not be made if request is bad (400 status code)
    When I set the HTTP status code for the next request to 400
    And I run the service "multiple-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://myapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 1 request
    Then the exit code is not successful
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the Content-Type header is valid multipart form-data

