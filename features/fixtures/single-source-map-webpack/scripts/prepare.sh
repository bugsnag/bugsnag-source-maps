#!/usr/bin/env sh
set -ex
rm -rf node_modules
npm install
npm install -g ./build/bugsnag-source-maps.tgz
npm run build
