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
    # TODO: Not yet implemented in Maze Runner
    # And the CLI terminates successfully (zero exitCode)
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

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
    # TODO: Not yet implemented in Maze Runner
    # And the CLI terminates successfully (zero exitCode)
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "1.2.3"
    And the payload field "overwrite" is null
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data

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
    # TODO: Not yet implemented in Maze Runner
    # And the CLI terminates successfully (zero exitCode)
    And I wait to receive 1 request
    Then the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "2.0.0"
    And the payload field "overwrite" equals "true"
    And the payload field "minifiedUrl" equals "http://myapp.url/static/js/main.js"
    And the payload field "sourceMap" matches the expected source map for "single-source-map-webpack"
    And the payload field "minifiedFile" matches the expected minified file for "single-source-map-webpack"
    And the Content-Type header is valid multipart form-data
