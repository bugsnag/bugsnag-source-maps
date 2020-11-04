Feature: Browser source map uploads

  Scenario:

    When I run the service "single-source-map-webpack" with the command
      """
      bugsnag-source-maps upload-browser --api-key 123
                                         --source-map dist/main.js.map
                                         --bundle dist/main.js
                                         --bundle-url "http://myapp.url/static/js/main.js"
                                         --endpoint http://maze-runner:9339
      """
    # TODO: Not yet implemented in Maze Runner
    # Then the CLI terminates successfully (zero exitCode)
    # TODO: Not yet implemented in Maze Runner
    # And the content-type header is form/multipart                                # Not sure if we explicitly need this, need to look closer
    # TODO: Checks to be added
    # And the form field sourceMap matches the JSON in fixture xyz
    # And the form field minifiedFile is the same as main.js                        # Haven't yet looked at this
    # TODO: Did not appear in the request
    # And the payload field "bundleUrl" equals "http://myapp.url/static/js/main.js" #

    Then I wait to receive 1 request
    And the payload field "apiKey" equals "123"
    And the payload field "appVersion" equals "1.2.3"
    And the payload field "overwrite" is null
