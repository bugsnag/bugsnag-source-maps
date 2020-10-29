### end-to-end tests

The end-to-end tests use the Maze Runner test harness to invoke various commands against the Source Maps CLI, using 
a mock HTTP server to capture and inspect requests sent.

To run the tests, first build the JavaScript package, `bugsnag-source-maps.tgz`, that will be installed into each
test fixture:

```shell script
features/scripts/create_package.sh
```

All tests can then be run with the following, which uses the version of Maze Runner specified in `Gemfile`.

```shell script
bundle exec maze-runner
```

For extra output:

```shell script
DEBUG=true bundle exec maze-runner
```
