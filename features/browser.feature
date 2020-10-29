Feature: Browser source map uploads

  Scenario:

    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-map upload-browser --api-key 123
                                        --source-map dist/main.js.map
                                        --bundle dist/main.js
                                        --bundle-url http://myapp.url/static/js/main.js
                                        --endpoint http://localhost:9339
      """
#    And the server responds with HTTP 200
#    Then the CLI terminates successfully (zero exitCode)
    And I wait to receive 1 request
#    Then the content-type header is form/multipart
#    And the form field apiKey is '123'
#    And the form field sourceMap matches the JSON in fixture xyz¹
#    And the form field appVersion is 1.0.0²
#    And the form field minifiedFile is the same as main.js
#    And the form field bundleUrl is http://myapp.url/static/js/main.js
#    And the form field overwrite is not set
