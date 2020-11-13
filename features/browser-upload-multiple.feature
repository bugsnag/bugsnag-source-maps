Feature: Browser source map upload multiple
  Scenario: Basic success case (webpack)
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
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"

  Scenario: Basic success case (babel)
    When I run the service "multiple-source-map-babel-browser" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist/
        --base-url "http://mybabelapp.url/static/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 3 requests
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://mybabelapp.url/static/js/index.js"
    And the payload field "sourceMap" matches the source map "index.json" for "multiple-source-map-babel-browser"
    And the payload field "minifiedFile" matches the minified file "index.js" for "multiple-source-map-babel-browser"
    When I discard the oldest request
    Then the payload field "minifiedUrl" equals "http://mybabelapp.url/static/js/lib/a.js"
    And the payload field "sourceMap" matches the source map "a.json" for "multiple-source-map-babel-browser"
    And the payload field "minifiedFile" matches the minified file "a.js" for "multiple-source-map-babel-browser"
    When I discard the oldest request
    Then the payload field "minifiedUrl" equals "http://mybabelapp.url/static/js/lib/b.js"
    And the payload field "sourceMap" matches the source map "b.json" for "multiple-source-map-babel-browser"
    And the payload field "minifiedFile" matches the minified file "b.js" for "multiple-source-map-babel-browser"

  Scenario: Basic success case (typescript)
    When I run the service "multiple-source-map-typescript" with the command
      """
      bugsnag-source-maps upload-browser
        --api-key 123
        --app-version 2.0.0
        --directory dist
        --base-url "http://mytypescriptapp.url/js/"
        --endpoint http://maze-runner:9339
      """
    And I wait to receive 3 requests
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://mytypescriptapp.url/js/index.js"
    And the payload field "sourceMap" matches the source map "index.json" for "multiple-source-map-typescript"
    And the payload field "minifiedFile" matches the minified file "index.js" for "multiple-source-map-typescript"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://mytypescriptapp.url/js/lib/a.js"
    And the payload field "sourceMap" matches the source map "a.json" for "multiple-source-map-typescript"
    And the payload field "minifiedFile" matches the minified file "a.js" for "multiple-source-map-typescript"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://mytypescriptapp.url/js/lib/b.js"
    And the payload field "sourceMap" matches the source map "b.json" for "multiple-source-map-typescript"
    And the payload field "minifiedFile" matches the minified file "b.js" for "multiple-source-map-typescript"

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
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "4.5.6" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"

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
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" equals "true" for all requests
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"

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
    Then the last run docker command exited successfully
    And all requests are valid multipart form-data
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-cb48d68d.js"
    And the payload field "sourceMap" matches the source map "main-cb48d68d.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-cb48d68d.js" for "multiple-source-map-webpack"
    When I discard the oldest request
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-d89fcf10.js"
    And the payload field "sourceMap" matches the source map "main-d89fcf10.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-d89fcf10.js" for "multiple-source-map-webpack"

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
    Then the last run docker command did not exit successfully
    And all requests are valid multipart form-data
    And the last run docker command output  "A server side error occurred while processing the upload." to stdout
    And the last run docker command output  "HTTP status 500 received from upload API" to stdout
    And the payload field "apiKey" equals "123" for all requests
    And the payload field "appVersion" equals "2.0.0" for all requests
    And the payload field "overwrite" is null for all requests
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js" for all requests
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack" for all requests
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack" for all requests

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
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The provided API key was invalid." to stdout
    And the last run docker command output  "HTTP status 401 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the request is valid multipart form-data

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
    Then the last run docker command did not exit successfully
    And the last run docker command output  "A source map matching the same criteria has already been uploaded. If you want to replace it, use the \"overwrite\" flag." to stdout
    And the last run docker command output  "HTTP status 409 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the request is valid multipart form-data

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
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The uploaded source map was empty." to stdout
    And the last run docker command output  "HTTP status 422 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the request is valid multipart form-data

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
    Then the last run docker command did not exit successfully
    And the last run docker command output  "The request was rejected by the server as invalid." to stdout
    And the last run docker command output  "HTTP status 400 received from upload API" to stdout
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main-b3944033.js"
    And the payload field "sourceMap" matches the source map "main-b3944033.json" for "multiple-source-map-webpack"
    And the payload field "minifiedFile" matches the minified file "main-b3944033.js" for "multiple-source-map-webpack"
    And the request is valid multipart form-data
