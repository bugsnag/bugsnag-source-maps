# @bugsnag/source-maps

## Installation

You can install @bugsnag/source-maps locally to your project:

```sh
npm install --save-dev @bugsnag/source-maps
yarn add --dev @bugsnag/source-maps
```

You can then run the CLI using the convenience tools for each package manager:

```sh
npx bugsnag-source-maps [...args]
yarn run bugsnag-source-maps [...args]
```

Or you can install the `bugsnag-source-maps` CLI tool globally on your system:

```sh
npm install --global @bugsnag/source-maps
yarn global add @bugsnag/source-maps
```

## System requirements

`@bugsnag/source-maps` requires Node.js v10+

## Usage

See the [Bugsnag docs website](https://docs.bugsnag.com/build-integrations/js/#uploading-source-maps) for full usage documentation.

```
bugsnag-source-maps --help

  bugsnag-source-maps <command>

Available commands

  upload-browser
  upload-node
  upload-react-native

Options

  -h, --help    show this message
  --version     output the version of the CLI module
```

## Bugsnag On-Premise

If you are using Bugsnag On-premise, you should use the endpoint option to set the url of your [upload server](https://docs.bugsnag.com/on-premise/single-machine/service-ports/#bugsnag-upload-server), for example:

```sh
bugsnag-source-maps upload-browser \
  --endpoint https://bugsnag.my-company.com/
  # ... other options
```

## Support

* Check out the [documentation](https://docs.bugsnag.com/build-integrations/js/#uploading-source-maps)
* [Search open and closed issues](https://github.com/bugsnag/bugsnag-source-maps/issues?q=+) for similar problems
* [Report a bug or request a feature](https://github.com/bugsnag/bugsnag-source-maps/issues/new)

## Contributing

Most updates to this repo will be made by Bugsnag employees. We are unable to accommodate significant external PRs such as features additions or any large refactoring, however minor fixes are welcome. See [contributing](CONTRIBUTING.md) for more information.

## License

This package is free software released under the MIT License. See [LICENSE.txt](./LICENSE.txt) for details.
